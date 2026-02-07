import { createClient } from '@/lib/supabase/server';
import { defaultContent, DefaultContent } from './defaults';

interface SectionRow {
  section_key: string;
  content: Record<string, unknown>;
}

// Deep merge helper - CMS content wins on conflicts
function deepMerge(defaults: Record<string, unknown>, cms: Record<string, unknown>): Record<string, unknown> {
  const result = { ...defaults };
  for (const key of Object.keys(cms)) {
    if (cms[key] !== undefined) {
      if (
        typeof cms[key] === 'object' &&
        cms[key] !== null &&
        !Array.isArray(cms[key]) &&
        typeof defaults[key] === 'object' &&
        defaults[key] !== null &&
        !Array.isArray(defaults[key])
      ) {
        result[key] = deepMerge(
          defaults[key] as Record<string, unknown>,
          cms[key] as Record<string, unknown>
        );
      } else {
        result[key] = cms[key];
      }
    }
  }
  return result;
}

// Fetch all section content for a page, with fallback to defaults
export async function fetchSectionContent(page: string = 'home'): Promise<DefaultContent> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ic_sections')
      .select('section_key, content')
      .eq('page', page)
      .eq('is_visible', true);

    if (error) {
      console.error('Error fetching sections from Supabase:', error);
      return defaultContent;
    }

    if (!data || data.length === 0) {
      console.log('No CMS data found, using defaults');
      return defaultContent;
    }

    // Merge CMS data with defaults
    const merged = { ...defaultContent } as Record<string, unknown>;

    for (const row of data as SectionRow[]) {
      const key = row.section_key;
      if (merged[key] !== undefined && row.content) {
        if (typeof merged[key] === 'object' && merged[key] !== null) {
          merged[key] = deepMerge(
            merged[key] as Record<string, unknown>,
            row.content
          );
        } else {
          merged[key] = row.content;
        }
      }
    }

    return merged as unknown as DefaultContent;
  } catch (err) {
    console.error('Failed to fetch content:', err);
    return defaultContent;
  }
}

// Fetch a specific section
export async function fetchSection<K extends keyof DefaultContent>(
  sectionKey: K,
  page: string = 'home'
): Promise<DefaultContent[K]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ic_sections')
      .select('content')
      .eq('page', page)
      .eq('section_key', sectionKey)
      .eq('is_visible', true)
      .single();

    if (error || !data) {
      return defaultContent[sectionKey];
    }

    const defaults = defaultContent[sectionKey];
    if (typeof defaults === 'object' && defaults !== null && !Array.isArray(defaults)) {
      return deepMerge(
        defaults as Record<string, unknown>,
        data.content as Record<string, unknown>
      ) as DefaultContent[K];
    }

    return (data.content as DefaultContent[K]) || defaults;
  } catch (err) {
    console.error(`Failed to fetch section ${sectionKey}:`, err);
    return defaultContent[sectionKey];
  }
}

// Check if CMS has any content (for admin UI)
export async function hasCMSContent(page: string = 'home'): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from('ic_sections')
      .select('*', { count: 'exact', head: true })
      .eq('page', page);

    if (error) return false;
    return (count || 0) > 0;
  } catch {
    return false;
  }
}
