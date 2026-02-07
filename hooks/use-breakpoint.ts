import * as React from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export interface BreakpointValues<T> {
  mobile: T;
  tablet?: T;
  desktop?: T;
}

/**
 * Hook that returns the current breakpoint based on window width.
 * - mobile: 0-767px
 * - tablet: 768-1023px
 * - desktop: 1024px+
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('desktop');

  React.useEffect(() => {
    const getBreakpoint = (): Breakpoint => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.tablet) return 'mobile';
      if (width < BREAKPOINTS.desktop) return 'tablet';
      return 'desktop';
    };

    const handleResize = () => setBreakpoint(getBreakpoint());

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

/**
 * Helper function to get responsive values based on current breakpoint.
 * Falls back to smaller breakpoint values if larger ones aren't defined.
 */
export function responsive<T>(
  breakpoint: Breakpoint,
  values: BreakpointValues<T>
): T {
  if (breakpoint === 'desktop') {
    return values.desktop ?? values.tablet ?? values.mobile;
  }
  if (breakpoint === 'tablet') {
    return values.tablet ?? values.mobile;
  }
  return values.mobile;
}

/**
 * Returns a CSS grid-template-columns value based on breakpoint.
 * @param breakpoint - Current breakpoint
 * @param desktop - Number of columns on desktop
 * @param tablet - Number of columns on tablet (defaults to min(desktop, 2))
 * @param mobile - Number of columns on mobile (defaults to 1)
 */
export function responsiveGridColumns(
  breakpoint: Breakpoint,
  desktop: number,
  tablet?: number,
  mobile?: number
): string {
  const cols = {
    mobile: mobile ?? 1,
    tablet: tablet ?? Math.min(desktop, 2),
    desktop: desktop,
  };

  const count =
    breakpoint === 'desktop'
      ? cols.desktop
      : breakpoint === 'tablet'
        ? cols.tablet
        : cols.mobile;

  return `repeat(${count}, 1fr)`;
}

/**
 * Returns responsive font size based on breakpoint.
 * Automatically scales down for smaller screens.
 */
export function responsiveFontSize(
  breakpoint: Breakpoint,
  desktop: number,
  tablet?: number,
  mobile?: number
): number {
  const sizes = {
    mobile: mobile ?? Math.round(desktop * 0.5),
    tablet: tablet ?? Math.round(desktop * 0.7),
    desktop: desktop,
  };

  return breakpoint === 'desktop'
    ? sizes.desktop
    : breakpoint === 'tablet'
      ? sizes.tablet
      : sizes.mobile;
}

/**
 * Returns responsive padding based on breakpoint.
 */
export function responsivePadding(
  breakpoint: Breakpoint,
  desktop: number | string,
  tablet?: number | string,
  mobile?: number | string
): number | string {
  if (typeof desktop === 'string') {
    return responsive(breakpoint, {
      mobile: mobile ?? desktop,
      tablet: tablet ?? desktop,
      desktop: desktop,
    });
  }

  return responsive(breakpoint, {
    mobile: mobile ?? Math.round(desktop * 0.4),
    tablet: tablet ?? Math.round(desktop * 0.65),
    desktop: desktop,
  });
}

/**
 * Common responsive patterns for IC components
 */
export const responsivePatterns = {
  /** Section title font size: 32px desktop, 28px tablet, 24px mobile */
  sectionTitle: (breakpoint: Breakpoint): number =>
    responsive(breakpoint, { mobile: 24, tablet: 28, desktop: 32 }),

  /** Body large font size: 24px desktop, 20px tablet, 18px mobile */
  bodyLarge: (breakpoint: Breakpoint): number =>
    responsive(breakpoint, { mobile: 18, tablet: 20, desktop: 24 }),

  /** Body font size: 18px desktop, 16px tablet, 15px mobile */
  body: (breakpoint: Breakpoint): number =>
    responsive(breakpoint, { mobile: 15, tablet: 16, desktop: 18 }),

  /** Section padding: 64px desktop, 40px tablet, 24px mobile */
  sectionPadding: (breakpoint: Breakpoint): number =>
    responsive(breakpoint, { mobile: 24, tablet: 40, desktop: 64 }),

  /** Content max width */
  contentMaxWidth: (breakpoint: Breakpoint): string | number =>
    responsive(breakpoint, { mobile: '100%', tablet: '900px', desktop: '1200px' }),

  /** Grid gap: 32px desktop, 24px tablet, 16px mobile */
  gridGap: (breakpoint: Breakpoint): number =>
    responsive(breakpoint, { mobile: 16, tablet: 24, desktop: 32 }),

  /** Card padding: 24px desktop, 20px tablet, 16px mobile */
  cardPadding: (breakpoint: Breakpoint): number =>
    responsive(breakpoint, { mobile: 16, tablet: 20, desktop: 24 }),

  /** Margin bottom for sections: 64px desktop, 48px tablet, 32px mobile */
  sectionMargin: (breakpoint: Breakpoint): number =>
    responsive(breakpoint, { mobile: 32, tablet: 48, desktop: 64 }),
};
