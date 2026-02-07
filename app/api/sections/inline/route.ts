import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { defaultContent } from '@/lib/content/defaults';
import { verifyAdmin } from '@/lib/admin/auth';

interface InlineChange {
  path: string[];
  value: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sectionKey, changes } = await request.json() as {
      sectionKey: string;
      changes: InlineChange[];
    };

    if (!sectionKey || !changes || !Array.isArray(changes)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Reject unknown section keys - element must have proper data attributes
    if (sectionKey === 'unknown' || !defaultContent[sectionKey as keyof typeof defaultContent]) {
      console.warn(`Attempted to save unknown section: ${sectionKey}`);
      return NextResponse.json({
        error: 'Element not configured for editing. Please add data-section and data-field attributes.',
        sectionKey
      }, { status: 400 });
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // Get existing section data
    const { data: existing } = await supabase
      .from('ic_sections')
      .select('id, content')
      .eq('page', 'home')
      .eq('section_key', sectionKey)
      .single();

    // Start with existing content or defaults
    const baseContent = existing?.content || defaultContent[sectionKey as keyof typeof defaultContent];
    const newContent = JSON.parse(JSON.stringify(baseContent));

    // Apply each change
    for (const change of changes) {
      let current = newContent;
      for (let i = 0; i < change.path.length - 1; i++) {
        const key = change.path[i];
        if (current[key] === undefined) {
          current[key] = {};
        }
        current = current[key];
      }

      const lastKey = change.path[change.path.length - 1];
      // Try to preserve the original type
      const originalValue = current[lastKey];
      if (typeof originalValue === 'number') {
        current[lastKey] = parseFloat(change.value) || 0;
      } else {
        current[lastKey] = change.value;
      }
    }

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('ic_sections')
        .update({
          content: newContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
      }

      // Log version
      await supabase.from('ic_content_versions').insert({
        table_name: 'ic_sections',
        record_id: existing.id,
        change_source: 'cms',
        changed_by: 'inline-editor',
        previous_content: existing.content,
        new_content: newContent,
      });
    } else {
      // Create new record
      const { data: newRecord, error } = await supabase
        .from('ic_sections')
        .insert({
          page: 'home',
          section_key: sectionKey,
          content: newContent,
          is_visible: true,
          order_index: 0,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Insert error:', error);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
      }

      // Log version
      await supabase.from('ic_content_versions').insert({
        table_name: 'ic_sections',
        record_id: newRecord?.id,
        change_source: 'cms',
        changed_by: 'inline-editor',
        previous_content: null,
        new_content: newContent,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Inline save error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
