import { createAdminClient } from '@/lib/supabase/admin';
import { createHash } from 'crypto';

export type ChangeSource = 'manual' | 'pre-deploy' | 'rollback' | 'auto-backup';

export interface ComponentBackup {
  id: string;
  component_name: string;
  component_path: string;
  version_number: number;
  version_tag: string | null;
  source_code: string;
  source_hash: string;
  file_size_bytes: number;
  line_count: number;
  change_summary: string | null;
  changed_by: string;
  change_source: ChangeSource;
  dependencies: Record<string, string>;
  git_commit_hash: string | null;
  git_branch: string | null;
  is_production: boolean;
  created_at: string;
  deployed_at: string | null;
}

export interface CreateBackupOptions {
  componentName: string;
  componentPath: string;
  sourceCode: string;
  versionTag?: string;
  changeSummary?: string;
  changedBy?: string;
  changeSource: ChangeSource;
  dependencies?: Record<string, string>;
  gitCommitHash?: string;
  gitBranch?: string;
  isProduction?: boolean;
}

/**
 * Compute SHA-256 hash of source code
 */
export function computeSourceHash(sourceCode: string): string {
  return createHash('sha256').update(sourceCode).digest('hex').substring(0, 16);
}

/**
 * Create a new component backup
 */
export async function createComponentBackup(
  options: CreateBackupOptions
): Promise<{ success: boolean; backup?: ComponentBackup; error?: string }> {
  try {
    const supabase = createAdminClient();

    const sourceHash = computeSourceHash(options.sourceCode);
    const lineCount = options.sourceCode.split('\n').length;
    const fileSizeBytes = Buffer.byteLength(options.sourceCode, 'utf8');

    // If marking as production, unmark previous production version
    if (options.isProduction) {
      await supabase
        .from('ic_component_backups')
        .update({ is_production: false })
        .eq('component_name', options.componentName)
        .eq('is_production', true);
    }

    const { data, error } = await supabase
      .from('ic_component_backups')
      .insert({
        component_name: options.componentName,
        component_path: options.componentPath,
        version_tag: options.versionTag || null,
        source_code: options.sourceCode,
        source_hash: sourceHash,
        file_size_bytes: fileSizeBytes,
        line_count: lineCount,
        change_summary: options.changeSummary || null,
        changed_by: options.changedBy || 'system',
        change_source: options.changeSource,
        dependencies: options.dependencies || {},
        git_commit_hash: options.gitCommitHash || null,
        git_branch: options.gitBranch || null,
        is_production: options.isProduction || false,
        deployed_at: options.isProduction ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create backup:', error);
      return { success: false, error: error.message };
    }

    return { success: true, backup: data as ComponentBackup };
  } catch (err) {
    console.error('Error creating backup:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * List all backups for a component
 */
export async function listComponentBackups(
  componentName: string,
  limit: number = 50
): Promise<ComponentBackup[]> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('ic_component_backups')
      .select('*')
      .eq('component_name', componentName)
      .order('version_number', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to list backups:', error);
      return [];
    }

    return (data || []) as ComponentBackup[];
  } catch (err) {
    console.error('Error listing backups:', err);
    return [];
  }
}

/**
 * Get a specific backup by ID
 */
export async function getBackupById(
  backupId: string
): Promise<ComponentBackup | null> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('ic_component_backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (error) {
      console.error('Failed to get backup:', error);
      return null;
    }

    return data as ComponentBackup;
  } catch (err) {
    console.error('Error getting backup:', err);
    return null;
  }
}

/**
 * Get the current production version of a component
 */
export async function getProductionVersion(
  componentName: string
): Promise<ComponentBackup | null> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('ic_component_backups')
      .select('*')
      .eq('component_name', componentName)
      .eq('is_production', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to get production version:', error);
      return null;
    }

    return data as ComponentBackup | null;
  } catch (err) {
    console.error('Error getting production version:', err);
    return null;
  }
}

/**
 * List all tracked components with their latest version info
 */
export async function listTrackedComponents(): Promise<
  Array<{
    component_name: string;
    component_path: string;
    version_count: number;
    latest_version: number;
    has_production: boolean;
    last_backup: string;
  }>
> {
  try {
    const supabase = createAdminClient();

    // Get distinct components with aggregates
    const { data, error } = await supabase
      .from('ic_component_backups')
      .select('component_name, component_path, version_number, is_production, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to list components:', error);
      return [];
    }

    // Aggregate by component
    const componentMap = new Map<
      string,
      {
        component_name: string;
        component_path: string;
        version_count: number;
        latest_version: number;
        has_production: boolean;
        last_backup: string;
      }
    >();

    for (const row of data || []) {
      const existing = componentMap.get(row.component_name);
      if (!existing) {
        componentMap.set(row.component_name, {
          component_name: row.component_name,
          component_path: row.component_path,
          version_count: 1,
          latest_version: row.version_number,
          has_production: row.is_production,
          last_backup: row.created_at,
        });
      } else {
        existing.version_count++;
        if (row.version_number > existing.latest_version) {
          existing.latest_version = row.version_number;
        }
        if (row.is_production) {
          existing.has_production = true;
        }
      }
    }

    return Array.from(componentMap.values());
  } catch (err) {
    console.error('Error listing components:', err);
    return [];
  }
}

/**
 * Mark a backup as the current production version
 */
export async function markAsProduction(
  backupId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    // Get the backup to find component name
    const backup = await getBackupById(backupId);
    if (!backup) {
      return { success: false, error: 'Backup not found' };
    }

    // Unmark current production
    await supabase
      .from('ic_component_backups')
      .update({ is_production: false })
      .eq('component_name', backup.component_name)
      .eq('is_production', true);

    // Mark new production
    const { error } = await supabase
      .from('ic_component_backups')
      .update({
        is_production: true,
        deployed_at: new Date().toISOString(),
      })
      .eq('id', backupId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
