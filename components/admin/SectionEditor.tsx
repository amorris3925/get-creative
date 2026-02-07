'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      let contentToSave = content;

      // If in JSON mode, parse the text
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
        body: JSON.stringify({
          sectionKey,
          content: contentToSave,
          recordId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSuccess('Changes saved successfully!');
      router.refresh();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setContent(defaults as FieldValue);
    setJsonText(JSON.stringify(defaults, null, 2));
    setSuccess('');
    setError('');
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

  const renderField = (
    key: string,
    value: FieldValue,
    path: string[] = [],
    depth: number = 0
  ): React.ReactNode => {
    const currentPath = [...path, key];

    // Handle arrays
    if (Array.isArray(value)) {
      return (
        <div key={key} style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#ED7F35',
            marginBottom: 12,
            textTransform: 'capitalize',
          }}>
            {key.replace(/([A-Z])/g, ' $1')} ({value.length} items)
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 12,
            padding: 16,
          }}>
            {value.map((item, idx) => (
              <div key={idx} style={{
                marginBottom: idx < value.length - 1 ? 16 : 0,
                paddingBottom: idx < value.length - 1 ? 16 : 0,
                borderBottom: idx < value.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: 8,
                }}>
                  Item {idx + 1}
                </div>
                {typeof item === 'object' && item !== null
                  ? Object.entries(item as Record<string, FieldValue>).map(([k, v]) =>
                      renderField(k, v, [...currentPath, String(idx)], depth + 1)
                    )
                  : renderPrimitiveField(String(idx), item, [...currentPath])}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Handle objects
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: depth === 0 ? '#ED7F35' : 'rgba(255,255,255,0.6)',
            marginBottom: 12,
            textTransform: 'capitalize',
          }}>
            {key.replace(/([A-Z])/g, ' $1')}
          </div>
          <div style={{
            background: depth === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
            border: depth === 0 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
            borderRadius: 12,
            padding: depth === 0 ? 16 : 0,
            paddingLeft: depth > 0 ? 16 : 16,
            borderLeft: depth > 0 ? '2px solid rgba(237, 127, 53, 0.2)' : 'none',
          }}>
            {Object.entries(value as Record<string, FieldValue>).map(([k, v]) =>
              renderField(k, v, currentPath, depth + 1)
            )}
          </div>
        </div>
      );
    }

    // Handle primitives
    return renderPrimitiveField(key, value, path);
  };

  const renderPrimitiveField = (key: string, value: FieldValue, path: string[]): React.ReactNode => {
    const currentPath = [...path, key];
    const fieldId = currentPath.join('-');

    // Boolean field
    if (typeof value === 'boolean') {
      return (
        <div key={fieldId} style={{ marginBottom: 16 }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => updateField(currentPath, e.target.checked)}
              style={{
                width: 20,
                height: 20,
                accentColor: '#ED7F35',
              }}
            />
            <span style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.8)',
              textTransform: 'capitalize',
            }}>
              {key.replace(/([A-Z])/g, ' $1')}
            </span>
          </label>
        </div>
      );
    }

    // Number field
    if (typeof value === 'number') {
      return (
        <div key={fieldId} style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 6,
            textTransform: 'capitalize',
          }}>
            {key.replace(/([A-Z])/g, ' $1')}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => updateField(currentPath, parseFloat(e.target.value) || 0)}
            style={{
              width: '100%',
              maxWidth: 200,
              padding: '10px 14px',
              fontSize: 14,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              color: '#FFFFFF',
              outline: 'none',
            }}
          />
        </div>
      );
    }

    // String field (text or textarea based on length)
    const isLongText = typeof value === 'string' && value.length > 100;

    return (
      <div key={fieldId} style={{ marginBottom: 16 }}>
        <label style={{
          display: 'block',
          fontSize: 11,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 6,
          textTransform: 'capitalize',
        }}>
          {key.replace(/([A-Z])/g, ' $1')}
        </label>
        {isLongText ? (
          <textarea
            value={String(value || '')}
            onChange={(e) => updateField(currentPath, e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: 14,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
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
              padding: '10px 14px',
              fontSize: 14,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              color: '#FFFFFF',
              outline: 'none',
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Mode Toggle */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
      }}>
        <button
          onClick={() => setJsonMode(false)}
          style={{
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 500,
            background: !jsonMode ? '#ED7F35' : 'rgba(255, 255, 255, 0.05)',
            border: !jsonMode ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          Visual Editor
        </button>
        <button
          onClick={() => {
            setJsonMode(true);
            setJsonText(JSON.stringify(content, null, 2));
          }}
          style={{
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 500,
            background: jsonMode ? '#ED7F35' : 'rgba(255, 255, 255, 0.05)',
            border: jsonMode ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          JSON Editor
        </button>
      </div>

      {/* Editor */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 32,
        marginBottom: 24,
      }}>
        {jsonMode ? (
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            style={{
              width: '100%',
              minHeight: 500,
              padding: 16,
              fontSize: 13,
              fontFamily: 'Monaco, Consolas, monospace',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              color: '#FFFFFF',
              outline: 'none',
              resize: 'vertical',
              lineHeight: 1.6,
            }}
          />
        ) : (
          <div>
            {typeof content === 'object' && content !== null
              ? Object.entries(content as Record<string, FieldValue>).map(([k, v]) =>
                  renderField(k, v, [], 0)
                )
              : renderPrimitiveField('value', content, [])}
          </div>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(249, 56, 48, 0.1)',
          border: '1px solid rgba(249, 56, 48, 0.3)',
          borderRadius: 8,
          color: '#F93830',
          fontSize: 14,
          marginBottom: 24,
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 8,
          color: '#22C55E',
          fontSize: 14,
          marginBottom: 24,
        }}>
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={handleReset}
          style={{
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 500,
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
          }}
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '14px 32px',
            fontSize: 14,
            fontWeight: 600,
            background: saving ? 'rgba(237, 127, 53, 0.5)' : '#ED7F35',
            border: 'none',
            borderRadius: 8,
            color: '#FFFFFF',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(237, 127, 53, 0.25)',
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
