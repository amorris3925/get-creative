'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ComponentBackup {
  id: string;
  component_name: string;
  component_path: string;
  version_number: number;
  version_tag: string | null;
  source_hash: string;
  file_size_bytes: number;
  line_count: number;
  change_summary: string | null;
  changed_by: string;
  change_source: string;
  is_production: boolean;
  created_at: string;
  deployed_at: string | null;
}

interface TrackedComponent {
  component_name: string;
  component_path: string;
  version_count: number;
  latest_version: number;
  has_production: boolean;
  last_backup: string;
}

export default function ComponentsPage() {
  const [components, setComponents] = useState<TrackedComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [backups, setBackups] = useState<ComponentBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackLoading, setRollbackLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load tracked components
  useEffect(() => {
    fetch('/api/components/list?all=true')
      .then((res) => res.json())
      .then((data) => {
        setComponents(data.components || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load components:', err);
        setLoading(false);
      });
  }, []);

  // Load backups when component is selected
  useEffect(() => {
    if (!selectedComponent) {
      setBackups([]);
      return;
    }

    fetch(`/api/components/list?component=${selectedComponent}`)
      .then((res) => res.json())
      .then((data) => {
        setBackups(data.backups || []);
      })
      .catch((err) => {
        console.error('Failed to load backups:', err);
      });
  }, [selectedComponent]);

  const handleRollback = async (backupId: string, versionNumber: number) => {
    if (!confirm(`Are you sure you want to rollback to version ${versionNumber}? This will overwrite the current component file.`)) {
      return;
    }

    setRollbackLoading(backupId);
    setMessage(null);

    try {
      const res = await fetch('/api/components/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        // Refresh backups list
        if (selectedComponent) {
          const refreshRes = await fetch(`/api/components/list?component=${selectedComponent}`);
          const refreshData = await refreshRes.json();
          setBackups(refreshData.backups || []);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Rollback failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to perform rollback' });
    } finally {
      setRollbackLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>Component Backups</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Component Backups</h1>
        <Link href="/admin" style={{ color: '#666', fontSize: 14 }}>
          ← Back to Admin
        </Link>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: 20,
            borderRadius: 8,
            background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          {message.text}
        </div>
      )}

      {components.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
          <p>No component backups found.</p>
          <p style={{ fontSize: 14, marginTop: 10 }}>
            Run <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>npx tsx scripts/backup-current-zurich.ts</code> to create the first backup.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 30 }}>
          {/* Component List */}
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#666', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tracked Components
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {components.map((comp) => (
                <button
                  key={comp.component_name}
                  onClick={() => setSelectedComponent(comp.component_name)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: selectedComponent === comp.component_name ? '#0a0a0a' : '#f5f5f5',
                    color: selectedComponent === comp.component_name ? '#fff' : '#0a0a0a',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{comp.component_name}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {comp.version_count} version{comp.version_count !== 1 ? 's' : ''} • Latest: v{comp.latest_version}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Backup Details */}
          <div>
            {selectedComponent ? (
              <>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: '#666', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Version History: {selectedComponent}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      style={{
                        padding: 20,
                        borderRadius: 12,
                        border: backup.is_production ? '2px solid #22c55e' : '1px solid #e5e5e5',
                        background: backup.is_production ? '#f0fdf4' : '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 18, fontWeight: 600 }}>v{backup.version_number}</span>
                            {backup.version_tag && (
                              <span style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 12,
                                background: '#e5e5e5',
                                color: '#666',
                              }}>
                                {backup.version_tag}
                              </span>
                            )}
                            {backup.is_production && (
                              <span style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 12,
                                background: '#22c55e',
                                color: '#fff',
                              }}>
                                PRODUCTION
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 13, color: '#666' }}>
                            {backup.change_summary || 'No description'}
                          </div>
                        </div>
                        {!backup.is_production && (
                          <button
                            onClick={() => handleRollback(backup.id, backup.version_number)}
                            disabled={rollbackLoading === backup.id}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 6,
                              border: 'none',
                              background: rollbackLoading === backup.id ? '#ccc' : '#ED7F35',
                              color: '#fff',
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: rollbackLoading === backup.id ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {rollbackLoading === backup.id ? 'Rolling back...' : 'Rollback'}
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#999' }}>
                        <span>{formatSize(backup.file_size_bytes)}</span>
                        <span>{backup.line_count.toLocaleString()} lines</span>
                        <span>Hash: {backup.source_hash}</span>
                        <span>By: {backup.changed_by}</span>
                        <span>{formatDate(backup.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
                Select a component to view its version history
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
