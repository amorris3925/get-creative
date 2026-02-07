import { createAdminClient } from '@/lib/supabase/admin';

type ChangeSource = 'cms' | 'code' | 'seed';

interface VersionLog {
  table_name: string;
  record_id: string;
  change_source: ChangeSource;
  changed_by?: string;
  previous_content: Record<string, unknown> | null;
  new_content: Record<string, unknown>;
}

// Log a content version change
export async function logContentVersion({
  table_name,
  record_id,
  change_source,
  changed_by,
  previous_content,
  new_content,
}: VersionLog): Promise<boolean> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from('ic_content_versions').insert({
      table_name,
      record_id,
      change_source,
      changed_by: changed_by || (change_source === 'code' ? 'claude-code' : 'cms-admin'),
      previous_content,
      new_content,
    });

    if (error) {
      console.error('Failed to log version:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error logging version:', err);
    return false;
  }
}

// Get version history for a record
export async function getVersionHistory(
  table_name: string,
  record_id: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  change_source: ChangeSource;
  changed_by: string;
  previous_content: Record<string, unknown> | null;
  new_content: Record<string, unknown>;
  created_at: string;
}>> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('ic_content_versions')
      .select('*')
      .eq('table_name', table_name)
      .eq('record_id', record_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get version history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error getting version history:', err);
    return [];
  }
}

// Get all recent changes across all content
export async function getRecentChanges(
  limit: number = 100
): Promise<Array<{
  id: string;
  table_name: string;
  record_id: string;
  change_source: ChangeSource;
  changed_by: string;
  created_at: string;
}>> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('ic_content_versions')
      .select('id, table_name, record_id, change_source, changed_by, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get recent changes:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error getting recent changes:', err);
    return [];
  }
}

// Check for conflicts between CMS and code changes
export async function checkForConflicts(
  section_key: string
): Promise<{
  hasConflict: boolean;
  lastCmsEdit: string | null;
  lastCodeSync: string | null;
}> {
  try {
    const supabase = createAdminClient();

    // Get the sync status
    const { data: syncStatus, error: syncError } = await supabase
      .from('ic_sync_status')
      .select('last_code_sync, last_cms_edit, conflict_detected')
      .eq('section_key', section_key)
      .single();

    if (syncError || !syncStatus) {
      return { hasConflict: false, lastCmsEdit: null, lastCodeSync: null };
    }

    return {
      hasConflict: syncStatus.conflict_detected || false,
      lastCmsEdit: syncStatus.last_cms_edit,
      lastCodeSync: syncStatus.last_code_sync,
    };
  } catch (err) {
    console.error('Error checking for conflicts:', err);
    return { hasConflict: false, lastCmsEdit: null, lastCodeSync: null };
  }
}

// Mark a sync status update
export async function updateSyncStatus(
  section_key: string,
  source: 'cms' | 'code',
  code_hash?: string
): Promise<boolean> {
  try {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (source === 'cms') {
      updateData.last_cms_edit = new Date().toISOString();
    } else {
      updateData.last_code_sync = new Date().toISOString();
      if (code_hash) {
        updateData.code_hash = code_hash;
      }
    }

    const { error } = await supabase
      .from('ic_sync_status')
      .upsert({
        section_key,
        ...updateData,
      }, {
        onConflict: 'section_key',
      });

    if (error) {
      console.error('Failed to update sync status:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error updating sync status:', err);
    return false;
  }
}

// Resolve a conflict by choosing a version
export async function resolveConflict(
  section_key: string,
  keep_version: 'cms' | 'code'
): Promise<boolean> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('ic_sync_status')
      .update({
        conflict_detected: false,
        is_synced: true,
        updated_at: new Date().toISOString(),
      })
      .eq('section_key', section_key);

    if (error) {
      console.error('Failed to resolve conflict:', error);
      return false;
    }

    // Log the resolution
    await supabase.from('ic_content_versions').insert({
      table_name: 'ic_sync_status',
      record_id: section_key,
      change_source: 'cms' as ChangeSource,
      changed_by: 'conflict-resolution',
      previous_content: { conflict: true },
      new_content: { resolved: keep_version },
    });

    return true;
  } catch (err) {
    console.error('Error resolving conflict:', err);
    return false;
  }
}
