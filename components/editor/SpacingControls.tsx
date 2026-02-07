'use client';

import { useState, useEffect } from 'react';
import { useResponsive } from './ResponsiveContext';

interface SpacingControlsProps {
  elementPath: string;
  onClose: () => void;
}

type SpacingSide = 'top' | 'right' | 'bottom' | 'left';
type SpacingType = 'margin' | 'padding';

function parseValue(value: string | number | undefined): number {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value) || 0;
}

function SpacingInput({
  label,
  value,
  onChange,
  side,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  side: SpacingSide;
}) {
  const isVertical = side === 'top' || side === 'bottom';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'row' : 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{
          width: 48,
          padding: '4px 6px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 4,
          color: '#FFF',
          fontSize: 12,
          textAlign: 'center',
        }}
      />
    </div>
  );
}

function SpacingBox({
  type,
  values,
  onChange,
}: {
  type: SpacingType;
  values: Record<SpacingSide, number>;
  onChange: (side: SpacingSide, value: number) => void;
}) {
  const color = type === 'margin' ? '#ED7F35' : '#8B24C7';

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.1em',
          color,
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        {type.toUpperCase()}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gridTemplateRows: 'auto auto auto',
          gap: 4,
          alignItems: 'center',
          justifyItems: 'center',
        }}
      >
        {/* Top */}
        <div style={{ gridColumn: '2', gridRow: '1' }}>
          <SpacingInput
            label="T"
            value={values.top}
            onChange={(v) => onChange('top', v)}
            side="top"
          />
        </div>

        {/* Left */}
        <div style={{ gridColumn: '1', gridRow: '2' }}>
          <SpacingInput
            label="L"
            value={values.left}
            onChange={(v) => onChange('left', v)}
            side="left"
          />
        </div>

        {/* Center visual */}
        <div
          style={{
            gridColumn: '2',
            gridRow: '2',
            width: 40,
            height: 40,
            background: `rgba(${type === 'margin' ? '237, 127, 53' : '139, 36, 199'}, 0.1)`,
            border: `2px dashed ${color}`,
            borderRadius: 4,
          }}
        />

        {/* Right */}
        <div style={{ gridColumn: '3', gridRow: '2' }}>
          <SpacingInput
            label="R"
            value={values.right}
            onChange={(v) => onChange('right', v)}
            side="right"
          />
        </div>

        {/* Bottom */}
        <div style={{ gridColumn: '2', gridRow: '3' }}>
          <SpacingInput
            label="B"
            value={values.bottom}
            onChange={(v) => onChange('bottom', v)}
            side="bottom"
          />
        </div>
      </div>
    </div>
  );
}

export default function SpacingControls({ elementPath, onClose }: SpacingControlsProps) {
  const { getElementStyles, updateElementStyle, activeBreakpoint } = useResponsive();
  const elementStyles = getElementStyles(elementPath);

  const [margin, setMargin] = useState<Record<SpacingSide, number>>({
    top: parseValue(elementStyles.styles.marginTop),
    right: parseValue(elementStyles.styles.marginRight),
    bottom: parseValue(elementStyles.styles.marginBottom),
    left: parseValue(elementStyles.styles.marginLeft),
  });

  const [padding, setPadding] = useState<Record<SpacingSide, number>>({
    top: parseValue(elementStyles.styles.paddingTop),
    right: parseValue(elementStyles.styles.paddingRight),
    bottom: parseValue(elementStyles.styles.paddingBottom),
    left: parseValue(elementStyles.styles.paddingLeft),
  });

  const [gap, setGap] = useState<number>(parseValue(elementStyles.styles.gap));

  // Update local state when breakpoint changes
  useEffect(() => {
    const styles = getElementStyles(elementPath);
    setMargin({
      top: parseValue(styles.styles.marginTop),
      right: parseValue(styles.styles.marginRight),
      bottom: parseValue(styles.styles.marginBottom),
      left: parseValue(styles.styles.marginLeft),
    });
    setPadding({
      top: parseValue(styles.styles.paddingTop),
      right: parseValue(styles.styles.paddingRight),
      bottom: parseValue(styles.styles.paddingBottom),
      left: parseValue(styles.styles.paddingLeft),
    });
    setGap(parseValue(styles.styles.gap));
  }, [activeBreakpoint, elementPath, getElementStyles]);

  const handleMarginChange = (side: SpacingSide, value: number) => {
    setMargin(prev => ({ ...prev, [side]: value }));
    updateElementStyle(elementPath, `margin${side.charAt(0).toUpperCase() + side.slice(1)}`, `${value}px`);
  };

  const handlePaddingChange = (side: SpacingSide, value: number) => {
    setPadding(prev => ({ ...prev, [side]: value }));
    updateElementStyle(elementPath, `padding${side.charAt(0).toUpperCase() + side.slice(1)}`, `${value}px`);
  };

  const handleGapChange = (value: number) => {
    setGap(value);
    updateElementStyle(elementPath, 'gap', `${value}px`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 100,
        right: 24,
        width: 280,
        background: 'rgba(10, 10, 10, 0.98)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#FFF' }}>Spacing</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            {activeBreakpoint.charAt(0).toUpperCase() + activeBreakpoint.slice(1)}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        <SpacingBox type="margin" values={margin} onChange={handleMarginChange} />
        <SpacingBox type="padding" values={padding} onChange={handlePaddingChange} />

        {/* Gap */}
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              color: '#22C55E',
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            GAP
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range"
              min="0"
              max="100"
              value={gap}
              onChange={(e) => handleGapChange(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: '#22C55E',
              }}
            />
            <input
              type="number"
              value={gap}
              onChange={(e) => handleGapChange(parseFloat(e.target.value) || 0)}
              style={{
                width: 56,
                padding: '4px 8px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 4,
                color: '#FFF',
                fontSize: 12,
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>px</span>
          </div>
        </div>
      </div>

      {/* Element path indicator */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: 10,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'monospace',
        }}
      >
        {elementPath}
      </div>
    </div>
  );
}
