import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  listComponentBackups,
  listTrackedComponents,
  getProductionVersion,
} from '@/lib/components/backup';

// Verify admin session
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return !!session?.value;
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const componentName = searchParams.get('component');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const listAll = searchParams.get('all') === 'true';

    // If no component specified, list all tracked components
    if (listAll || !componentName) {
      const components = await listTrackedComponents();
      return NextResponse.json({ components });
    }

    // List backups for specific component
    const backups = await listComponentBackups(componentName, limit);
    const production = await getProductionVersion(componentName);

    // Return backups without full source code for list view
    const backupSummaries = backups.map((b) => ({
      id: b.id,
      version_number: b.version_number,
      version_tag: b.version_tag,
      source_hash: b.source_hash,
      file_size_bytes: b.file_size_bytes,
      line_count: b.line_count,
      change_summary: b.change_summary,
      changed_by: b.changed_by,
      change_source: b.change_source,
      is_production: b.is_production,
      created_at: b.created_at,
      deployed_at: b.deployed_at,
    }));

    return NextResponse.json({
      component: componentName,
      production_version: production?.version_number || null,
      backups: backupSummaries,
    });
  } catch (err) {
    console.error('List error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
