'use client';

import { useEditMode } from './EditModeContext';
import Link from 'next/link';

export default function AdminToolbar() {
  const { isEditMode, toggleEditMode, saveChanges, discardChanges, isSaving, hasChanges } = useEditMode();

  return (
    <>
      {/* Floating Edit Button (when not in edit mode) */}
      {!isEditMode && (
        <button
          onClick={toggleEditMode}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #ED7F35 0%, #C45E1A 100%)',
            border: 'none',
            borderRadius: 50,
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(237, 127, 53, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(237, 127, 53, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(237, 127, 53, 0.4)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Page
        </button>
      )}

      {/* Full Toolbar (when in edit mode) */}
      {isEditMode && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 20px',
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Edit Mode Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingRight: 12,
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: '#22C55E',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 500 }}>
              EDIT MODE
            </span>
          </div>

          {/* Instructions */}
          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>
            Click any text to edit
          </span>

          {/* Pending Changes Indicator */}
          {hasChanges && (
            <div style={{
              padding: '4px 10px',
              background: 'rgba(237, 127, 53, 0.2)',
              borderRadius: 20,
              fontSize: 11,
              color: '#ED7F35',
            }}>
              Unsaved changes
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
            <Link
              href="/admin/sections"
              style={{
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 12,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Full Editor
            </Link>

            {hasChanges && (
              <button
                onClick={discardChanges}
                style={{
                  padding: '8px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Discard
              </button>
            )}

            <button
              onClick={saveChanges}
              disabled={!hasChanges || isSaving}
              style={{
                padding: '8px 16px',
                background: hasChanges ? '#ED7F35' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: 8,
                color: hasChanges ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                fontSize: 12,
                fontWeight: 600,
                cursor: hasChanges && !isSaving ? 'pointer' : 'not-allowed',
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={toggleEditMode}
              style={{
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
