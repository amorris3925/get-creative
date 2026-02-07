import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { logContentVersion, updateSyncStatus } from '@/lib/content/version';

export async function POST(request: NextRequest) {
  // Verify admin
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sectionKey, content, recordId } = await request.json();

    if (!sectionKey || content === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (recordId) {
      // Update existing section
      const { data: existing } = await supabase
        .from('ic_sections')
        .select('content')
        .eq('id', recordId)
        .single();

      const { error } = await supabase
        .from('ic_sections')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recordId);

      if (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
      }

      // Log version
      await logContentVersion({
        table_name: 'ic_sections',
        record_id: recordId,
        change_source: 'cms',
        changed_by: 'admin',
        previous_content: existing?.content || null,
        new_content: content,
      });

      // Update sync status
      await updateSyncStatus(sectionKey, 'cms');

    } else {
      // Insert new section
      const { data: newRecord, error } = await supabase
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

      if (error) {
        console.error('Insert error:', error);
        return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
      }

      // Log version
      if (newRecord) {
        await logContentVersion({
          table_name: 'ic_sections',
          record_id: newRecord.id,
          change_source: 'cms',
          changed_by: 'admin',
          previous_content: null,
          new_content: content,
        });

        // Update sync status
        await updateSyncStatus(sectionKey, 'cms');
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Section save error:', error);
    return NextResponse.json({ error: 'Failed to save section' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionKey = searchParams.get('key');
    const page = searchParams.get('page') || 'home';

    const supabase = createAdminClient();

    if (sectionKey) {
      const { data, error } = await supabase
        .from('ic_sections')
        .select('*')
        .eq('page', page)
        .eq('section_key', sectionKey)
        .single();

      if (error) {
        return NextResponse.json({ data: null });
      }

      return NextResponse.json({ data });
    }

    // Get all sections for a page
    const { data, error } = await supabase
      .from('ic_sections')
      .select('*')
      .eq('page', page);

    if (error) {
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Section fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Verify admin
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('id');

    if (!recordId) {
      return NextResponse.json({ error: 'Missing record ID' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get existing content for version log
    const { data: existing } = await supabase
      .from('ic_sections')
      .select('*')
      .eq('id', recordId)
      .single();

    if (existing) {
      // Log version before delete
      await logContentVersion({
        table_name: 'ic_sections',
        record_id: recordId,
        change_source: 'cms',
        changed_by: 'admin',
        previous_content: existing.content,
        new_content: { _deleted: true },
      });
    }

    const { error } = await supabase
      .from('ic_sections')
      .delete()
      .eq('id', recordId);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Section delete error:', error);
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}
