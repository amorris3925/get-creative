/**
 * Sync Code Defaults to Supabase CMS
 *
 * This script syncs the default content from code to Supabase.
 * It's designed to be run from Claude Code when content changes are made.
 *
 * Usage: npx tsx scripts/sync-content.ts
 *
 * Behavior:
 * - If section doesn't exist in CMS: Creates it with code defaults
 * - If section exists but hasn't been manually edited: Updates with code defaults
 * - If section was manually edited in CMS: Flags conflict (doesn't overwrite)
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { defaultContent } from '../lib/content/defaults';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Generate a hash of the content for change detection
function hashContent(content: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex')
    .slice(0, 16);
}

async function syncDefaults() {
  console.log('🔄 Starting content sync from code to CMS...\n');

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let conflicts = 0;

  for (const [sectionKey, content] of Object.entries(defaultContent)) {
    const codeHash = hashContent(content);

    // Check if section exists in CMS
    const { data: existing, error: fetchError } = await supabase
      .from('ic_sections')
      .select('id, content, updated_at')
      .eq('page', 'home')
      .eq('section_key', sectionKey)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error(`  ❌ Error fetching ${sectionKey}:`, fetchError.message);
      continue;
    }

    if (!existing) {
      // Section doesn't exist - create it
      const { data: newRecord, error: insertError } = await supabase
        .from('ic_sections')
        .insert({
          page: 'home',
          section_key: sectionKey,
          content,
          is_visible: true,
          order_index: 0,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error(`  ❌ Error creating ${sectionKey}:`, insertError.message);
        continue;
      }

      // Log version
      await supabase.from('ic_content_versions').insert({
        table_name: 'ic_sections',
        record_id: newRecord?.id,
        change_source: 'seed',
        changed_by: 'claude-code',
        previous_content: null,
        new_content: content,
      });

      // Update sync status
      await supabase.from('ic_sync_status').upsert({
        section_key: sectionKey,
        last_code_sync: new Date().toISOString(),
        code_hash: codeHash,
        is_synced: true,
        conflict_detected: false,
      }, { onConflict: 'section_key' });

      console.log(`  ✅ Created: ${sectionKey}`);
      created++;

    } else {
      // Section exists - check if it was manually edited
      const { data: lastCmsEdit } = await supabase
        .from('ic_content_versions')
        .select('created_at')
        .eq('table_name', 'ic_sections')
        .eq('record_id', existing.id)
        .eq('change_source', 'cms')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { data: syncStatus } = await supabase
        .from('ic_sync_status')
        .select('last_code_sync, code_hash')
        .eq('section_key', sectionKey)
        .single();

      // Check if content hash has changed since last sync
      const contentChanged = syncStatus?.code_hash !== codeHash;

      if (!contentChanged) {
        console.log(`  ⏭️  Skipped: ${sectionKey} (no changes)`);
        skipped++;
        continue;
      }

      if (lastCmsEdit) {
        // CMS was edited - flag conflict
        await supabase.from('ic_sync_status').upsert({
          section_key: sectionKey,
          last_code_sync: new Date().toISOString(),
          code_hash: codeHash,
          is_synced: false,
          conflict_detected: true,
        }, { onConflict: 'section_key' });

        console.log(`  ⚠️  Conflict: ${sectionKey} (edited in CMS, not overwriting)`);
        conflicts++;

      } else {
        // Safe to update from code
        const { error: updateError } = await supabase
          .from('ic_sections')
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`  ❌ Error updating ${sectionKey}:`, updateError.message);
          continue;
        }

        // Log version
        await supabase.from('ic_content_versions').insert({
          table_name: 'ic_sections',
          record_id: existing.id,
          change_source: 'code',
          changed_by: 'claude-code',
          previous_content: existing.content,
          new_content: content,
        });

        // Update sync status
        await supabase.from('ic_sync_status').upsert({
          section_key: sectionKey,
          last_code_sync: new Date().toISOString(),
          code_hash: codeHash,
          is_synced: true,
          conflict_detected: false,
        }, { onConflict: 'section_key' });

        console.log(`  ✅ Updated: ${sectionKey}`);
        updated++;
      }
    }
  }

  console.log('\n📊 Sync Summary:');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Conflicts: ${conflicts}`);

  if (conflicts > 0) {
    console.log('\n⚠️  Conflicts detected! Review in Admin UI at /admin/sections');
  }

  console.log('\n✨ Sync complete!');
}

// Run the sync
syncDefaults().catch(console.error);
