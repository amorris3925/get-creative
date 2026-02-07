'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export interface StyleChange {
  elementPath: string;
  breakpoint: Breakpoint;
  styles: Record<string, string | number>;
  isVisible: boolean;
}

export interface ElementStyles {
  styles: Record<string, string | number>;
  isVisible: boolean;
}

interface ResponsiveState {
  activeBreakpoint: Breakpoint;
  setActiveBreakpoint: (bp: Breakpoint) => void;
  viewportWidth: number;
  isPreviewMode: boolean;
  setIsPreviewMode: (preview: boolean) => void;
  selectedElement: string | null;
  setSelectedElement: (element: string | null) => void;
  pendingStyleChanges: Map<string, StyleChange>;
  updateElementStyle: (elementPath: string, property: string, value: string | number) => void;
  updateElementVisibility: (elementPath: string, isVisible: boolean) => void;
  saveStyles: () => Promise<void>;
  discardStyleChanges: () => void;
  hasStyleChanges: boolean;
  isSavingStyles: boolean;
  getElementStyles: (elementPath: string) => ElementStyles;
  sectionStyles: Map<string, ElementStyles>;
  setSectionStyles: (styles: Map<string, ElementStyles>) => void;
}

const VIEWPORT_WIDTHS: Record<Breakpoint, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 375,
};

const ResponsiveContext = createContext<ResponsiveState | null>(null);

interface ResponsiveProviderProps {
  children: ReactNode;
  initialStyles?: Map<string, ElementStyles>;
}

export function ResponsiveProvider({ children, initialStyles }: ResponsiveProviderProps) {
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [pendingStyleChanges, setPendingStyleChanges] = useState<Map<string, StyleChange>>(new Map());
  const [isSavingStyles, setIsSavingStyles] = useState(false);
  const [sectionStyles, setSectionStyles] = useState<Map<string, ElementStyles>>(
    initialStyles || new Map()
  );

  const hasStyleChanges = pendingStyleChanges.size > 0;

  const getChangeKey = (elementPath: string, breakpoint: Breakpoint) =>
    `${elementPath}:${breakpoint}`;

  const updateElementStyle = useCallback((elementPath: string, property: string, value: string | number) => {
    setPendingStyleChanges(prev => {
      const next = new Map(prev);
      const key = getChangeKey(elementPath, activeBreakpoint);
      const existing = next.get(key) || {
        elementPath,
        breakpoint: activeBreakpoint,
        styles: {},
        isVisible: true,
      };

      next.set(key, {
        ...existing,
        styles: {
          ...existing.styles,
          [property]: value,
        },
      });

      return next;
    });
  }, [activeBreakpoint]);

  const updateElementVisibility = useCallback((elementPath: string, isVisible: boolean) => {
    setPendingStyleChanges(prev => {
      const next = new Map(prev);
      const key = getChangeKey(elementPath, activeBreakpoint);
      const existing = next.get(key) || {
        elementPath,
        breakpoint: activeBreakpoint,
        styles: {},
        isVisible: true,
      };

      next.set(key, {
        ...existing,
        isVisible,
      });

      return next;
    });
  }, [activeBreakpoint]);

  const saveStyles = useCallback(async () => {
    if (pendingStyleChanges.size === 0) return;

    setIsSavingStyles(true);
    try {
      const changes = Array.from(pendingStyleChanges.values());

      const response = await fetch('/api/styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      });

      if (!response.ok) {
        throw new Error('Failed to save styles');
      }

      // Update local state with saved changes
      setSectionStyles(prev => {
        const next = new Map(prev);
        for (const change of changes) {
          const key = getChangeKey(change.elementPath, change.breakpoint);
          const existing = next.get(key) || { styles: {}, isVisible: true };
          next.set(key, {
            styles: { ...existing.styles, ...change.styles },
            isVisible: change.isVisible,
          });
        }
        return next;
      });

      setPendingStyleChanges(new Map());
    } catch (error) {
      console.error('Failed to save styles:', error);
      throw error;
    } finally {
      setIsSavingStyles(false);
    }
  }, [pendingStyleChanges]);

  const discardStyleChanges = useCallback(() => {
    setPendingStyleChanges(new Map());
  }, []);

  const getElementStyles = useCallback((elementPath: string): ElementStyles => {
    const key = getChangeKey(elementPath, activeBreakpoint);

    // Check pending changes first
    const pending = pendingStyleChanges.get(key);
    if (pending) {
      const saved = sectionStyles.get(key) || { styles: {}, isVisible: true };
      return {
        styles: { ...saved.styles, ...pending.styles },
        isVisible: pending.isVisible,
      };
    }

    // Return saved styles or defaults
    return sectionStyles.get(key) || { styles: {}, isVisible: true };
  }, [activeBreakpoint, pendingStyleChanges, sectionStyles]);

  return (
    <ResponsiveContext.Provider value={{
      activeBreakpoint,
      setActiveBreakpoint,
      viewportWidth: VIEWPORT_WIDTHS[activeBreakpoint],
      isPreviewMode,
      setIsPreviewMode,
      selectedElement,
      setSelectedElement,
      pendingStyleChanges,
      updateElementStyle,
      updateElementVisibility,
      saveStyles,
      discardStyleChanges,
      hasStyleChanges,
      isSavingStyles,
      getElementStyles,
      sectionStyles,
      setSectionStyles,
    }}>
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useResponsive() {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
}
