import { defaultContent } from '@/lib/content/defaults';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

async function getSectionStats() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ic_sections')
      .select('section_key, updated_at, is_visible')
      .eq('page', 'home');

    return data || [];
  } catch {
    return [];
  }
}

export default async function SectionsListPage() {
  const sectionStats = await getSectionStats();
  const sectionKeys = Object.keys(defaultContent);
  const cmsData = new Map(sectionStats.map(s => [s.section_key, s]));

  // Group sections by category
  const sectionCategories = {
    'Core Page Sections': ['hero', 'services', 'stats', 'caseStudies', 'testimonials', 'socialProof'],
    'Pricing & Features': ['pricing', 'enterpriseServices', 'growthPartnerPoints', 'enterprisePricing'],
    'About & Contact': ['about', 'contact', 'comparison'],
    'Products & Partners': ['liquorChat', 'cityHive'],
    'Navigation & Layout': ['navigation', 'sectionLabels', 'footer', 'uiText'],
    'Other': ['clientTypes'],
  };

  return (
    <div style={{ padding: '40px 48px' }}>
      <div style={{ marginBottom: 48 }}>
        <Link
          href="/admin"
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            marginBottom: 16,
            display: 'inline-block',
          }}
        >
          ← Back to Dashboard
        </Link>
        <h1 style={{
          fontSize: 32,
          fontWeight: 300,
          color: '#FFFFFF',
          marginTop: 16,
          marginBottom: 8,
        }}>
          Page Sections
        </h1>
        <p style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.5)',
        }}>
          Edit content for each section of the website. Changes override the code defaults.
        </p>
      </div>

      {Object.entries(sectionCategories).map(([category, keys]) => (
        <div key={category} style={{ marginBottom: 48 }}>
          <div style={{
            fontSize: 12,
            letterSpacing: '0.1em',
            color: '#ED7F35',
            marginBottom: 16,
          }}>
            {category.toUpperCase()}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}>
            {keys.filter(key => sectionKeys.includes(key)).map((key) => {
              const cmsInfo = cmsData.get(key);
              const isInCMS = !!cmsInfo;
              const isVisible = cmsInfo?.is_visible !== false;

              return (
                <Link
                  key={key}
                  href={`/admin/sections/${key}`}
                  style={{
                    display: 'block',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                    padding: 24,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    opacity: isVisible ? 1 : 0.6,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: '#FFFFFF',
                      textTransform: 'capitalize',
                    }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {!isVisible && (
                        <div style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: 'rgba(249, 56, 48, 0.1)',
                          color: '#F93830',
                        }}>
                          HIDDEN
                        </div>
                      )}
                      <div style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: isInCMS
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: isInCMS
                          ? '#22C55E'
                          : 'rgba(255,255,255,0.4)',
                      }}>
                        {isInCMS ? 'CUSTOMIZED' : 'DEFAULT'}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.4)',
                  }}>
                    {isInCMS && cmsInfo?.updated_at
                      ? `Updated ${new Date(cmsInfo.updated_at).toLocaleDateString()}`
                      : 'Using code defaults'}
                  </div>
                  <div style={{
                    marginTop: 16,
                    fontSize: 12,
                    color: '#ED7F35',
                    fontWeight: 500,
                  }}>
                    Edit →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
