'use client';

import { useResponsive, Breakpoint } from './ResponsiveContext';

const DEVICES: { id: Breakpoint; label: string; icon: string; width: string }[] = [
  { id: 'desktop', label: 'Desktop', icon: '🖥️', width: '1440px' },
  { id: 'tablet', label: 'Tablet', icon: '📱', width: '768px' },
  { id: 'mobile', label: 'Mobile', icon: '📱', width: '375px' },
];

export default function DeviceToggle() {
  const { activeBreakpoint, setActiveBreakpoint, isPreviewMode, setIsPreviewMode } = useResponsive();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
      }}
    >
      {DEVICES.map(device => (
        <button
          key={device.id}
          onClick={() => setActiveBreakpoint(device.id)}
          title={`${device.label} (${device.width})`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: activeBreakpoint === device.id
              ? 'rgba(237, 127, 53, 0.2)'
              : 'transparent',
            border: activeBreakpoint === device.id
              ? '1px solid rgba(237, 127, 53, 0.4)'
              : '1px solid transparent',
            borderRadius: 6,
            color: activeBreakpoint === device.id
              ? '#ED7F35'
              : 'rgba(255, 255, 255, 0.6)',
            fontSize: 12,
            fontWeight: activeBreakpoint === device.id ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{ fontSize: 14 }}>{device.icon}</span>
          <span>{device.label}</span>
        </button>
      ))}

      <div
        style={{
          width: 1,
          height: 20,
          background: 'rgba(255, 255, 255, 0.1)',
          margin: '0 8px',
        }}
      />

      <button
        onClick={() => setIsPreviewMode(!isPreviewMode)}
        title={isPreviewMode ? 'Exit Preview' : 'Preview Mode'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: isPreviewMode
            ? 'rgba(34, 197, 94, 0.2)'
            : 'transparent',
          border: isPreviewMode
            ? '1px solid rgba(34, 197, 94, 0.4)'
            : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 6,
          color: isPreviewMode
            ? '#22C55E'
            : 'rgba(255, 255, 255, 0.6)',
          fontSize: 12,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span>{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
      </button>
    </div>
  );
}
