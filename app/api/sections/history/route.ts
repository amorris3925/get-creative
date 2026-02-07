import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/admin/auth';

export async function GET(request: Request) {
  // Verify admin access
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    const supabase = createAdminClient();

    // Fetch the last N content versions
    const { data, error } = await supabase
      .from('ic_content_versions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching history:', error);
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    // Transform the data for the frontend
    const history = (data || []).map(entry => {
      // Extract section key from the change
      let sectionKey = 'unknown';
      let previousValue = '';
      let newValue = '';
      const path: string[] = [];

      // Try to get meaningful values from the stored content
      if (entry.previous_content && typeof entry.previous_content === 'object') {
        const keys = Object.keys(entry.previous_content);
        if (keys.length > 0) {
          sectionKey = keys[0] || entry.table_name || 'unknown';
        }
      }

      if (entry.new_content && typeof entry.new_content === 'object') {
        const keys = Object.keys(entry.new_content);
        if (keys.length > 0) {
          sectionKey = keys[0] || sectionKey;
        }
      }

      // For detailed changes, try to find specific differences
      if (entry.change_diff) {
        const diff = entry.change_diff;
        if (typeof diff === 'object' && diff !== null) {
          const diffKeys = Object.keys(diff);
          if (diffKeys.length > 0) {
            const firstKey = diffKeys[0];
            const diffValue = diff[firstKey];
            if (typeof diffValue === 'object' && diffValue !== null) {
              previousValue = diffValue.old || '';
              newValue = diffValue.new || '';
            }
          }
        }
      } else {
        // Fallback: stringify the content
        previousValue = entry.previous_content ? JSON.stringify(entry.previous_content).slice(0, 50) : '';
        newValue = entry.new_content ? JSON.stringify(entry.new_content).slice(0, 50) : '';
      }

      return {
        id: entry.id,
        sectionKey: entry.table_name === 'ic_sections' ? (sectionKey || 'section') : entry.table_name,
        path,
        previousValue,
        newValue,
        timestamp: entry.created_at,
        source: entry.change_source || 'cms',
        changedBy: entry.changed_by,
      };
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
