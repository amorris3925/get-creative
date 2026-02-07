import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/admin/auth';

export async function POST(request: Request) {
  // Verify admin access
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { versionId } = await request.json();

    if (!versionId) {
      return NextResponse.json({ error: 'Version ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch the version to rollback to
    const { data: version, error: versionError } = await supabase
      .from('ic_content_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (versionError || !version) {
      console.error('Error fetching version:', versionError);
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // Get the record ID and table name
    const { table_name, record_id, previous_content } = version;

    if (!previous_content) {
      return NextResponse.json({ error: 'No previous content to restore' }, { status: 400 });
    }

    // Update the actual record with the previous content
    if (table_name === 'ic_sections') {
      // Get the current content first for logging
      const { data: currentRecord } = await supabase
        .from('ic_sections')
        .select('content')
        .eq('id', record_id)
        .single();

      // Update the section with the previous content
      const { error: updateError } = await supabase
        .from('ic_sections')
        .update({
          content: previous_content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', record_id);

      if (updateError) {
        console.error('Error updating section:', updateError);
        return NextResponse.json({ error: 'Failed to rollback' }, { status: 500 });
      }

      // Log the rollback as a new version
      await supabase.from('ic_content_versions').insert({
        table_name,
        record_id,
        change_source: 'rollback',
        changed_by: 'admin',
        previous_content: currentRecord?.content || null,
        new_content: previous_content,
      });
    }

    return NextResponse.json({ success: true, message: 'Rollback successful' });
  } catch (error) {
    console.error('Rollback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
