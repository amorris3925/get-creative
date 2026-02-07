import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getBackupById,
  createComponentBackup,
  markAsProduction,
} from '@/lib/components/backup';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Verify admin session
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return !!session?.value;
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { backupId, createBackupFirst = true } = body;

    if (!backupId) {
      return NextResponse.json(
        { error: 'backupId is required' },
        { status: 400 }
      );
    }

    // Get the backup to restore
    const targetBackup = await getBackupById(backupId);
    if (!targetBackup) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    const componentPath = join(process.cwd(), targetBackup.component_path);

    // Create a backup of current version before rollback
    let currentBackupId: string | null = null;
    if (createBackupFirst) {
      try {
        const currentCode = await readFile(componentPath, 'utf-8');
        const backupResult = await createComponentBackup({
          componentName: targetBackup.component_name,
          componentPath: targetBackup.component_path,
          sourceCode: currentCode,
          changeSummary: `Auto-backup before rollback to v${targetBackup.version_number}`,
          changedBy: 'rollback-system',
          changeSource: 'pre-deploy',
          isProduction: false,
        });
        if (backupResult.success) {
          currentBackupId = backupResult.backup!.id;
        }
      } catch (err) {
        // File might not exist, continue with rollback
        console.warn('Could not backup current file:', err);
      }
    }

    // Write the restored version to disk
    await writeFile(componentPath, targetBackup.source_code, 'utf-8');

    // Mark the restored backup as production
    await markAsProduction(backupId);

    // Log to content versions for audit trail
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();
    await supabase.from('ic_content_versions').insert({
      table_name: 'ic_component_backups',
      record_id: backupId,
      change_source: 'cms',
      changed_by: 'rollback',
      previous_content: { rolled_back_from: currentBackupId },
      new_content: {
        restored_version: targetBackup.version_number,
        component: targetBackup.component_name,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Restored ${targetBackup.component_name} to version ${targetBackup.version_number}`,
      restored: {
        id: targetBackup.id,
        version_number: targetBackup.version_number,
        version_tag: targetBackup.version_tag,
      },
      previousBackupId: currentBackupId,
    });
  } catch (err) {
    console.error('Rollback error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
