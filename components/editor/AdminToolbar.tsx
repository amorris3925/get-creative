'use client';

import { useEditMode } from './EditModeContext';
import { useResponsive } from './ResponsiveContext';
import DeviceToggle from './DeviceToggle';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminToolbar() {
  const {
    isEditMode,
    toggleEditMode,
    saveChanges,
    discardChanges,
    isSaving,
    hasChanges,
    undo,
    redo,
    canUndo,
    canRedo,
    showHistory,
    setShowHistory,
    history,
    fetchHistory,
    rollbackTo,
  } = useEditMode();

  const {
    hasStyleChanges,
    saveStyles,
    discardStyleChanges,
    isSavingStyles,
    selectedElement,
  } = useResponsive();

  const [showSpacingPanel, setShowSpacingPanel] = useState(false);

  // Combined save function
  const handleSave = async () => {
    if (hasChanges) {
      await saveChanges();
    }
    if (hasStyleChanges) {
      await saveStyles();
    }
  };

  // Combined discard function
  const handleDiscard = () => {
    if (hasChanges) {
      discardChanges();
    }
    if (hasStyleChanges) {
      discardStyleChanges();
    }
  };

  const hasPendingChanges = hasChanges || hasStyleChanges;
  const isSavingAny = isSaving || isSavingStyles;

  // Fetch history when panel opens
  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory, fetchHistory]);

  return (
    <>
      {/* Floating Edit Button (when not in edit mode) */}
      {!isEditMode && (
        <button
          onClick={toggleEditMode}
          data-admin-toolbar
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
          data-admin-toolbar
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

          {/* Device Toggle */}
          <div style={{
            paddingRight: 12,
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <DeviceToggle />
          </div>

          {/* Undo/Redo Buttons */}
          <div style={{
            display: 'flex',
            gap: 4,
            paddingRight: 12,
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Cmd+Z)"
              style={{
                padding: '6px 8px',
                background: canUndo ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: 6,
                color: canUndo ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.2)',
                cursor: canUndo ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
              </svg>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Cmd+Shift+Z)"
              style={{
                padding: '6px 8px',
                background: canRedo ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: 6,
                color: canRedo ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.2)',
                cursor: canRedo ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 7v6h-6" />
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
              </svg>
            </button>
          </div>

          {/* Spacing Toggle Button */}
          <button
            onClick={() => setShowSpacingPanel(!showSpacingPanel)}
            title="Adjust spacing"
            style={{
              padding: '6px 10px',
              background: showSpacingPanel ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: showSpacingPanel ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              color: showSpacingPanel ? '#22C55E' : 'rgba(255, 255, 255, 0.6)',
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18" />
              <path d="M15 3v18" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
            </svg>
            Spacing
          </button>

          {/* Instructions */}
          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>
            Click text to edit • Click elements for spacing
          </span>

          {/* Pending Changes Indicator */}
          {hasPendingChanges && (
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
            {/* History Button */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              title="View change history"
              style={{
                padding: '8px 12px',
                background: showHistory ? 'rgba(139, 36, 199, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: showHistory ? '1px solid rgba(139, 36, 199, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                color: showHistory ? '#A855F7' : 'rgba(255, 255, 255, 0.7)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              History
            </button>

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

            {hasPendingChanges && (
              <button
                onClick={handleDiscard}
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
              onClick={handleSave}
              disabled={!hasPendingChanges || isSavingAny}
              style={{
                padding: '8px 16px',
                background: hasPendingChanges ? '#ED7F35' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: 8,
                color: hasPendingChanges ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                fontSize: 12,
                fontWeight: 600,
                cursor: hasPendingChanges && !isSavingAny ? 'pointer' : 'not-allowed',
              }}
            >
              {isSavingAny ? 'Saving...' : 'Save'}
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

      {/* History Panel */}
      {isEditMode && showHistory && (
        <div
          data-admin-toolbar
          style={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            zIndex: 9998,
            width: 360,
            maxHeight: 400,
            background: 'rgba(10, 10, 10, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 600 }}>
                Change History
              </span>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div style={{
            maxHeight: 320,
            overflowY: 'auto',
            padding: '8px 0',
          }}>
            {history.length === 0 ? (
              <div style={{
                padding: '24px 20px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 13,
              }}>
                No change history yet.
                <br />
                <span style={{ fontSize: 11 }}>Changes will appear here after saving.</span>
              </div>
            ) : (
              history.map((entry, i) => (
                <div
                  key={entry.id || i}
                  style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontSize: 11,
                      color: '#ED7F35',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                    }}>
                      {entry.sectionKey.toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: 10,
                      color: 'rgba(255, 255, 255, 0.3)',
                    }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span style={{
                      padding: '2px 6px',
                      background: 'rgba(255, 100, 100, 0.15)',
                      borderRadius: 4,
                      fontSize: 10,
                      color: '#FF6B6B',
                      textDecoration: 'line-through',
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {entry.previousValue?.slice(0, 20) || '(empty)'}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span style={{
                      padding: '2px 6px',
                      background: 'rgba(100, 255, 100, 0.15)',
                      borderRadius: 4,
                      fontSize: 10,
                      color: '#6BFF6B',
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {entry.newValue?.slice(0, 20) || '(empty)'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to revert to this version?')) {
                        rollbackTo(entry.id);
                      }
                    }}
                    style={{
                      marginTop: 4,
                      padding: '4px 8px',
                      background: 'rgba(139, 36, 199, 0.1)',
                      border: '1px solid rgba(139, 36, 199, 0.3)',
                      borderRadius: 4,
                      color: '#A855F7',
                      fontSize: 10,
                      cursor: 'pointer',
                      alignSelf: 'flex-start',
                    }}
                  >
                    Revert to this
                  </button>
                </div>
              ))
            )}
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
