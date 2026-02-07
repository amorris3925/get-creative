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

  if (!(key in defaultContent)) {
    notFound();
  }

  const sectionKey = key as keyof DefaultContent;
  const defaults = defaultContent[sectionKey];
  const cmsData = await getSectionData(sectionKey);
  const currentContent = cmsData?.content || defaults;

  return (
    <div style={{ padding: '20px 24px' }}>
      {/* Compact Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/admin/sections"
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              textDecoration: 'none',
            }}
          >
            ← Back
          </Link>
          <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <span style={{ fontSize: 9, letterSpacing: '0.12em', color: '#ED7F35' }}>EDITING </span>
            <span style={{ fontSize: 15, fontWeight: 400, color: '#FFFFFF', textTransform: 'capitalize' }}>
              {sectionKey.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {cmsData && (
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
              Saved {new Date(cmsData.updated_at).toLocaleDateString()}
            </span>
          )}
          <span style={{
            fontSize: 8,
            fontWeight: 500,
            letterSpacing: '0.05em',
            padding: '3px 6px',
            borderRadius: 3,
            background: cmsData ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            color: cmsData ? '#22C55E' : 'rgba(255,255,255,0.4)',
          }}>
            {cmsData ? 'CUSTOMIZED' : 'DEFAULTS'}
          </span>
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
