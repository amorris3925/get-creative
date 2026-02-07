#!/usr/bin/env npx tsx
/**
 * Backup current ZurichV2.tsx before migration
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Load env manually since dotenv might not be installed
function loadEnv() {
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const COMPONENT_NAME = 'ZurichV2';
const COMPONENT_PATH = 'components/ZurichV2.tsx';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Read the component file
  const fullPath = join(process.cwd(), COMPONENT_PATH);
  const sourceCode = readFileSync(fullPath, 'utf-8');

  const sourceHash = createHash('sha256').update(sourceCode).digest('hex').substring(0, 16);
  const lineCount = sourceCode.split('\n').length;
  const fileSizeBytes = Buffer.byteLength(sourceCode, 'utf8');

  console.log(`Backing up ${COMPONENT_NAME}...`);
  console.log(`  Path: ${COMPONENT_PATH}`);
  console.log(`  Size: ${fileSizeBytes} bytes`);
  console.log(`  Lines: ${lineCount}`);
  console.log(`  Hash: ${sourceHash}`);

  // Get git info
  const { execSync } = await import('child_process');
  let gitCommitHash = '';
  let gitBranch = '';
  try {
    gitCommitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    gitBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  } catch (e) {
    console.warn('Could not get git info');
  }

  // Insert the backup
  const { data, error } = await supabase
    .from('ic_component_backups')
    .insert({
      component_name: COMPONENT_NAME,
      component_path: COMPONENT_PATH,
      source_code: sourceCode,
      source_hash: sourceHash,
      file_size_bytes: fileSizeBytes,
      line_count: lineCount,
      version_tag: process.argv[2] || 'cms-transformed',
      change_summary: process.argv[3] || 'Full CMS transformation - all content now uses data-section/data-field attributes for inline editing',
      changed_by: 'claude-code',
      change_source: 'pre-deploy',
      git_commit_hash: gitCommitHash,
      git_branch: gitBranch,
      is_production: true,
      deployed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create backup:', error);
    process.exit(1);
  }

  console.log('\nBackup created successfully!');
  console.log(`  ID: ${data.id}`);
  console.log(`  Version: ${data.version_number}`);
  console.log(`  Tag: ${data.version_tag}`);
  console.log(`  Is Production: ${data.is_production}`);
}

main().catch(console.error);
