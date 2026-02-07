'use client';

import { useResponsive, Breakpoint } from './ResponsiveContext';

interface VisibilityToggleProps {
  elementPath: string;
}

const BREAKPOINTS: { id: Breakpoint; label: string; icon: string }[] = [
  { id: 'desktop', label: 'Desktop', icon: '🖥️' },
  { id: 'tablet', label: 'Tablet', icon: '📱' },
  { id: 'mobile', label: 'Mobile', icon: '📱' },
];

export default function VisibilityToggle({ elementPath }: VisibilityToggleProps) {
  const {
    activeBreakpoint,
    getElementStyles,
    updateElementVisibility,
  } = useResponsive();

  const elementStyles = getElementStyles(elementPath);
  const isVisible = elementStyles.isVisible;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 8,
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <button
        onClick={() => updateElementVisibility(elementPath, !isVisible)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          background: isVisible
            ? 'rgba(34, 197, 94, 0.15)'
            : 'rgba(249, 56, 48, 0.15)',
          border: `1px solid ${isVisible ? 'rgba(34, 197, 94, 0.3)' : 'rgba(249, 56, 48, 0.3)'}`,
          borderRadius: 6,
          cursor: 'pointer',
          color: isVisible ? '#22C55E' : '#F93830',
          transition: 'all 0.15s ease',
        }}
        title={isVisible ? 'Hide on this device' : 'Show on this device'}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {isVisible ? (
            <>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </>
          ) : (
            <>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </>
          )}
        </svg>
      </button>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
          {isVisible ? 'Visible' : 'Hidden'} on {activeBreakpoint}
        </div>
      </div>

      {/* Quick visibility toggles for all breakpoints */}
      <div style={{ display: 'flex', gap: 4 }}>
        {BREAKPOINTS.map(bp => {
          const isActive = bp.id === activeBreakpoint;
          return (
            <div
              key={bp.id}
              style={{
                fontSize: 12,
                opacity: isActive ? 1 : 0.4,
                padding: '2px 4px',
                borderRadius: 4,
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
              title={bp.label}
            >
              {bp.icon}
            </div>
          );
        })}
      </div>
    </div>
  );
}
