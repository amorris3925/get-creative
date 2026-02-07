import { notFound } from 'next/navigation';
import { defaultContent, DefaultContent } from '@/lib/content/defaults';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import SectionEditor from '@/components/admin/SectionEditor';

interface PageProps {
  params: Promise<{ key: string }>;
}

async function getSectionData(sectionKey: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ic_sections')
      .select('*')
      .eq('page', 'home')
      .eq('section_key', sectionKey)
      .single();

    return data;
  } catch {
    return null;
  }
}

export default async function SectionEditorPage({ params }: PageProps) {
  const { key } = await params;

  // Validate that the section key exists in defaults
  if (!(key in defaultContent)) {
    notFound();
  }

  const sectionKey = key as keyof DefaultContent;
  const defaults = defaultContent[sectionKey];
  const cmsData = await getSectionData(sectionKey);

  // Merge CMS data with defaults
  const currentContent = cmsData?.content || defaults;

  return (
    <div style={{ padding: '40px 48px' }}>
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/admin/sections"
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            marginBottom: 16,
            display: 'inline-block',
          }}
        >
          ← Back to Sections
        </Link>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginTop: 16,
        }}>
          <div>
            <div style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              color: '#ED7F35',
              marginBottom: 8,
            }}>
              EDITING SECTION
            </div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 300,
              color: '#FFFFFF',
              textTransform: 'capitalize',
            }}>
              {sectionKey.replace(/([A-Z])/g, ' $1').trim()}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {cmsData && (
              <div style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
              }}>
                Last saved: {new Date(cmsData.updated_at).toLocaleString()}
              </div>
            )}
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.05em',
              padding: '6px 12px',
              borderRadius: 8,
              background: cmsData
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(255, 255, 255, 0.05)',
              color: cmsData
                ? '#22C55E'
                : 'rgba(255,255,255,0.4)',
            }}>
              {cmsData ? 'CUSTOMIZED' : 'USING DEFAULTS'}
            </div>
          </div>
        </div>
      </div>

      <SectionEditor
        sectionKey={sectionKey}
        initialContent={currentContent}
        defaults={defaults}
        recordId={cmsData?.id}
      />
    </div>
  );
}
