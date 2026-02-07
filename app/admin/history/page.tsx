import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface VersionRecord {
  id: string;
  table_name: string;
  record_id: string;
  change_source: 'cms' | 'code' | 'seed';
  changed_by: string;
  previous_content: Record<string, unknown> | null;
  new_content: Record<string, unknown>;
  created_at: string;
}

async function getVersionHistory(): Promise<VersionRecord[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ic_content_versions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

function getSourceColor(source: string): string {
  switch (source) {
    case 'cms': return '#22C55E';
    case 'code': return '#8B24C7';
    case 'seed': return '#ED7F35';
    default: return 'rgba(255,255,255,0.4)';
  }
}

function getSourceLabel(source: string): string {
  switch (source) {
    case 'cms': return 'CMS Admin';
    case 'code': return 'Claude Code';
    case 'seed': return 'Initial Seed';
    default: return source;
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default async function HistoryPage() {
  const history = await getVersionHistory();

  // Group by date
  const groupedHistory = history.reduce((acc, item) => {
    const date = new Date(item.created_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, VersionRecord[]>);

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
          Version History
        </h1>
        <p style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.5)',
        }}>
          Track all content changes with source attribution. Use this to debug conflicts or rollback changes.
        </p>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 24,
        marginBottom: 32,
        padding: '16px 24px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 4, background: '#22C55E' }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>CMS Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 4, background: '#8B24C7' }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Claude Code</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 4, background: '#ED7F35' }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Initial Seed</span>
        </div>
      </div>

      {/* History Timeline */}
      {Object.keys(groupedHistory).length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 64,
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 16,
          color: 'rgba(255,255,255,0.4)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>No changes recorded yet</div>
          <div style={{ fontSize: 13 }}>Changes will appear here when you edit content</div>
        </div>
      ) : (
        Object.entries(groupedHistory).map(([date, items]) => (
          <div key={date} style={{ marginBottom: 48 }}>
            <div style={{
              fontSize: 12,
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: 16,
            }}>
              {date === new Date().toLocaleDateString() ? 'TODAY' : date.toUpperCase()}
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: 20,
                    borderLeft: `4px solid ${getSourceColor(item.change_source)}`,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <div>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: '#FFFFFF',
                        marginBottom: 4,
                      }}>
                        {item.table_name === 'ic_sections'
                          ? `Section: ${item.record_id}`
                          : `${item.table_name}: ${item.record_id}`}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: getSourceColor(item.change_source),
                        }}>
                          {getSourceLabel(item.change_source)}
                        </span>
                        <span style={{
                          fontSize: 12,
                          color: 'rgba(255,255,255,0.4)',
                        }}>
                          by {item.changed_by}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.3)',
                    }}>
                      {formatTimeAgo(item.created_at)}
                    </div>
                  </div>

                  {/* Show what changed (simplified) */}
                  <div style={{
                    marginTop: 16,
                    padding: 12,
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: 'Monaco, Consolas, monospace',
                    color: 'rgba(255,255,255,0.5)',
                    maxHeight: 100,
                    overflow: 'hidden',
                  }}>
                    {item.previous_content
                      ? 'Updated content'
                      : 'Created new content'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
