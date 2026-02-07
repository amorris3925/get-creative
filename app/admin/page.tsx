import { defaultContent } from '@/lib/content/defaults';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

async function getSectionStats() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ic_sections')
      .select('section_key, updated_at')
      .eq('page', 'home');

    return data || [];
  } catch {
    return [];
  }
}

async function getRecentChanges() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ic_content_versions')
      .select('id, table_name, record_id, change_source, changed_by, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    return data || [];
  } catch {
    return [];
  }
}

export default async function AdminDashboard() {
  const [sectionStats, recentChanges] = await Promise.all([
    getSectionStats(),
    getRecentChanges(),
  ]);

  const sectionKeys = Object.keys(defaultContent);
  const cmsUpdatedSections = new Set(sectionStats.map(s => s.section_key));

  return (
    <div style={{ padding: '40px 48px' }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{
          fontSize: 11,
          letterSpacing: '0.2em',
          color: '#ED7F35',
          marginBottom: 8,
        }}>
          ADMIN DASHBOARD
        </div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 300,
          color: '#FFFFFF',
          marginBottom: 8,
        }}>
          Content Management
        </h1>
        <p style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.5)',
        }}>
          Edit page sections, view version history, and manage content.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 32,
      }}>
        {/* Sections Grid */}
        <div>
          <div style={{
            fontSize: 12,
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 16,
          }}>
            PAGE SECTIONS
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
          }}>
            {sectionKeys.map((key) => {
              const isInCMS = cmsUpdatedSections.has(key);
              const sectionInfo = sectionStats.find(s => s.section_key === key);

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
                  <div style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.4)',
                  }}>
                    {isInCMS && sectionInfo?.updated_at
                      ? `Updated ${new Date(sectionInfo.updated_at).toLocaleDateString()}`
                      : 'Using code defaults'}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div style={{
            fontSize: 12,
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 16,
          }}>
            RECENT ACTIVITY
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {recentChanges.length === 0 ? (
              <div style={{
                padding: 24,
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontSize: 13,
              }}>
                No recent changes
              </div>
            ) : (
              <div>
                {recentChanges.map((change) => (
                  <div
                    key={change.id}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: 13,
                        color: '#FFFFFF',
                        marginBottom: 4,
                      }}>
                        {change.record_id}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.4)',
                      }}>
                        {change.changed_by} via {change.change_source}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.3)',
                    }}>
                      {new Date(change.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin/history"
            style={{
              display: 'block',
              marginTop: 16,
              padding: '12px 20px',
              background: 'rgba(237, 127, 53, 0.1)',
              border: '1px solid rgba(237, 127, 53, 0.2)',
              borderRadius: 12,
              textAlign: 'center',
              color: '#ED7F35',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            View Full History
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 48 }}>
        <div style={{
          fontSize: 12,
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 16,
        }}>
          QUICK ACTIONS
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link
            href="/admin/sections/hero"
            style={{
              padding: '16px 24px',
              background: '#ED7F35',
              borderRadius: 12,
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Edit Hero Section
          </Link>
          <Link
            href="/admin/sections/pricing"
            style={{
              padding: '16px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Edit Pricing
          </Link>
          <Link
            href="/admin/sections/testimonials"
            style={{
              padding: '16px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Edit Testimonials
          </Link>
        </div>
      </div>
    </div>
  );
}
