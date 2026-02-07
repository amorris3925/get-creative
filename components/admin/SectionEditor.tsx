'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SectionPreview from './SectionPreview';

interface SectionEditorProps {
  sectionKey: string;
  initialContent: unknown;
  defaults: unknown;
  recordId?: string;
}

type FieldValue = string | number | boolean | null | FieldValue[] | { [key: string]: FieldValue };

export default function SectionEditor({
  sectionKey,
  initialContent,
  defaults,
  recordId,
}: SectionEditorProps) {
  const [content, setContent] = useState<FieldValue>(initialContent as FieldValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(initialContent, null, 2));
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(true);
  const router = useRouter();

  const toggleSection = (path: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      let contentToSave = content;

      if (jsonMode) {
        try {
          contentToSave = JSON.parse(jsonText);
          setContent(contentToSave);
        } catch {
          setError('Invalid JSON format');
          setSaving(false);
          return;
        }
      }

      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionKey, content: contentToSave, recordId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSuccess('Saved!');
      router.refresh();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setContent(defaults as FieldValue);
    setJsonText(JSON.stringify(defaults, null, 2));
  };

  const updateField = (path: string[], value: FieldValue) => {
    setContent((prev) => {
      const newContent = JSON.parse(JSON.stringify(prev));
      let current = newContent;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      setJsonText(JSON.stringify(newContent, null, 2));
      return newContent;
    });
  };

  // Compact field renderer
  const renderField = (
    key: string,
    value: FieldValue,
    path: string[] = [],
    depth: number = 0
  ): React.ReactNode => {
    const currentPath = [...path, key];
    const pathKey = currentPath.join('.');
    const isCollapsed = collapsedSections.has(pathKey);

    // Handle arrays
    if (Array.isArray(value)) {
      return (
        <div key={pathKey} style={{ marginBottom: 8 }}>
          <div
            onClick={() => toggleSection(pathKey)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 8px',
              background: 'rgba(237, 127, 53, 0.1)',
              borderRadius: 6,
              cursor: 'pointer',
              marginBottom: isCollapsed ? 0 : 6,
            }}
          >
            <span style={{ fontSize: 10, color: '#ED7F35' }}>{isCollapsed ? '▶' : '▼'}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#ED7F35', textTransform: 'capitalize' }}>
              {key.replace(/([A-Z])/g, ' $1')}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>({value.length})</span>
          </div>
          {!isCollapsed && (
            <div style={{ paddingLeft: 12, borderLeft: '2px solid rgba(237, 127, 53, 0.15)' }}>
              {value.map((item, idx) => (
                <div key={idx} style={{
                  padding: '6px 0',
                  borderBottom: idx < value.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 4, display: 'block' }}>
                    #{idx + 1}
                  </span>
                  {typeof item === 'object' && item !== null ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6 }}>
                      {Object.entries(item as Record<string, FieldValue>).map(([k, v]) =>
                        typeof v === 'object' && v !== null
                          ? <div key={k} style={{ gridColumn: '1 / -1' }}>{renderField(k, v, [...currentPath, String(idx)], depth + 1)}</div>
                          : renderCompactField(k, v, [...currentPath, String(idx)])
                      )}
                    </div>
                  ) : renderCompactField(String(idx), item, [...currentPath])}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Handle objects
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={pathKey} style={{ marginBottom: 8 }}>
          <div
            onClick={() => toggleSection(pathKey)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 8px',
              background: depth === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
              borderRadius: 6,
              cursor: 'pointer',
              marginBottom: isCollapsed ? 0 : 6,
            }}
          >
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{isCollapsed ? '▶' : '▼'}</span>
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              color: depth === 0 ? '#ED7F35' : 'rgba(255,255,255,0.7)',
              textTransform: 'capitalize',
            }}>
              {key.replace(/([A-Z])/g, ' $1')}
            </span>
          </div>
          {!isCollapsed && (
            <div style={{
              paddingLeft: 12,
              borderLeft: depth === 0 ? '2px solid rgba(237, 127, 53, 0.15)' : '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6 }}>
                {Object.entries(value as Record<string, FieldValue>).map(([k, v]) =>
                  typeof v === 'object' && v !== null
                    ? <div key={k} style={{ gridColumn: '1 / -1' }}>{renderField(k, v, currentPath, depth + 1)}</div>
                    : renderCompactField(k, v, currentPath)
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    return renderCompactField(key, value, path);
  };

  // Compact inline field
  const renderCompactField = (key: string, value: FieldValue, path: string[]): React.ReactNode => {
    const currentPath = [...path, key];
    const fieldId = currentPath.join('-');

    if (typeof value === 'boolean') {
      return (
        <label key={fieldId} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 0' }}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => updateField(currentPath, e.target.checked)}
            style={{ width: 14, height: 14, accentColor: '#ED7F35' }}
          />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>
            {key.replace(/([A-Z])/g, ' $1')}
          </span>
        </label>
      );
    }

    if (typeof value === 'number') {
      return (
        <div key={fieldId} style={{ padding: '2px 0' }}>
          <label style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize', display: 'block', marginBottom: 2 }}>
            {key.replace(/([A-Z])/g, ' $1')}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => updateField(currentPath, parseFloat(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: 12,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              color: '#FFFFFF',
              outline: 'none',
            }}
          />
        </div>
      );
    }

    const isLong = typeof value === 'string' && value.length > 60;

    return (
      <div key={fieldId} style={{ padding: '2px 0', gridColumn: isLong ? '1 / -1' : undefined }}>
        <label style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize', display: 'block', marginBottom: 2 }}>
          {key.replace(/([A-Z])/g, ' $1')}
        </label>
        {isLong ? (
          <textarea
            value={String(value || '')}
            onChange={(e) => updateField(currentPath, e.target.value)}
            rows={2}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: 12,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              color: '#FFFFFF',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        ) : (
          <input
            type="text"
            value={String(value || '')}
            onChange={(e) => updateField(currentPath, e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: 12,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              color: '#FFFFFF',
              outline: 'none',
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* Left: Editor */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Mode Toggle & Actions - Sticky */}
        <div style={{
          position: 'sticky',
          top: 64,
          zIndex: 10,
          background: '#0A0A0A',
          paddingBottom: 12,
          marginBottom: 12,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setJsonMode(false)}
                style={{
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 500,
                  background: !jsonMode ? '#ED7F35' : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: 4,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                Visual
              </button>
              <button
                onClick={() => { setJsonMode(true); setJsonText(JSON.stringify(content, null, 2)); }}
                style={{
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 500,
                  background: jsonMode ? '#ED7F35' : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: 4,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                JSON
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {error && <span style={{ fontSize: 11, color: '#F93830' }}>{error}</span>}
              {success && <span style={{ fontSize: 11, color: '#22C55E' }}>{success}</span>}
              <button
                onClick={handleReset}
                style={{
                  padding: '6px 12px',
                  fontSize: 11,
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '6px 16px',
                  fontSize: 11,
                  fontWeight: 600,
                  background: saving ? 'rgba(237, 127, 53, 0.5)' : '#ED7F35',
                  border: 'none',
                  borderRadius: 4,
                  color: '#FFFFFF',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 8,
          padding: 16,
        }}>
          {jsonMode ? (
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              style={{
                width: '100%',
                minHeight: 400,
                padding: 12,
                fontSize: 11,
                fontFamily: 'Monaco, Consolas, monospace',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 6,
                color: '#FFFFFF',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          ) : (
            <div>
              {typeof content === 'object' && content !== null
                ? Object.entries(content as Record<string, FieldValue>).map(([k, v]) =>
                    renderField(k, v, [], 0)
                  )
                : renderCompactField('value', content, [])}
            </div>
          )}
        </div>
      </div>

      {/* Right: Preview */}
      <div style={{ width: 400, flexShrink: 0 }}>
        <div style={{
          position: 'sticky',
          top: 64,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
              LIVE PREVIEW
            </span>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                fontSize: 10,
                color: '#ED7F35',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {showPreview ? 'Hide' : 'Show'}
            </button>
          </div>
          {showPreview && (
            <div style={{
              background: '#111',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 8,
              overflow: 'hidden',
              maxHeight: 'calc(100vh - 140px)',
              overflowY: 'auto',
            }}>
              <SectionPreview sectionKey={sectionKey} content={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
