import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface StyleChange {
  elementPath: string;
  breakpoint: 'desktop' | 'tablet' | 'mobile';
  styles: Record<string, string | number>;
  isVisible: boolean;
  sectionId?: string;
}

// GET: Fetch all styles for the home page sections
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';

    // First get all section IDs for this page
    const { data: sections, error: sectionsError } = await supabase
      .from('ic_sections')
      .select('id, section_key')
      .eq('page', page);

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return NextResponse.json({ styles: [] });
    }

    if (!sections || sections.length === 0) {
      return NextResponse.json({ styles: [] });
    }

    const sectionIds = sections.map(s => s.id);

    // Fetch styles for these sections
    const { data: styles, error: stylesError } = await supabase
      .from('ic_section_styles')
      .select('*')
      .in('section_id', sectionIds);

    if (stylesError) {
      console.error('Error fetching styles:', stylesError);
      return NextResponse.json({ styles: [] });
    }

    // Map section IDs back to section keys for frontend use
    const sectionMap = new Map(sections.map(s => [s.id, s.section_key]));
    const mappedStyles = (styles || []).map(style => ({
      ...style,
      sectionKey: sectionMap.get(style.section_id),
    }));

    return NextResponse.json({ styles: mappedStyles });
  } catch (error) {
    console.error('Error in GET /api/styles:', error);
    return NextResponse.json({ error: 'Failed to fetch styles' }, { status: 500 });
  }
}

// POST: Save style changes
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { changes } = await request.json() as { changes: StyleChange[] };

    if (!changes || !Array.isArray(changes)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Get section IDs for elements that need them
    const elementPaths = [...new Set(changes.map(c => c.elementPath.split('.')[0]))];
    const { data: sections } = await supabase
      .from('ic_sections')
      .select('id, section_key')
      .eq('page', 'home')
      .in('section_key', elementPaths);

    const sectionMap = new Map((sections || []).map(s => [s.section_key, s.id]));

    // Process each change
    const results = [];
    for (const change of changes) {
      const sectionKey = change.elementPath.split('.')[0];
      let sectionId = sectionMap.get(sectionKey);

      // Create section if it doesn't exist
      if (!sectionId) {
        const { data: newSection, error: createError } = await supabase
          .from('ic_sections')
          .insert({
            page: 'home',
            section_key: sectionKey,
            content: {},
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating section:', createError);
          continue;
        }
        sectionId = newSection.id;
        sectionMap.set(sectionKey, sectionId);
      }

      // Upsert the style
      const { data, error } = await supabase
        .from('ic_section_styles')
        .upsert(
          {
            section_id: sectionId,
            element_path: change.elementPath,
            breakpoint: change.breakpoint,
            styles: change.styles,
            is_visible: change.isVisible,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'section_id,element_path,breakpoint',
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Error upserting style:', error);
        continue;
      }

      results.push(data);
    }

    return NextResponse.json({ success: true, saved: results.length });
  } catch (error) {
    console.error('Error in POST /api/styles:', error);
    return NextResponse.json({ error: 'Failed to save styles' }, { status: 500 });
  }
}

// DELETE: Remove custom styles for an element
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { elementPath, breakpoint } = await request.json();

    if (!elementPath) {
      return NextResponse.json({ error: 'elementPath is required' }, { status: 400 });
    }

    const sectionKey = elementPath.split('.')[0];

    // Get section ID
    const { data: section } = await supabase
      .from('ic_sections')
      .select('id')
      .eq('page', 'home')
      .eq('section_key', sectionKey)
      .single();

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Build delete query
    let query = supabase
      .from('ic_section_styles')
      .delete()
      .eq('section_id', section.id)
      .eq('element_path', elementPath);

    // If breakpoint specified, only delete that breakpoint
    if (breakpoint) {
      query = query.eq('breakpoint', breakpoint);
    }

    const { error } = await query;

    if (error) {
      console.error('Error deleting style:', error);
      return NextResponse.json({ error: 'Failed to delete style' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/styles:', error);
    return NextResponse.json({ error: 'Failed to delete styles' }, { status: 500 });
  }
}
