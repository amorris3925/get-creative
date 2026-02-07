'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DefaultContent } from '@/lib/content/defaults';
import { useBreakpoint } from '@/hooks/use-breakpoint';

interface ZurichV2Props {
  content: DefaultContent;
}

export default function ZurichV2({ content }: ZurichV2Props) {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const [clientType, setClientType] = useState<'retail' | 'enterprise'>('retail');
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const [yearsCount, setYearsCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [selectedServices, setSelectedServices] = useState<number[]>([0, 1, 2]);
  const [adHocDesign, setAdHocDesign] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(3);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [allTiersExpanded, setAllTiersExpanded] = useState(false);
  const [ctaWordIndex, setCtaWordIndex] = useState(0);
  const [ctaFading, setCtaFading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  
  // Use content from CMS or defaults
  const ctaWords = content.hero.ctaWords;
  // Scroll detection for sticky CTA and count animation
  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past hero (100vh)
      setShowStickyCTA(window.scrollY > window.innerHeight * 0.8);

      // Animate count when stats section is in view
      if (statsRef.current && !hasAnimated) {
        const rect = statsRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setHasAnimated(true);
          // Animate from 0 to 10
          let count = 0;
          const interval = setInterval(() => {
            count += 1;
            setYearsCount(count);
            if (count >= 10) clearInterval(interval);
          }, 80);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnimated]);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    // Observe all elements with reveal classes
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach((el) => observer.observe(el));

    // Initial check: reveal elements already in viewport on mount
    // This fixes Storybook and other iframe environments where IntersectionObserver
    // may not fire immediately for elements already visible
    requestAnimationFrame(() => {
      revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInViewport) {
          el.classList.add('visible');
        }
      });
    });

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // CTA word cycling animation (for enterprise) - smooth fade transition
  useEffect(() => {
    if (clientType !== 'enterprise') return;
    const interval = setInterval(() => {
      // Start fade out
      setCtaFading(true);
      // After fade out completes, change word and fade in
      setTimeout(() => {
        setCtaWordIndex(prev => (prev + 1) % ctaWords.length);
        setCtaFading(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [clientType, ctaWords.length]);

  // Selectable services (user picks 3 of these 5)
  const selectableServices = [
    { name: 'Geofencing Ads', desc: 'Precision targeting within 5 miles', immediate: 2.8, longterm: 1.4 },
    { name: 'Google Ads', desc: 'Search campaigns that convert', immediate: 3.2, longterm: 1.2 },
    { name: 'Facebook & Instagram Ads', desc: 'Social that drives foot traffic', immediate: 2.4, longterm: 1.8 },
    { name: 'Email & SMS Marketing', desc: 'Direct customer engagement', immediate: 2.6, longterm: 2.8 },
    { name: 'Organic Social (FB/IG)', desc: 'Content & community building', immediate: 1.4, longterm: 2.6 },
  ];

  // Always-included services (locked in, cannot deselect)
  const lockedServices = [
    { name: 'Dedicated Customer Success Manager', desc: 'Your strategic partner', immediate: 1.2, longterm: 1.8 },
    { name: 'Bev-Alc Specialized Staff', desc: 'Access to entire team', immediate: 1.0, longterm: 1.5 },
    { name: 'Customer Dashboard', desc: 'State-of-the-art reporting', immediate: 0.8, longterm: 1.2 },
    { name: 'Foot Traffic & Online Insights', desc: 'State, regional & national data exclusive to partners', immediate: 2.0, longterm: 2.8 },
    { name: 'Google Platform Suite', desc: 'Business Profile, Search Console, Merchant Center', immediate: 1.8, longterm: 2.5 },
    { name: 'Website Optimization', desc: 'Ongoing optimization & seasonal changes', immediate: 1.5, longterm: 2.2 },
  ];

  // Combined for ROI calculation
  const allServices = [...selectableServices, ...lockedServices];

  // Services array for other sections (backwards compatibility)
  const services = [
    { name: 'Geofencing Ads', desc: 'Precision targeting within 5 miles' },
    { name: 'Google Ads', desc: 'Search campaigns that convert' },
    { name: 'Facebook & Instagram Ads', desc: 'Social that drives foot traffic' },
    { name: 'Website Optimization', desc: 'Ongoing optimization & seasonal changes' },
    { name: 'Google Platform Suite', desc: 'Business Profile, Search Console, Merchant Center' },
    { name: 'SEO', desc: 'Dominate local search' },
    { name: 'Email & SMS Marketing', desc: 'Direct customer engagement' },
    { name: 'Organic Social', desc: 'Content & community building' },
    { name: 'Brand Development & Rebranding', desc: 'Build a brand that commands loyalty and premium positioning' },
    { name: 'Store Openings & Launches', desc: 'Full-service marketing for new locations and grand openings' },
    { name: 'Go-To-Market Strategy', desc: 'Strategic market entry plans that build sustainable growth' },
    { name: 'Strategic Growth Advisory', desc: 'Long-term partnership for expansion and market dominance' },
  ];

  // Calculate ROI with sparkline data for all timeframes
  // Immediate = trackable first-time customers from ad spend
  // Repeat/Retention = returning customers (untrackable but real value)
  // Long-term = Immediate + Repeat combined over time
  const calculateROI = () => {
    const baseSpend = 3000;
    let immediateMultiplier = 1;
    let repeatMultiplier = 0.6; // Repeat customers & basket size - starts lower, compounds over time

    // Add locked services
    lockedServices.forEach(service => {
      immediateMultiplier += service.immediate * 0.15;
      repeatMultiplier += service.longterm * 0.08;
    });

    // Add selected services
    selectedServices.forEach(idx => {
      immediateMultiplier += selectableServices[idx].immediate * 0.15;
      repeatMultiplier += selectableServices[idx].longterm * 0.1;
    });

    // Ad-hoc design adds small multiplier
    if (adHocDesign) {
      immediateMultiplier += 0.1;
      repeatMultiplier += 0.15;
    }

    // Generate sparkline data for 1, 3, 6, 12 months
    const months = [1, 3, 6, 12];
    // Repeat compounds more aggressively over time (customer loyalty builds)
    const repeatTimeMultipliers: Record<number, number> = { 1: 0.2, 3: 0.6, 6: 1.2, 12: 2.2 };

    const sparklineData = months.map(m => {
      const immediateVal = Math.round(baseSpend * immediateMultiplier * m);
      const repeatVal = Math.round(baseSpend * repeatMultiplier * repeatTimeMultipliers[m] * m * 0.5);
      return {
        month: m,
        immediate: immediateVal,
        repeat: repeatVal,
        longterm: immediateVal + repeatVal, // Long-term is the sum
      };
    });

    const finalData = sparklineData[3]; // 12-month projection
    return {
      immediate: finalData.immediate,
      repeat: finalData.repeat,
      longterm: finalData.longterm, // This is now immediate + repeat
      sparkline: sparklineData,
    };
  };

  const toggleService = (idx: number) => {
    setSelectedServices(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      } else if (prev.length < 3) {
        return [...prev, idx];
      }
      return prev; // Max 3 selected
    });
  };

  // Pricing tiers with expanded details
  const pricingTiers = [
    {
      name: 'White Glove',
      price: 3000,
      onboarding: 1500,
      services: 5,
      tagline: 'PROVEN EXCELLENCE',
      desc: 'Gain access to the exact strategies and marketing playbooks that power the top 0.1% of liquor stores nationwide.',
      keyDiff: 'Elite Store Strategies',
      keyDiffDetail: 'Proven tactics from top-performing stores',
      features: ['Strategies from America\'s top liquor stores', 'Dedicated Customer Success Manager', 'Monthly strategy sessions', 'Real-time performance dashboard', 'Aggregated insights from 107 stores'],
      expandedFeatures: ['Dedicated Slack channel', 'Monthly performance reports', 'Quarterly strategy reviews', 'Access to creative templates', 'Priority email support'],
      bestFor: 'Single locations & small chains',
      commitment: '6 months',
      best: false,
    },
    {
      name: 'Growth Partner',
      price: 5000,
      onboarding: 3000,
      services: 7,
      tagline: 'FOUNDER-LED GROWTH',
      desc: 'Monthly strategy sessions with our founder plus full access to our executive production, sales, and fulfillment teams.',
      keyDiff: 'Founder + Full Executive Team',
      keyDiffDetail: 'Direct access to leadership & operations',
      features: ['Monthly founder strategy sessions', 'Full executive team collaboration', 'Production team support', 'Sales & fulfillment coordination', 'Custom growth roadmap'],
      expandedFeatures: ['Chain competition monitoring', 'Rebranding consultation', 'Long-term growth roadmap', 'Custom analytics dashboards', 'Quarterly business reviews', 'Priority implementation'],
      bestFor: 'Growing chains & ambitious retailers',
      commitment: '6 months',
      best: true,
    },
    {
      name: 'Strategic Advisory',
      price: 8000,
      onboarding: 5000,
      services: 7,
      tagline: 'EXECUTIVE PARTNERSHIP',
      desc: 'Your dedicated account manager (no shared clients), two hours monthly with our founder, plus deep market intelligence.',
      keyDiff: 'Dedicated AM + 2hr Founder Monthly',
      keyDiffDetail: 'Exclusive attention & market intelligence',
      features: ['Dedicated Account Manager (you\'re their only client)', '2x 1-hour founder sessions per month', 'Deep foot traffic & market insights', 'Competitor tracking & analysis', 'Executive-ready presentations'],
      expandedFeatures: ['Board/investor presentation support', 'M&A due diligence support', 'National expansion strategy', 'Vendor negotiation support', 'Crisis management', 'Direct founder mobile access'],
      bestFor: 'Regional chains & market leaders',
      commitment: '6 months',
      best: false,
    },
  ];

  const caseStudies = [
    { metric: '+312%', label: 'ROI', client: 'Regional Chain (14 Locations)', desc: 'Comprehensive digital strategy combining geofencing with SEO optimization' },
    { metric: '+47%', label: 'Foot Traffic', client: 'Urban Wine Shop', desc: 'Precision geofencing during off-peak hours drove measurable in-store visits' },
    { metric: '+89%', label: 'Online Orders', client: 'Suburban Liquor Store', desc: 'City Hive optimization combined with Google Ads campaign' },
  ];

  const testimonials = [
    { quote: 'They understand liquor retail like no other agency. Our ROI tripled in 6 months.', name: 'Owner', location: 'Multi-Location Chain, Texas' },
    { quote: 'Finally, an agency that speaks our language. The 3-tier expertise is real.', name: 'Marketing Director', location: 'Regional Distributor, California' },
    { quote: 'LiquorChat alone paid for the entire engagement. Game changer.', name: 'Owner', location: 'Independent Wine Shop, NYC' },
  ];

  const clientTypes = [
    { name: 'Independent Liquor Stores', count: '47' },
    { name: 'Regional Chains', count: '23' },
    { name: 'Wine & Spirits Shops', count: '31' },
    { name: 'Craft Beverage Retailers', count: '15' },
  ];

  // Enterprise/Chain Services
  const enterpriseServices = [
    {
      title: 'Custom GTM Strategy',
      desc: 'Tailored go-to-market strategies built for your specific market, audience, and growth objectives.',
      icon: '01',
      for: 'All Enterprise Clients',
    },
    {
      title: 'Centralized Campaign Management',
      desc: 'Whether 1 location or 500+, everything is managed centrally with localized execution and unified brand voice.',
      icon: '02',
      for: 'Regional & National Chains',
    },
    {
      title: 'Dedicated Account Executive',
      desc: 'Your dedicated account executive works alongside Alden Morris to ensure strategic alignment at every level.',
      icon: '03',
      for: 'All Enterprise Clients',
    },
    {
      title: 'Brand Strategy & Positioning',
      desc: 'Define your market position and craft messaging that resonates across all 3 tiers of the beverage industry.',
      icon: '04',
      for: 'Producers, Distributors, Chains',
    },
    {
      title: 'Creative & Graphics',
      desc: 'Full-service creative team delivering campaigns, social content, print materials, and brand assets at scale.',
      icon: '05',
      for: 'All Enterprise Clients',
    },
    {
      title: 'Distributor Marketing',
      desc: 'B2B campaigns to strengthen retailer relationships, drive reorders, and expand distribution footprint.',
      icon: '06',
      for: 'Wholesale & Distribution',
    },
  ];

  const growthPartnerPoints = [
    {
      title: 'We Think Like Owners',
      desc: 'Most agencies treat you like a task list. We think about your business as if it were ours—analyzing margins, understanding seasonality, and optimizing for real profit, not vanity metrics.',
      icon: '01',
    },
    {
      title: 'Strategy Before Tactics',
      desc: 'We don\'t just run ads. We build comprehensive growth systems that compound over time. Every campaign connects to a larger strategic framework designed for long-term dominance.',
      icon: '02',
    },
    {
      title: 'Data-Obsessed Decisions',
      desc: 'Every recommendation is backed by proprietary data from 107 liquor retailers. We know what works because we\'ve tested it across diverse markets, store sizes, and demographics.',
      icon: '03',
    },
    {
      title: 'Skin in the Game',
      desc: 'We built LiquorChat—a SaaS product with 3 patents pending. We\'re not just advisors, we\'re operators who understand the daily challenges of running a beverage retail business.',
      icon: '04',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FDFDFC',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      color: '#0A0A0A',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Glassmorphism Blobs - Orange Primary */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <div style={{
          position: 'absolute',
          top: '5%',
          right: '-20%',
          width: '55vw',
          height: '55vw',
          background: 'radial-gradient(ellipse at center, rgba(237, 127, 53, 0.15) 0%, rgba(237, 127, 53, 0.04) 50%, transparent 70%)',
          borderRadius: '60% 40% 50% 50% / 50% 60% 40% 50%',
          filter: 'blur(60px)',
          animation: 'zurichBlob1 25s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '0%',
          left: '-15%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(ellipse at center, rgba(249, 56, 48, 0.10) 0%, rgba(249, 56, 48, 0.02) 50%, transparent 70%)',
          borderRadius: '40% 60% 55% 45% / 55% 45% 55% 45%',
          filter: 'blur(70px)',
          animation: 'zurichBlob2 30s ease-in-out infinite',
        }} />
        <style>{`
          @keyframes zurichBlob1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-8%, 12%) scale(1.08); }
          }
          @keyframes zurichBlob2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(10%, -8%) scale(1.1); }
          }
          @keyframes slideIn {
            0% { opacity: 0; transform: translateX(20px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInDown {
            0% { opacity: 0; transform: translateY(-40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInLeft {
            0% { opacity: 0; transform: translateX(-50px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeInRight {
            0% { opacity: 0; transform: translateX(50px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes scaleIn {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes countUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          /* Scroll-triggered animation classes */
          .reveal {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .reveal.visible {
            opacity: 1;
            transform: translateY(0);
          }
          .reveal-left {
            opacity: 0;
            transform: translateX(-50px);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .reveal-left.visible {
            opacity: 1;
            transform: translateX(0);
          }
          .reveal-right {
            opacity: 0;
            transform: translateX(50px);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .reveal-right.visible {
            opacity: 1;
            transform: translateX(0);
          }
          .reveal-scale {
            opacity: 0;
            transform: scale(0.95);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .reveal-scale.visible {
            opacity: 1;
            transform: scale(1);
          }

          /* Staggered delays for children */
          .stagger-children > *:nth-child(1) { transition-delay: 0s; }
          .stagger-children > *:nth-child(2) { transition-delay: 0.1s; }
          .stagger-children > *:nth-child(3) { transition-delay: 0.2s; }
          .stagger-children > *:nth-child(4) { transition-delay: 0.3s; }
          .stagger-children > *:nth-child(5) { transition-delay: 0.4s; }
          .stagger-children > *:nth-child(6) { transition-delay: 0.5s; }
          .stagger-children > *:nth-child(7) { transition-delay: 0.6s; }
          .stagger-children > *:nth-child(8) { transition-delay: 0.7s; }

          .animate-delay-100 { transition-delay: 0.1s !important; }
          .animate-delay-200 { transition-delay: 0.2s !important; }
          .animate-delay-300 { transition-delay: 0.3s !important; }
          .animate-delay-400 { transition-delay: 0.4s !important; }
          .animate-delay-500 { transition-delay: 0.5s !important; }
          .animate-delay-600 { transition-delay: 0.6s !important; }

          /* Hero animations - immediate */
          .hero-animate {
            animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
          }
          .hero-animate-delay-1 { animation-delay: 0.1s; }
          .hero-animate-delay-2 { animation-delay: 0.2s; }
          .hero-animate-delay-3 { animation-delay: 0.3s; }
          .hero-animate-delay-4 { animation-delay: 0.4s; }
          .hero-animate-delay-5 { animation-delay: 0.5s; }
        `}</style>
      </div>

      {/* Floating Navigation Bar - Outer positioning wrapper */}
      <div style={{
        position: 'fixed',
        top: isMobile ? 12 : 24,
        left: isMobile ? 12 : 0,
        right: isMobile ? 12 : 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        {/* Inner nav container - expands to fit content */}
        <nav style={{
          display: isMobile ? 'flex' : 'inline-flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'space-between' : 'center',
          gap: isMobile ? 12 : 16,
          padding: isMobile ? '10px 16px' : '12px 24px',
          width: isMobile ? '100%' : 'auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: isMobile ? 12 : 16,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12), 0 8px 48px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          pointerEvents: 'auto',
        }}>
          {/* Logo */}
          <img
            src="/ic-logo.avif"
            alt="Intentionally Creative"
            style={{
              height: isMobile ? 36 : 36,
              width: 'auto',
              flexShrink: 0,
            }}
          />

          {/* Mobile: Retail/Enterprise Toggle */}
          {isMobile && (
            <div style={{
              display: 'flex',
              borderRadius: 6,
              overflow: 'hidden',
              border: '1px solid rgba(10, 10, 10, 0.1)',
            }}>
              <button
                onClick={() => setClientType('retail')}
                style={{
                  padding: '8px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: clientType === 'retail' ? '#ED7F35' : 'transparent',
                  color: clientType === 'retail' ? '#FFFFFF' : '#666',
                }}
              >
                Retail
              </button>
              <button
                onClick={() => setClientType('enterprise')}
                style={{
                  padding: '8px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: clientType === 'enterprise' ? '#8B24C7' : 'transparent',
                  color: clientType === 'enterprise' ? '#FFFFFF' : '#666',
                }}
              >
                Enterprise
              </button>
            </div>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <div style={{
                width: 1,
                height: 32,
                background: 'rgba(10, 10, 10, 0.1)',
                flexShrink: 0,
              }} />
              {/* Client Type Selector - Unified Segmented Control */}
              <div style={{
                display: 'flex',
                position: 'relative',
                borderRadius: 8,
                overflow: 'visible',
                flexShrink: 0,
              }}>
                <button
                  onClick={() => setClientType('retail')}
                  style={{
                    padding: isTablet ? '10px 16px' : '12px 24px',
                    fontSize: isTablet ? 12 : 13,
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    border: clientType === 'retail' ? 'none' : '1px solid rgba(237, 127, 53, 0.3)',
                    borderRight: 'none',
                    borderRadius: '8px 0 0 8px',
                    cursor: 'pointer',
                    background: clientType === 'retail' ? '#ED7F35' : 'rgba(237, 127, 53, 0.1)',
                    color: clientType === 'retail' ? '#FFFFFF' : '#ED7F35',
                    transition: 'all 0.25s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Liquor Retail
                </button>
                <button
                  onClick={() => setClientType('enterprise')}
                  style={{
                    padding: isTablet ? '10px 16px' : '12px 24px',
                    fontSize: isTablet ? 12 : 13,
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    border: clientType === 'enterprise' ? 'none' : '1px solid rgba(139, 36, 199, 0.3)',
                    borderLeft: 'none',
                    borderRadius: '0 8px 8px 0',
                    cursor: 'pointer',
                    background: clientType === 'enterprise' ? '#8B24C7' : 'rgba(139, 36, 199, 0.1)',
                    color: clientType === 'enterprise' ? '#FFFFFF' : '#8B24C7',
                    transition: 'all 0.25s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {isTablet ? 'Enterprise' : 'Enterprise: Chains / Distributor / Producer'}
                </button>
              </div>
              <div style={{
                width: 1,
                height: 32,
                background: 'rgba(10, 10, 10, 0.1)',
                flexShrink: 0,
              }} />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                {[
                  { label: 'Services', id: 'services-section' },
                  { label: 'Results', id: 'results-section' },
                  { label: 'About', id: 'about-section' },
                  { label: 'Contact', id: 'contact-section' },
                ].map(item => (
                  <span
                    key={item.label}
                    onClick={() => {
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      padding: '8px 14px',
                      cursor: 'pointer',
                      color: '#0A0A0A',
                      borderRadius: 100,
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {item.label}
                  </span>
                ))}
                {/* Sticky CTA - appears on scroll */}
                {showStickyCTA && (
                  <button
                    style={{
                      marginLeft: 8,
                      padding: '10px 20px',
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.03em',
                      background: '#ED7F35',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 100,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(237, 127, 53, 0.4)',
                      animation: 'slideIn 0.3s ease forwards',
                      flexShrink: 0,
                    }}
                  >
                    Free Audit
                  </button>
                )}
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 70,
              left: 12,
              right: 12,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(24px)',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Client Type Selector */}
            <div style={{
              display: 'flex',
              marginBottom: 24,
              borderRadius: 8,
              overflow: 'hidden',
            }}>
              <button
                onClick={() => setClientType('retail')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: clientType === 'retail' ? '#ED7F35' : 'rgba(237, 127, 53, 0.1)',
                  color: clientType === 'retail' ? '#FFFFFF' : '#ED7F35',
                }}
              >
                Retail
              </button>
              <button
                onClick={() => setClientType('enterprise')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: clientType === 'enterprise' ? '#8B24C7' : 'rgba(139, 36, 199, 0.1)',
                  color: clientType === 'enterprise' ? '#FFFFFF' : '#8B24C7',
                }}
              >
                Enterprise
              </button>
            </div>
            {/* Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Services', id: 'services-section' },
                { label: 'Results', id: 'results-section' },
                { label: 'About', id: 'about-section' },
                { label: 'Contact', id: 'contact-section' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => {
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '12px 0',
                    fontSize: 16,
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#0A0A0A',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {/* CTA Button */}
            <button
              style={{
                marginTop: 24,
                width: '100%',
                padding: '16px 24px',
                fontSize: 14,
                fontWeight: 600,
                background: '#ED7F35',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Get Free Audit
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section
        data-element="hero"
        style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: isMobile ? '100px 24px 60px' : isTablet ? '120px 40px 70px' : '140px 64px 80px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 48 : isTablet ? 48 : 80,
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%',
        }}>
          {/* Left: Industry Focus */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Industry Badge */}
            <div className="hero-animate hero-animate-delay-1" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(237, 127, 53, 0.1)',
              border: '1px solid rgba(237, 127, 53, 0.2)',
              borderRadius: 100,
              padding: '8px 16px',
              marginBottom: 32,
              width: 'fit-content',
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ED7F35',
              }} />
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#ED7F35',
              }}>
                ALCOHOLIC BEVERAGE INDUSTRY ONLY
              </span>
            </div>

            <div
              ref={statsRef}
              className="hero-animate hero-animate-delay-2"
              style={{
                fontSize: 'clamp(100px, 15vw, 180px)',
                fontWeight: 200,
                lineHeight: 0.85,
                letterSpacing: '-0.04em',
                color: '#ED7F35',
                transition: 'transform 0.3s ease',
              }}
            >
              {yearsCount}<span style={{ fontSize: '0.5em', verticalAlign: 'super' }}>+</span>
            </div>
            <div className="hero-animate hero-animate-delay-3" style={{
              fontSize: 14,
              letterSpacing: '0.2em',
              marginTop: 24,
              fontWeight: 500,
              color: '#0A0A0A',
            }}>
              YEARS IN THE 3-TIER ALC-BEV INDUSTRY
            </div>

            {/* 3-Tier Indicators */}
            <div className="hero-animate hero-animate-delay-4" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, auto)',
              gap: isMobile ? 16 : 40,
              marginTop: isMobile ? 32 : 48,
            }}>
              {[
                { tier: 'Tier 1', name: 'Producer', desc: 'Breweries, Distilleries, Wineries', color: '#ED7F35' },
                { tier: 'Tier 2', name: 'Distributor', desc: 'Wholesale & Distribution', color: '#F93830' },
                { tier: 'Tier 3', name: 'Retail', desc: 'Liquor Stores & Chains', color: '#ED7F35' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? 6 : 10,
                }}>
                  <div style={{
                    width: isMobile ? 40 : 56,
                    height: isMobile ? 3 : 4,
                    background: item.color,
                    borderRadius: 2,
                  }} />
                  <span style={{
                    fontSize: isMobile ? 10 : 12,
                    letterSpacing: '0.12em',
                    color: '#555',
                    fontWeight: 500,
                  }}>
                    {item.tier.toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: isMobile ? 14 : 18,
                    fontWeight: 600,
                    color: '#0A0A0A',
                  }}>
                    {item.name}
                  </span>
                  {!isMobile && (
                    <span style={{
                      fontSize: 13,
                      color: '#777',
                      lineHeight: 1.4,
                    }}>
                      {item.desc}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Headline + Description */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <div className="hero-animate hero-animate-delay-1" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}>
              <span style={{
                fontSize: 12,
                letterSpacing: '0.15em',
                color: '#8B24C7',
                fontWeight: 600,
                padding: '8px 16px',
                background: 'rgba(139, 36, 199, 0.08)',
                borderRadius: 100,
                border: '1px solid rgba(139, 36, 199, 0.2)',
              }}>
                THE INDUSTRY&apos;S LEADING
              </span>
            </div>
            <h1 className="hero-animate hero-animate-delay-2" style={{
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 32,
            }}>
              {clientType === 'retail'
                ? <><span style={{ color: '#ED7F35' }}>Alcohol retail</span> marketing agency</>
                : <>Enterprise <span style={{ color: '#ED7F35' }}>beverage marketing</span> at scale</>
              }
            </h1>
            <p className="hero-animate hero-animate-delay-3" style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: '#555',
              maxWidth: 520,
              marginBottom: 40,
            }}>
              {clientType === 'retail'
                ? 'We help independent liquor stores and regional chains compete with big-box retailers through data-driven digital marketing built exclusively for the alcoholic beverage industry.'
                : 'From Anheuser-Busch to regional distributors, we provide enterprise-grade marketing for breweries, distilleries, wineries, and beverage corporations.'
              }
            </p>

            {/* Client Types */}
            <div className="hero-animate hero-animate-delay-4" style={{
              display: 'flex',
              gap: 12,
              marginBottom: 40,
              flexWrap: 'wrap',
            }}>
              {(clientType === 'retail'
                ? ['Liquor Stores', 'Wine Shops', 'Beer Retailers', 'Regional Chains']
                : ['Breweries', 'Distilleries', 'Wineries', 'Distributors', 'Beverage Corps']
              ).map((type, i) => (
                <span key={i} style={{
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  padding: '8px 16px',
                  background: 'rgba(237, 127, 53, 0.08)',
                  border: '1px solid rgba(237, 127, 53, 0.15)',
                  borderRadius: 100,
                  color: '#0A0A0A',
                }}>
                  {type}
              </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hero-animate hero-animate-delay-5" style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 12 : 16,
              width: isMobile ? '100%' : 'auto',
            }}>
              <button style={{
                background: '#ED7F35',
                color: '#FFFFFF',
                border: 'none',
                padding: isMobile ? '16px 24px' : '18px 36px',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.05em',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(237, 127, 53, 0.25)',
                width: isMobile ? '100%' : 'auto',
              }}>
                GET FREE AUDIT
              </button>
              <button style={{
                background: 'rgba(237, 127, 53, 0.12)',
                color: '#0A0A0A',
                border: '1px solid rgba(237, 127, 53, 0.3)',
                padding: isMobile ? '16px 24px' : '18px 36px',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '0.05em',
                borderRadius: 8,
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
              }}>
                View Case Studies
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Hidden on mobile */}
        {!isMobile && (
          <>
            <div style={{
              position: 'absolute',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              animation: 'bounceArrow 2s ease-in-out infinite',
            }}>
              <span style={{
                fontSize: 10,
                letterSpacing: '0.15em',
                color: '#999',
              }}>
                SCROLL
              </span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ED7F35"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
            <style>{`
              @keyframes bounceArrow {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(8px); }
              }
            `}</style>
          </>
        )}
      </section>

      {/* Case Studies Section - With Videos */}
      <section
        id="results-section"
        data-element="results"
        style={{
        padding: isMobile ? '60px 24px' : isTablet ? '80px 40px' : '120px 64px',
        position: 'relative',
        zIndex: 1,
        background: clientType === 'retail'
          ? 'linear-gradient(180deg, rgba(237, 127, 53, 0.03) 0%, #FDFDFC 100%)'
          : 'linear-gradient(180deg, rgba(139, 36, 199, 0.05) 0%, #FDFDFC 100%)',
        transition: 'background 0.3s ease',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="reveal" style={{
            fontSize: 11,
            letterSpacing: '0.2em',
            color: clientType === 'retail' ? '#ED7F35' : '#8B24C7',
            marginBottom: 16,
            transition: 'color 0.3s ease',
          }}>
            {clientType === 'retail' ? 'LIQUOR RETAIL CASE STUDIES' : 'ENTERPRISE & CHAIN SERVICES'}
          </div>
          <h2 className="reveal animate-delay-100" style={{
            fontSize: isMobile ? 32 : isTablet ? 40 : 48,
            fontWeight: 300,
            letterSpacing: '-0.02em',
            marginBottom: isMobile ? 40 : 64,
          }}>
            {clientType === 'retail' ? 'Measurable results' : (
              <>Marketing for <span style={{ color: '#8B24C7' }}>scale</span></>
            )}
          </h2>

          {clientType === 'enterprise' && (
            <p style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: '#666',
              maxWidth: 800,
              marginBottom: 64,
              marginTop: -32,
            }}>
              Whether you have one location or fifty, or you&apos;re a major distributor—everything is centralized and managed by a <strong>dedicated account executive</strong> working alongside <strong>Alden Morris</strong>. Enterprise partners get <strong>custom GTM strategy</strong>, full creative services, and <strong>hands-on execution</strong>.
            </p>
          )}

          {clientType === 'retail' ? (
            <>
            {/* Retail Case Studies */}
            <div className="stagger-children" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: isMobile ? 24 : 32,
            }}>
              {caseStudies.map((study, i) => (
                <div key={i} className="reveal" style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(10, 10, 10, 0.06)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                }}>
                  {/* Video Thumbnail */}
                  <div style={{
                    aspectRatio: '16/9',
                    background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'rgba(237, 127, 53, 0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 32px rgba(237, 127, 53, 0.5)',
                      transition: 'transform 0.2s ease',
                    }}>
                      <div style={{
                        width: 0,
                        height: 0,
                        borderTop: '12px solid transparent',
                        borderBottom: '12px solid transparent',
                        borderLeft: '20px solid #FFFFFF',
                        marginLeft: 4,
                      }} />
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: 16,
                      left: 16,
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.6)',
                      letterSpacing: '0.1em',
                    }}>
                      WATCH STORY
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: 32 }}>
                    <div style={{
                      fontSize: 10,
                      letterSpacing: '0.15em',
                      color: '#666',
                      marginBottom: 12,
                    }}>
                      {study.client.toUpperCase()}
                    </div>
                    <div style={{
                      fontSize: 48,
                      fontWeight: 200,
                      color: '#ED7F35',
                      letterSpacing: '-0.03em',
                      marginBottom: 8,
                    }}>
                      {study.metric}
                    </div>
                    <div style={{
                      fontSize: 12,
                      letterSpacing: '0.1em',
                      color: '#0A0A0A',
                      marginBottom: 16,
                      fontWeight: 600,
                    }}>
                      {study.label.toUpperCase()}
                    </div>
                    <p style={{
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: '#666',
                    }}>
                      {study.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CityHive Featured Case Study - Full Width */}
            <div className="reveal" style={{
              marginTop: isMobile ? 40 : 64,
              background: 'linear-gradient(135deg, #1A1708 0%, #2A2510 100%)',
              borderRadius: isMobile ? 16 : 24,
              padding: isMobile ? 24 : isTablet ? 40 : 64,
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(245, 183, 0, 0.2)',
            }}>
              {/* Background decoration - CityHive yellow glow */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '60%',
                height: '150%',
                background: 'radial-gradient(ellipse, rgba(245, 183, 0, 0.15) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr',
                gap: isMobile ? 32 : 64,
                alignItems: 'center',
                position: 'relative',
              }}>
                {/* Left: Stats */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 12 : 24,
                    marginBottom: isMobile ? 16 : 24,
                    flexWrap: 'wrap',
                  }}>
                    <div style={{
                      fontSize: 10,
                      letterSpacing: '0.2em',
                      color: '#F5B700',
                    }}>
                      FEATURED PARTNERSHIP
                    </div>
                    <img
                      src="/cityhive-logo-white.png"
                      alt="CityHive"
                      style={{
                        height: isMobile ? 40 : 72,
                        width: 'auto',
                      }}
                    />
                  </div>
                  {/* Desktop description */}
                  {!isMobile && (
                    <p style={{
                      fontSize: 16,
                      lineHeight: 1.8,
                      color: 'rgba(255,255,255,0.7)',
                      marginBottom: 32,
                    }}>
                      We created <strong style={{ color: '#F5B700' }}>marketing graphics and promotional materials</strong> deployed across CityHive&apos;s entire network of <strong style={{ color: '#F5B700' }}>7,000+ liquor stores nationwide</strong>—reaching tens of millions of retail customers.
                    </p>
                  )}

                  {/* Mobile: Single highlight */}
                  {isMobile && (
                    <div style={{
                      background: 'rgba(245, 183, 0, 0.1)',
                      border: '1px solid rgba(245, 183, 0, 0.3)',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                      textAlign: 'center',
                    }}>
                      <div style={{
                        fontSize: 32,
                        fontWeight: 200,
                        color: '#F5B700',
                        marginBottom: 4,
                      }}>
                        7,000+
                      </div>
                      <div style={{
                        fontSize: 11,
                        letterSpacing: '0.08em',
                        color: 'rgba(255,255,255,0.8)',
                        lineHeight: 1.4,
                      }}>
                        STORES USING OUR<br />GRAPHIC MATERIALS
                      </div>
                    </div>
                  )}

                  {/* 3 Bullet points - visible on both mobile and desktop */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? 8 : 12,
                    marginBottom: isMobile ? 0 : 24,
                  }}>
                    {[
                      'Custom graphics for all 7,000+ retail locations',
                      'Promotional materials reaching millions of customers',
                      'Coordinated campaigns across the entire network',
                    ].map((point, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: isMobile ? 12 : 14,
                      }}>
                        <svg width={isMobile ? 14 : 16} height={isMobile ? 14 : 16} viewBox="0 0 24 24" fill="none" stroke="#F5B700" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        {point}
                      </div>
                    ))}
                  </div>

                  {/* Key metrics - Desktop only */}
                  {!isMobile && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 24,
                  }}>
                    <div style={{
                      background: 'rgba(245, 183, 0, 0.1)',
                      border: '1px solid rgba(245, 183, 0, 0.3)',
                      borderRadius: 16,
                      padding: 24,
                    }}>
                      <div style={{
                        fontSize: 36,
                        fontWeight: 200,
                        color: '#F5B700',
                        marginBottom: 4,
                      }}>
                        50M+
                      </div>
                      <div style={{
                        fontSize: 12,
                        letterSpacing: '0.1em',
                        color: 'rgba(255,255,255,0.7)',
                      }}>
                        IMPRESSIONS
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(245, 183, 0, 0.1)',
                      border: '1px solid rgba(245, 183, 0, 0.3)',
                      borderRadius: 16,
                      padding: 24,
                    }}>
                      <div style={{
                        fontSize: 36,
                        fontWeight: 200,
                        color: '#F5B700',
                        marginBottom: 4,
                      }}>
                        $M+
                      </div>
                      <div style={{
                        fontSize: 12,
                        letterSpacing: '0.1em',
                        color: 'rgba(255,255,255,0.7)',
                      }}>
                        ATTRIBUTED REVENUE
                      </div>
                    </div>
                  </div>
                  )}
                </div>

                {/* Right: Description - Desktop only */}
                {!isMobile && (
                <div style={{
                  background: 'rgba(245, 183, 0, 0.05)',
                  border: '1px solid rgba(245, 183, 0, 0.15)',
                  borderRadius: 20,
                  padding: 40,
                }}>
                  <div style={{
                    fontSize: 11,
                    letterSpacing: '0.15em',
                    color: '#F5B700',
                    marginBottom: 24,
                  }}>
                    THE IMPACT
                  </div>
                  <p style={{
                    fontSize: 18,
                    lineHeight: 1.8,
                    color: '#FFFFFF',
                    marginBottom: 24,
                  }}>
                    Our graphic materials were deployed to <strong style={{ color: '#F5B700' }}>every store</strong> in CityHive&apos;s network—generating over <strong style={{ color: '#F5B700' }}>50 million impressions</strong> and millions in attributed revenue.
                  </p>
                  <div style={{
                    paddingTop: 24,
                    borderTop: '1px solid rgba(245, 183, 0, 0.2)',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.5)',
                    fontStyle: 'italic',
                  }}>
                    &ldquo;Intentionally Creative understood our platform and our retailers from day one. They delivered results that moved the needle for thousands of stores.&rdquo;
                  </div>
                </div>
                )}
              </div>
            </div>
            </>
          ) : (
            /* Enterprise Services - Enhanced Layout */
            <div>
              {/* Featured Enterprise Capabilities */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? 24 : 32,
                marginBottom: isMobile ? 32 : 48,
              }}>
                {/* Left: What You Get */}
                <div style={{
                  background: 'linear-gradient(135deg, #1A0A20 0%, #2D1A35 100%)',
                  borderRadius: isMobile ? 16 : 24,
                  padding: isMobile ? 24 : 48,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-30%',
                    right: '-20%',
                    width: '60%',
                    height: '80%',
                    background: 'radial-gradient(ellipse, rgba(139, 36, 199, 0.3) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }} />
                  <div style={{ position: 'relative' }}>
                    <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#8B24C7', marginBottom: isMobile ? 8 : 16 }}>
                      THE ENTERPRISE ADVANTAGE
                    </div>
                    <h3 style={{
                      fontSize: isMobile ? 20 : 28,
                      fontWeight: 400,
                      color: '#FFFFFF',
                      marginBottom: isMobile ? 16 : 24,
                      lineHeight: 1.25,
                    }}>
                      Same expertise that grew 107 retailers—now scaled for your enterprise.
                    </h3>
                    <p style={{
                      fontSize: isMobile ? 13 : 15,
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.7)',
                      marginBottom: isMobile ? 16 : 24,
                    }}>
                      We&apos;ve spent 10+ years perfecting beverage retail marketing. Enterprise clients get that same proven approach—plus dedicated resources, custom campaign strategy, and direct founder involvement.
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 12 : 16,
                      padding: isMobile ? '12px 16px' : '16px 20px',
                      background: 'rgba(139, 36, 199, 0.2)',
                      borderRadius: isMobile ? 10 : 12,
                      border: '1px solid rgba(139, 36, 199, 0.3)',
                    }}>
                      <div style={{
                        width: isMobile ? 40 : 48,
                        height: isMobile ? 40 : 48,
                        background: 'linear-gradient(135deg, #8B24C7 0%, #6B21A8 100%)',
                        borderRadius: isMobile ? 8 : 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                          <path d="M2 17l10 5 10-5"></path>
                          <path d="M2 12l10 5 10-5"></path>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: '#FFFFFF' }}>Custom GTM Strategy & Execution</div>
                        <div style={{ fontSize: isMobile ? 11 : 12, color: 'rgba(255,255,255,0.6)' }}>Campaigns, creative, and full-service delivery</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Why Enterprise */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(139, 36, 199, 0.1)',
                  borderRadius: isMobile ? 16 : 24,
                  padding: isMobile ? 24 : 48,
                }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#8B24C7', marginBottom: isMobile ? 8 : 16 }}>
                    WHY ENTERPRISE CLIENTS CHOOSE US
                  </div>
                  <h3 style={{
                    fontSize: isMobile ? 20 : 28,
                    fontWeight: 400,
                    color: '#0A0A0A',
                    marginBottom: isMobile ? 16 : 24,
                    lineHeight: 1.25,
                  }}>
                    Centralized management, dedicated support, and custom campaigns—at any scale.
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>
                    {[
                      'Dedicated account executive + direct access to Alden Morris',
                      'Custom campaign strategy, creative, and full execution',
                      'Centralized marketing management across all locations',
                      'Custom reporting dashboards for executive teams',
                    ].map((point, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <svg width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} viewBox="0 0 24 24" fill="none" stroke="#8B24C7" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        <span style={{ fontSize: isMobile ? 13 : 15, color: '#333', lineHeight: 1.4 }}>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enterprise Services Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: isMobile ? 16 : 24,
              }}>
                {enterpriseServices.map((service, i) => (
                  <div key={i} style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 36, 199, 0.15)',
                    borderRadius: isMobile ? 16 : 20,
                    padding: isMobile ? 24 : 32,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 36, 199, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, rgba(139, 36, 199, 0.1) 0%, rgba(139, 36, 199, 0.05) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 24,
                    }}>
                      <span style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: '#8B24C7',
                        fontFamily: 'monospace',
                      }}>
                        {service.icon}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      color: 'rgba(139, 36, 199, 0.7)',
                      marginBottom: 12,
                      fontWeight: 500,
                    }}>
                      {service.for.toUpperCase()}
                    </div>
                    <h3 style={{
                      fontSize: 20,
                      fontWeight: 600,
                      marginBottom: 12,
                      color: '#0A0A0A',
                    }}>
                      {service.title}
                    </h3>
                    <p style={{
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: '#666',
                    }}>
                      {service.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Massive Stats Section - Full Width */}
      <section
        data-element="stats"
        style={{
        position: 'relative',
        zIndex: 1,
        padding: isMobile ? '40px 0' : '80px 0',
        background: clientType === 'enterprise'
          ? 'linear-gradient(180deg, #FDFDFC 0%, rgba(139, 36, 199, 0.03) 100%)'
          : 'linear-gradient(180deg, #FDFDFC 0%, rgba(237, 127, 53, 0.03) 100%)',
        transition: 'background 0.3s ease',
      }}>
        <div style={{
          maxWidth: 1600,
          margin: '0 auto',
          padding: isMobile ? '0 24px' : '0 64px',
        }}>
          {/* Main headline stat */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 80 }}>
            <div style={{
              fontSize: isMobile ? 80 : 'clamp(100px, 20vw, 200px)',
              fontWeight: 100,
              letterSpacing: '-0.05em',
              lineHeight: 0.9,
              color: clientType === 'enterprise' ? '#8B24C7' : '#ED7F35',
            }}>
              {clientType === 'enterprise' ? '10+' : '107'}
            </div>
            <div style={{
              fontSize: isMobile ? 14 : 24,
              fontWeight: 300,
              letterSpacing: '0.1em',
              marginTop: isMobile ? 8 : 16,
              color: '#0A0A0A',
              padding: isMobile ? '0 16px' : 0,
            }}>
              {clientType === 'enterprise' ? 'YEARS OF 3-TIER EXPERTISE' : 'LIQUOR RETAILERS AND BRANDS HAVE GROWN WITH US'}
            </div>
          </div>

          {/* Secondary stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 2,
            background: clientType === 'enterprise'
              ? 'rgba(139, 36, 199, 0.1)'
              : 'rgba(237, 127, 53, 0.1)',
            borderRadius: isMobile ? 12 : 24,
            overflow: 'hidden',
            transition: 'background 0.3s ease',
          }}>
            {[
              { number: '+23%', label: 'Avg Traffic Increase', sub: 'across all clients' },
              { number: '3M', label: 'Online Visits', sub: 'driven to client sites' },
              { number: '1M', label: 'In-Store Visits', sub: 'tracked & attributed' },
              { number: '20M', label: 'Impressions', sub: 'served monthly' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: isMobile ? 16 : 48,
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  fontSize: isMobile ? 32 : 'clamp(48px, 6vw, 72px)',
                  fontWeight: 200,
                  letterSpacing: '-0.03em',
                  color: i === 0 ? (clientType === 'enterprise' ? '#8B24C7' : '#ED7F35') : '#0A0A0A',
                  lineHeight: 1,
                  transition: 'color 0.3s ease',
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: isMobile ? 10 : 12,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  marginTop: isMobile ? 8 : 16,
                  color: '#0A0A0A',
                }}>
                  {stat.label.toUpperCase()}
                </div>
                <div style={{
                  fontSize: isMobile ? 10 : 12,
                  color: '#999',
                  marginTop: 4,
                }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Only show for Retail */}
      {clientType === 'retail' && (
      <section
        id="services-section"
        data-element="services"
        style={{
        padding: isMobile ? '60px 24px 40px' : '120px 64px 60px',
        background: '#0A0A0A',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="reveal" style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            gap: isMobile ? 24 : 0,
            marginBottom: isMobile ? 48 : 80,
          }}>
            <div>
              <div style={{
                fontSize: 11,
                letterSpacing: '0.2em',
                color: '#ED7F35',
                marginBottom: 16,
              }}>
                SERVICES FOR BEVERAGE RETAIL
              </div>
              <h2 style={{
                fontSize: isMobile ? 32 : 48,
                fontWeight: 300,
                color: '#FDFDFC',
                letterSpacing: '-0.02em',
              }}>
                Done-for-you marketing
              </h2>
            </div>
            <p style={{
              fontSize: isMobile ? 14 : 15,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: isMobile ? '100%' : 400,
            }}>
              Comprehensive digital marketing services designed specifically for liquor stores, wine shops, and beverage retailers.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 2,
          }}>
            {services.map((service, i) => {
              // Calculate row-based animation delay (items in same row animate together)
              const columns = isMobile ? 2 : 4;
              const rowIndex = Math.floor(i / columns);
              const animationDelay = `${rowIndex * 0.15}s`;

              return (
              <div key={i} className="reveal" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: isMobile ? 20 : 40,
                borderLeft: isMobile
                  ? (i % 2 === 0 ? `2px solid ${i < 4 ? '#ED7F35' : '#F93830'}` : 'none')
                  : (i % 4 === 0 ? `2px solid ${i < 4 ? '#ED7F35' : '#F93830'}` : 'none'),
                transitionDelay: animationDelay,
              }}>
                <div style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  color: '#ED7F35',
                  marginBottom: 16,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: '#FDFDFC',
                  marginBottom: 12,
                }}>
                  {service.name}
                </h3>
                <p style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  {service.desc}
                </p>
              </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* Technology Section - LiquorChat */}
      <section
        data-element="liquorchat"
        style={{
        padding: isMobile ? '60px 24px 80px' : '80px 64px 120px',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 40 : 80,
          alignItems: 'center',
        }}>
          <div className="reveal-left">
            <div style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              color: '#4A90D9',
              marginBottom: 16,
            }}>
              WE BUILT THIS
            </div>
            {/* LiquorChat Logo + Full POS Integration Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 24,
              flexWrap: 'wrap',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
              }}>
                <img
                  src="/liquorchat-logo-white.png"
                  alt="LiquorChat"
                  style={{
                    height: 44,
                    width: 'auto',
                  }}
                />
              </div>
              {/* Full POS Integration Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(74, 144, 217, 0.15)',
                border: '1px solid rgba(74, 144, 217, 0.3)',
                borderRadius: 100,
                padding: '8px 16px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  color: '#4A90D9',
                }}>
                  FULL POS INTEGRATION
                </span>
              </div>
            </div>
            <h2 style={{
              fontSize: isMobile ? 28 : 40,
              fontWeight: 300,
              color: '#FDFDFC',
              letterSpacing: '-0.02em',
              marginBottom: isMobile ? 16 : 24,
              lineHeight: 1.2,
            }}>
              The Industry&apos;s Most Advanced AI Platform
            </h2>
            <p style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 32,
            }}>
              <strong style={{ color: '#4A90D9' }}>LiquorChat</strong> is the most dynamic AI solution in beverage retail—and it&apos;s <strong style={{ color: '#4A90D9' }}>available to all of our partners</strong>. We built it from a decade of industry experience, and it&apos;s now helping customers and employees find products faster and feel more confident on the floor. With <strong style={{ color: '#4A90D9' }}>3 patents pending</strong> and <strong style={{ color: '#4A90D9' }}>full POS integration</strong>, it works like an AI employee that never sleeps—driving sales 24/7.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
              gap: isMobile ? 12 : 24,
              marginBottom: isMobile ? 24 : 32,
            }}>
              {[
                { num: '3', label: 'Patents Pending', desc: 'Proprietary technology' },
                { num: '24/7', label: 'AI Employee', desc: 'Always working for you' },
                { num: 'Full', label: 'POS Integration', desc: 'Real-time inventory' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'rgba(74, 144, 217, 0.1)',
                  borderRadius: isMobile ? 8 : 12,
                  padding: isMobile ? 12 : 20,
                }}>
                  <div style={{
                    fontSize: 32,
                    fontWeight: 200,
                    color: '#4A90D9',
                    marginBottom: 4,
                  }}>
                    {item.num}
                  </div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    color: '#FDFDFC',
                  }}>
                    {item.label.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: 4,
                  }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal-right" style={{
            background: 'rgba(74, 144, 217, 0.06)',
            border: '1px solid rgba(74, 144, 217, 0.15)',
            borderRadius: isMobile ? 16 : 20,
            padding: isMobile ? 20 : 48,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: isMobile ? 12 : 24,
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#4A90D9',
              }} />
              <span style={{
                fontSize: isMobile ? 11 : 13,
                color: 'rgba(255,255,255,0.6)',
              }}>
                LiquorChat Kiosk Interface
              </span>
            </div>
            <div style={{
              background: '#FAFAFA',
              borderRadius: isMobile ? 10 : 12,
              padding: isMobile ? 16 : 24,
            }}>
              {/* Chat bubble from customer */}
              <div style={{
                background: '#F4F4F5',
                borderRadius: isMobile ? '12px 12px 12px 4px' : '16px 16px 16px 4px',
                padding: isMobile ? '10px 12px' : '12px 16px',
                marginBottom: isMobile ? 10 : 16,
                maxWidth: '80%',
              }}>
                <div style={{ fontSize: isMobile ? 12 : 14, color: '#18181B' }}>
                  What pairs well with grilled salmon?
                </div>
              </div>
              {/* AI response */}
              <div style={{
                background: 'linear-gradient(135deg, #4A90D9 0%, #5D6AF6 100%)',
                borderRadius: isMobile ? '12px 12px 4px 12px' : '16px 16px 4px 16px',
                padding: isMobile ? '10px 12px' : '12px 16px',
                marginLeft: 'auto',
                maxWidth: isMobile ? '90%' : '85%',
              }}>
                <div style={{ fontSize: isMobile ? 12 : 14, color: '#FFFFFF', lineHeight: 1.5 }}>
                  {isMobile
                    ? <>I recommend <strong>2022 Willamette Valley Pinot Noir</strong> - $24.99, Aisle 3.</>
                    : <>For grilled salmon, I recommend our <strong>2022 Willamette Valley Pinot Noir</strong> - $24.99, currently in stock in Aisle 3. Light body with bright cherry notes that complement the fish beautifully.</>
                  }
                </div>
              </div>
              <div style={{
                fontSize: isMobile ? 9 : 11,
                color: '#A1A1AA',
                marginTop: isMobile ? 8 : 12,
                textAlign: 'right',
              }}>
                Real-time inventory • AI recommendations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator + Pricing Section - Combined */}
      <section
        data-element="pricing"
        style={{
        padding: isMobile ? '48px 16px' : '100px 64px',
        background: 'linear-gradient(180deg, #FAFAF8 0%, #FDFDFC 100%)',
        position: 'relative',
        zIndex: 1,
        boxSizing: 'border-box',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          {/* ROI Calculator - Only for Retail */}
          {clientType === 'retail' && (
          <div style={{ marginBottom: isMobile ? 48 : 80, width: '100%', boxSizing: 'border-box' }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: isMobile ? 20 : 40 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#ED7F35', marginBottom: 12 }}>
                BUILD YOUR SERVICE PACKAGE
              </div>
              <h2 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 300, letterSpacing: '-0.02em', margin: 0 }}>
                ROI Calculator
              </h2>
            </div>

            {/* Main Calculator Container - Mobile First */}
            <div className="reveal-scale animate-delay-200" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? 20 : 40,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px)',
              borderRadius: isMobile ? 12 : 24,
              padding: isMobile ? 12 : 40,
              border: '1px solid rgba(10, 10, 10, 0.06)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              {/* Service Selection - Stacks on mobile */}
              <div style={{
                display: isMobile ? 'flex' : 'grid',
                flexDirection: 'column',
                gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
                gap: isMobile ? 20 : 40,
                width: '100%',
                boxSizing: 'border-box',
              }}>
                {/* Left: Service Selection */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? 16 : 28,
                  width: '100%',
                  boxSizing: 'border-box',
                }}>
                  {/* Always Included Section */}
                  <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.15em',
                      color: '#22C55E',
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                      ALWAYS INCLUDED
                    </div>
                    {/* Service Cards - Single column on mobile */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      width: '100%',
                      boxSizing: 'border-box',
                    }}>
                      {lockedServices.map((service, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: isMobile ? '10px 12px' : '14px 16px',
                          background: 'rgba(34, 197, 94, 0.06)',
                          border: '1px solid rgba(34, 197, 94, 0.2)',
                          borderRadius: 8,
                          width: '100%',
                          boxSizing: 'border-box',
                        }}>
                          <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            background: '#22C55E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: 2,
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: '#0A0A0A' }}>{service.name}</div>
                            <div style={{ fontSize: isMobile ? 11 : 12, color: '#666', marginTop: 2 }}>{service.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Choose 3 Services Section */}
                  <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.15em',
                      color: '#ED7F35',
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ED7F35" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="3" /></svg>
                      <span>CHOOSE 3 SERVICES</span>
                      <span style={{
                        marginLeft: 'auto',
                        background: selectedServices.length === 3 ? '#22C55E' : '#ED7F35',
                        color: '#FFF',
                        padding: '3px 8px',
                        borderRadius: 100,
                        fontSize: 10,
                        fontWeight: 700,
                      }}>
                        {selectedServices.length}/3
                      </span>
                    </div>
                    {/* Selectable Service Cards */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      width: '100%',
                      boxSizing: 'border-box',
                    }}>
                      {selectableServices.map((service, idx) => (
                        <div
                          key={idx}
                          onClick={() => toggleService(idx)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            padding: isMobile ? '10px 12px' : '14px 16px',
                            background: selectedServices.includes(idx) ? 'rgba(237, 127, 53, 0.08)' : '#FFF',
                            border: selectedServices.includes(idx) ? '2px solid #ED7F35' : '1px solid rgba(10, 10, 10, 0.1)',
                            borderRadius: 8,
                            cursor: selectedServices.length >= 3 && !selectedServices.includes(idx) ? 'not-allowed' : 'pointer',
                            opacity: selectedServices.length >= 3 && !selectedServices.includes(idx) ? 0.5 : 1,
                            transition: 'all 0.2s ease',
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        >
                          <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            border: selectedServices.includes(idx) ? 'none' : '2px solid rgba(10, 10, 10, 0.15)',
                            background: selectedServices.includes(idx) ? '#ED7F35' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: 2,
                          }}>
                            {selectedServices.includes(idx) && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: '#0A0A0A' }}>{service.name}</div>
                            <div style={{ fontSize: isMobile ? 11 : 12, color: '#666', marginTop: 2 }}>{service.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ad-Hoc Design Toggle */}
                  <div style={{
                    padding: isMobile ? 12 : 18,
                    background: adHocDesign ? 'rgba(139, 36, 199, 0.06)' : 'rgba(10, 10, 10, 0.02)',
                    border: adHocDesign ? '2px solid #8B24C7' : '1px solid rgba(10, 10, 10, 0.1)',
                    borderRadius: 8,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: adHocDesign ? '#8B24C7' : '#0A0A0A' }}>Ad-Hoc Design Requests</div>
                        <div style={{ fontSize: isMobile ? 11 : 12, color: '#666', marginTop: 2 }}>
                          Custom projects <span style={{ fontWeight: 600, color: '#8B24C7' }}>+$1,000/mo</span>
                        </div>
                      </div>
                      <div
                        onClick={() => setAdHocDesign(!adHocDesign)}
                        style={{
                          width: 48,
                          height: 26,
                          borderRadius: 13,
                          background: adHocDesign ? '#8B24C7' : 'rgba(10, 10, 10, 0.15)',
                          padding: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: '#FFF',
                          transform: adHocDesign ? 'translateX(22px)' : 'translateX(0)',
                          transition: 'transform 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: ROI Panel - Full width on mobile */}
                <div style={{
                  background: 'linear-gradient(180deg, #0A0A0A 0%, #141414 100%)',
                  borderRadius: isMobile ? 12 : 20,
                  padding: isMobile ? 16 : 28,
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  boxSizing: 'border-box',
                }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                    flexWrap: 'wrap',
                    gap: 8,
                  }}>
                    <div style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                      PROJECTED RETURNS
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(34, 197, 94, 0.15)',
                      padding: '3px 8px',
                      borderRadius: 100,
                    }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#22C55E',
                        animation: 'pulse 2s infinite',
                      }} />
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#22C55E', letterSpacing: '0.05em' }}>LIVE</span>
                    </div>
                  </div>

                  {/* Timeframe Selector - Scrollable on mobile */}
                  <div style={{
                    marginBottom: 16,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                      gap: 4,
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: 8,
                      padding: 4,
                      width: '100%',
                      boxSizing: 'border-box',
                    }}>
                      {[
                        { idx: 0, label: isMobile ? '1 Mo' : '1 Month' },
                        { idx: 1, label: isMobile ? '3 Mo' : '3 Months' },
                        { idx: 2, label: isMobile ? '6 Mo' : '6 Months' },
                        { idx: 3, label: isMobile ? '12 Mo' : '12 Months' },
                      ].map(({ idx, label }) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedTimeframe(idx)}
                          style={{
                            padding: isMobile ? '8px 4px' : '8px 12px',
                            borderRadius: 6,
                            border: 'none',
                            background: selectedTimeframe === idx ? '#ED7F35' : 'transparent',
                            color: '#FFFFFF',
                            fontSize: isMobile ? 11 : 12,
                            fontWeight: selectedTimeframe === idx ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            width: '100%',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Results Summary */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    marginBottom: 12,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}>
                    {/* Immediate & Retention - Stack on mobile */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: 10,
                      width: '100%',
                      boxSizing: 'border-box',
                    }}>
                      {/* Immediate Revenue */}
                      <div style={{
                        background: 'rgba(237, 127, 53, 0.08)',
                        borderRadius: 10,
                        padding: isMobile ? 12 : 16,
                        border: '1px solid rgba(237, 127, 53, 0.15)',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}>
                        <div style={{ fontSize: 9, letterSpacing: '0.1em', color: '#ED7F35', marginBottom: 6, fontWeight: 600 }}>IMMEDIATE REVENUE</div>
                        <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 300, color: '#ED7F35', marginBottom: 6 }}>
                          ${calculateROI().sparkline[selectedTimeframe].immediate.toLocaleString()}
                        </div>
                        <div style={{ fontSize: isMobile ? 11 : 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                          Revenue from new customers you can directly track.
                        </div>
                      </div>
                      {/* Increased Retention */}
                      <div style={{
                        background: 'rgba(139, 36, 199, 0.08)',
                        borderRadius: 10,
                        padding: isMobile ? 12 : 16,
                        border: '1px solid rgba(139, 36, 199, 0.15)',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}>
                        <div style={{ fontSize: 9, letterSpacing: '0.1em', color: '#8B24C7', marginBottom: 6, fontWeight: 600 }}>INCREASED RETENTION</div>
                        <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 300, color: '#8B24C7', marginBottom: 6 }}>
                          ${calculateROI().sparkline[selectedTimeframe].repeat.toLocaleString()}
                        </div>
                        <div style={{ fontSize: isMobile ? 11 : 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                          Revenue from repeat customers over time.
                        </div>
                      </div>
                    </div>

                    {/* Total Projected Value */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                      borderRadius: 10,
                      padding: isMobile ? 12 : 18,
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'flex-start',
                        gap: isMobile ? 8 : 16,
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 9, letterSpacing: '0.1em', color: '#22C55E', marginBottom: 4, fontWeight: 600 }}>TOTAL PROJECTED VALUE</div>
                          <div style={{ fontSize: isMobile ? 11 : 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                            Full ROI from marketing spend.
                          </div>
                        </div>
                        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                          <div style={{ fontSize: isMobile ? 28 : 32, fontWeight: 300, color: '#22C55E' }}>
                            ${calculateROI().sparkline[selectedTimeframe].longterm.toLocaleString()}
                          </div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                            in {[1, 3, 6, 12][selectedTimeframe]} {selectedTimeframe === 0 ? 'month' : 'months'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Investment - Bottom */}
                  <div style={{
                    marginTop: 'auto',
                    padding: isMobile ? 12 : 20,
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 10,
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}>
                      <div>
                        <div style={{ fontSize: 9, letterSpacing: '0.1em', color: '#ED7F35', marginBottom: 2, fontWeight: 500 }}>YOUR INVESTMENT</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                          {selectedServices.length + lockedServices.length} services{adHocDesign ? ' + design' : ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: isMobile ? 26 : 32, fontWeight: 300, color: '#FFF' }}>${(3000 + (adHocDesign ? 1000 : 0)).toLocaleString()}</span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Pricing Tiers - Retail */}
          {clientType === 'retail' ? (
          <div>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#ED7F35', marginBottom: 12 }}>
                PARTNERSHIP TIERS
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 8 }}>
                Choose your level of partnership
              </h2>
              <p style={{ fontSize: 14, color: '#666' }}>All tiers require a 6-month commitment</p>
            </div>

            <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 24 : 20 }}>
              {pricingTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="reveal"
                  style={{
                    background: tier.best ? 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: isMobile ? 16 : 20,
                    padding: isMobile ? 20 : 28,
                    border: tier.best ? 'none' : '1px solid rgba(10, 10, 10, 0.08)',
                    color: tier.best ? '#FFF' : '#0A0A0A',
                    position: 'relative',
                    transform: tier.best && !isMobile ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: tier.best ? '0 16px 40px rgba(0, 0, 0, 0.15)' : 'none',
                  }}
                >
                  {tier.best && (
                    <div style={{
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#ED7F35',
                      color: '#FFF',
                      padding: '5px 14px',
                      borderRadius: 100,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                    }}>
                      MOST POPULAR
                    </div>
                  )}
                  <div style={{ fontSize: 10, letterSpacing: '0.1em', color: tier.best ? '#ED7F35' : '#999', marginBottom: 4 }}>
                    {tier.tagline}
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>{tier.name}</h3>
                  <p style={{ fontSize: 12, color: tier.best ? 'rgba(255,255,255,0.6)' : '#666', marginBottom: 16, lineHeight: 1.5 }}>
                    {tier.desc}
                  </p>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: tier.best ? 'rgba(255,255,255,0.4)' : '#999', marginBottom: 4, letterSpacing: '0.05em' }}>STARTS AT</div>
                    <div>
                      <span style={{ fontSize: 36, fontWeight: 300 }}>${tier.price.toLocaleString()}</span>
                      <span style={{ fontSize: 14, color: tier.best ? 'rgba(255,255,255,0.5)' : '#999' }}>/mo</span>
                    </div>
                    <div style={{ fontSize: 11, color: tier.best ? 'rgba(255,255,255,0.4)' : '#888', marginTop: 4 }}>
                      ${tier.onboarding.toLocaleString()} onboarding fee
                    </div>
                  </div>

                  {/* Key Differentiator */}
                  <div style={{
                    padding: '12px 16px',
                    background: tier.best ? 'rgba(237, 127, 53, 0.2)' : 'rgba(237, 127, 53, 0.08)',
                    borderRadius: 10,
                    marginBottom: 16,
                    border: `1px solid ${tier.best ? 'rgba(237, 127, 53, 0.3)' : 'rgba(237, 127, 53, 0.15)'}`,
                  }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.1em', color: '#ED7F35', marginBottom: 4, fontWeight: 500 }}>WHAT SETS THIS APART</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: tier.best ? '#FFF' : '#0A0A0A', marginBottom: 2 }}>{tier.keyDiff}</div>
                    <div style={{ fontSize: 11, color: tier.best ? 'rgba(255,255,255,0.6)' : '#666' }}>{tier.keyDiffDetail}</div>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0' }}>
                    {tier.features.slice(0, 4).map((feature, fIdx) => (
                      <li key={fIdx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '5px 0',
                        fontSize: 12,
                        color: tier.best ? 'rgba(255,255,255,0.85)' : '#444',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ED7F35" strokeWidth="2">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Expandable */}
                  <button
                    onClick={() => setAllTiersExpanded(!allTiersExpanded)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: 11,
                      fontWeight: 500,
                      background: 'transparent',
                      color: tier.best ? 'rgba(255,255,255,0.6)' : '#666',
                      border: 'none',
                      cursor: 'pointer',
                      marginBottom: 12,
                    }}
                  >
                    {allTiersExpanded ? '− Hide details' : '+ View all services'}
                  </button>

                  {allTiersExpanded && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', borderTop: `1px solid ${tier.best ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,10,0.08)'}`, paddingTop: 12 }}>
                      {tier.expandedFeatures.map((feature, fIdx) => (
                        <li key={fIdx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '4px 0',
                          fontSize: 11,
                          color: tier.best ? 'rgba(255,255,255,0.6)' : '#666',
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tier.best ? 'rgba(255,255,255,0.4)' : '#999'} strokeWidth="2">
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div style={{ fontSize: 10, color: tier.best ? 'rgba(255,255,255,0.4)' : '#999', marginBottom: 12 }}>
                    Best for: {tier.bestFor}
                  </div>

                  <button style={{
                    width: '100%',
                    padding: '12px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    background: tier.best ? '#ED7F35' : 'transparent',
                    color: tier.best ? '#FFF' : '#0A0A0A',
                    border: tier.best ? 'none' : '2px solid #0A0A0A',
                    borderRadius: 10,
                    cursor: 'pointer',
                  }}>
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
          ) : (
          /* Enterprise Pricing */
          <div>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#8B24C7', marginBottom: 12 }}>
                ENTERPRISE PARTNERSHIP
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 8 }}>
                Your Strategic Growth Partner
              </h2>
              <p style={{ fontSize: 14, color: '#666', maxWidth: 600, margin: '0 auto' }}>
                Full access to our founder and executive team for comprehensive growth strategy
              </p>
            </div>

            {/* Growth Partner Differentiators - Single column on mobile */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
              gap: isMobile ? 12 : 16,
              marginBottom: isMobile ? 32 : 48,
            }}>
              {growthPartnerPoints.map((point, i) => (
                <div key={i} style={{
                  background: 'rgba(139, 36, 199, 0.03)',
                  border: '1px solid rgba(139, 36, 199, 0.1)',
                  borderRadius: isMobile ? 12 : 16,
                  padding: isMobile ? 16 : 24,
                  transition: 'all 0.2s ease',
                  textAlign: isMobile ? 'left' : 'center',
                  display: isMobile ? 'flex' : 'block',
                  alignItems: isMobile ? 'flex-start' : undefined,
                  gap: isMobile ? 12 : undefined,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 36, 199, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(139, 36, 199, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 36, 199, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(139, 36, 199, 0.1)';
                }}
                >
                  <div style={{
                    width: isMobile ? 36 : 40,
                    height: isMobile ? 36 : 40,
                    borderRadius: isMobile ? 10 : 12,
                    background: 'linear-gradient(135deg, #8B24C7, #6B21A8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: isMobile ? 0 : 16,
                    marginLeft: isMobile ? 0 : 'auto',
                    marginRight: isMobile ? 0 : 'auto',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, color: '#FFF', fontFamily: 'monospace' }}>
                      {point.icon}
                    </span>
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: 600,
                      color: '#0A0A0A',
                      marginBottom: 4,
                    }}>
                      {point.title}
                    </h4>
                    <p style={{
                      fontSize: isMobile ? 12 : 13,
                      lineHeight: 1.5,
                      color: '#666',
                    }}>
                      {point.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Enterprise Pricing Card - Optimized Wide Layout */}
            <div style={{
              background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
              borderRadius: isMobile ? 16 : 24,
              padding: isMobile ? 24 : 48,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Glow effect */}
              <div style={{
                position: 'absolute',
                top: '-30%',
                right: '-10%',
                width: '40%',
                height: '80%',
                background: 'radial-gradient(ellipse, rgba(139, 36, 199, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 48 }}>
                {/* Left: Pricing Info */}
                <div>
                  <div style={{
                    background: 'linear-gradient(135deg, #8B24C7, #6B21A8)',
                    padding: '6px 14px',
                    borderRadius: 100,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: '#FFF',
                    display: 'inline-block',
                    marginBottom: 20,
                  }}>
                    ENTERPRISE PARTNERSHIP
                  </div>

                  <h3 style={{ fontSize: 28, fontWeight: 500, color: '#FFF', marginBottom: 12 }}>
                    Strategic Growth Partnership
                  </h3>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 32, lineHeight: 1.7 }}>
                    Full-service partnership with direct access to our founder and executive team.
                  </p>

                  <div style={{ marginBottom: 32 }}>
                    <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#8B24C7', marginBottom: 8 }}>INVESTMENT</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 56, fontWeight: 200, color: '#FFF', letterSpacing: '-0.02em' }}>$10,000</span>
                      <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>/month</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                      12-month partnership • Custom onboarding
                    </div>
                  </div>

                  {/* Founder Card */}
                  <div style={{
                    padding: 20,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8B24C7, #ED7F35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#FFF',
                    }}>
                      AM
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#FFF' }}>Alden Morris, Founder</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>10+ years beverage marketing</div>
                    </div>
                  </div>

                  <button style={{
                    width: '100%',
                    padding: '16px 32px',
                    fontSize: 15,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #8B24C7, #6B21A8)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(139, 36, 199, 0.3)',
                  }}>
                    Schedule Strategy Call
                  </button>
                </div>

                {/* Right: What's Included */}
                <div style={{
                  background: 'rgba(139, 36, 199, 0.08)',
                  border: '1px solid rgba(139, 36, 199, 0.2)',
                  borderRadius: 16,
                  padding: 32,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#8B24C7', marginBottom: 24 }}>
                    WHAT&apos;S INCLUDED
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      'Direct founder access',
                      'Executive team collaboration',
                      'Custom strategy development',
                      'Brand positioning & messaging',
                      'Multi-location campaigns',
                      'Enterprise analytics dashboards',
                      'Trade marketing support',
                      'Priority implementation',
                      'Quarterly business reviews',
                      'Market intelligence reports',
                    ].map((feature, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: 14,
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B24C7" strokeWidth="2.5">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>

      {/* Growth Partner Comparison - Typical Agency vs IC */}
      <section style={{
        padding: isMobile ? '60px 24px' : '120px 64px',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1410 100%)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}>
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '50%',
          height: '140%',
          background: 'radial-gradient(ellipse, rgba(237, 127, 53, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          right: '-15%',
          width: '60%',
          height: '100%',
          background: 'radial-gradient(ellipse, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              color: '#ED7F35',
              marginBottom: 16,
            }}>
              THE DIFFERENCE
            </div>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: '#FDFDFC',
              marginBottom: 16,
            }}>
              Typical Agency vs <span style={{ color: '#ED7F35' }}>Intentionally Creative</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 600, margin: '0 auto' }}>
              We&apos;re not another generalist agency. We built our entire practice around beverage retail success.
            </p>
          </div>

          {/* Key Differentiators */}
          <div className="reveal" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: isMobile ? 12 : 48,
            marginBottom: isMobile ? 32 : 64,
            padding: isMobile ? '24px 8px' : '40px 0',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            {[
              { stat: '10+', label: 'Years in beverage', sublabel: 'Producer, distributor & retail' },
              { stat: '107', label: 'Retail partners', sublabel: 'And growing every month' },
              { stat: '312%', label: 'Average ROI', sublabel: 'Across our client base' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: isMobile ? 28 : 48,
                  fontWeight: 200,
                  color: '#ED7F35',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}>
                  {item.stat}
                </div>
                <div style={{
                  fontSize: isMobile ? 10 : 13,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginTop: isMobile ? 6 : 8,
                  letterSpacing: '0.05em',
                }}>
                  {item.label.toUpperCase()}
                </div>
                <div style={{
                  fontSize: isMobile ? 10 : 12,
                  color: 'rgba(255,255,255,0.4)',
                  marginTop: 4,
                  lineHeight: 1.3,
                }}>
                  {item.sublabel}
                </div>
              </div>
            ))}
          </div>

          <div className="stagger-children" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 24 : 32,
          }}>
            {/* Typical Agency Column */}
            <div className="reveal-left" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: isMobile ? 16 : 24,
              padding: isMobile ? 24 : 40,
              paddingTop: isMobile ? 16 : 40,
              position: 'relative',
            }}>
              {/* Badge - stacked above header on mobile, absolute on desktop */}
              {isMobile ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 12,
                }}>
                  <div style={{
                    background: 'rgba(249, 56, 48, 0.1)',
                    border: '1px solid rgba(249, 56, 48, 0.2)',
                    borderRadius: 6,
                    padding: '5px 10px',
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: '#F93830',
                  }}>
                    WRONG FIT
                  </div>
                </div>
              ) : (
                <div style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'rgba(249, 56, 48, 0.1)',
                  border: '1px solid rgba(249, 56, 48, 0.2)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#F93830',
                }}>
                  WRONG FIT
                </div>
              )}
              <div style={{
                fontSize: 12,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: isMobile ? 16 : 24,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#666' }} />
                TYPICAL AGENCY
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { text: 'Generic strategies across all industries', detail: 'No understanding of compliance or 3-tier' },
                  { text: 'Learning your industry on your dime', detail: 'Months of ramp-up time you pay for' },
                  { text: 'One-size-fits-all campaigns', detail: 'Copy-paste templates that don\'t convert' },
                  { text: 'Vanity metrics that don\'t drive sales', detail: 'Likes and impressions mean nothing' },
                  { text: 'Junior staff executing your account', detail: 'Your strategy is an afterthought' },
                  { text: 'Quarterly reports with excuses', detail: 'No accountability, no results' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}>
                    <span style={{
                      color: '#F93830',
                      fontSize: 18,
                      fontWeight: 600,
                      background: 'rgba(249, 56, 48, 0.1)',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>×</span>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500 }}>{item.text}</div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intentionally Creative Column */}
            <div className="reveal-right" style={{
              background: 'linear-gradient(135deg, rgba(237, 127, 53, 0.15) 0%, rgba(237, 127, 53, 0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(237, 127, 53, 0.4)',
              borderRadius: isMobile ? 16 : 24,
              padding: isMobile ? 24 : 40,
              paddingTop: isMobile ? 16 : 40,
              position: 'relative',
              boxShadow: '0 20px 60px rgba(237, 127, 53, 0.15)',
            }}>
              {/* Badge - stacked above header on mobile, absolute on desktop */}
              {isMobile ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 12,
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                    borderRadius: 6,
                    padding: '5px 10px',
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: '#FFFFFF',
                  }}>
                    BUILT FOR YOU
                  </div>
                </div>
              ) : (
                <div style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#FFFFFF',
                }}>
                  BUILT FOR YOU
                </div>
              )}
              <div style={{
                fontSize: 12,
                letterSpacing: '0.15em',
                color: '#ED7F35',
                marginBottom: isMobile ? 16 : 24,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ED7F35' }} />
                INTENTIONALLY CREATIVE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { text: '10+ years of beverage industry specialization', detail: 'We\'ve lived every tier of this business' },
                  { text: 'Proven playbooks customized for your store', detail: 'We know what works, tailored to you' },
                  { text: 'Campaigns built for your exact customer base', detail: 'Hyper-local targeting that converts' },
                  { text: 'Foot traffic and revenue as our KPIs', detail: 'If you don\'t make money, we failed' },
                  { text: 'Direct access to founder Alden Morris', detail: 'No handoffs, no junior account managers' },
                  { text: 'Real-time dashboards with transparent results', detail: 'See every dollar at work 24/7' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}>
                    <span style={{
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 600,
                      background: '#22C55E',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>✓</span>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: 500 }}>{item.text}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom quote with visual treatment */}
          <div className="reveal" style={{
            textAlign: 'center',
            marginTop: isMobile ? 32 : 64,
            background: 'linear-gradient(135deg, rgba(237, 127, 53, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)',
            borderRadius: isMobile ? 16 : 24,
            padding: isMobile ? '24px 20px' : '48px 64px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <svg width={isMobile ? 32 : 48} height={isMobile ? 32 : 48} viewBox="0 0 24 24" fill="none" style={{ marginBottom: isMobile ? 12 : 24, opacity: 0.3 }}>
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" fill="#ED7F35"/>
            </svg>
            <p style={{
              fontSize: isMobile ? 16 : 22,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: isMobile ? 12 : 24,
              fontStyle: 'italic',
              lineHeight: 1.5,
              maxWidth: 700,
              margin: isMobile ? '0 auto 12px' : '0 auto 24px',
            }}>
              Working with a specialist who already knows the beverage industry saved us 6 months of trial and error. The results were immediate because they didn&apos;t have to learn our business—they already lived it.
            </p>
            <div style={{ fontSize: isMobile ? 12 : 14, color: '#ED7F35', fontWeight: 600 }}>— Regional Chain Owner, 12 Locations</div>
          </div>
        </div>
      </section>

      {/* About Alden Section - Direct Access Emphasis */}
      <section
        id="about-section"
        data-element="about"
        style={{
        padding: isMobile ? '60px 24px' : '120px 64px',
        position: 'relative',
        zIndex: 1,
        background: 'linear-gradient(180deg, #FDFDFC 0%, rgba(237, 127, 53, 0.03) 100%)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Hero statement about working directly with Alden */}
          <div className="reveal" style={{
            textAlign: 'center',
            marginBottom: isMobile ? 48 : 80,
          }}>
            <div style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              color: '#ED7F35',
              marginBottom: 16,
            }}>
              ABOUT THE FOUNDER
            </div>
            <h2 style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              marginBottom: 24,
              lineHeight: 1.1,
            }}>
              You work directly with <span style={{ color: '#ED7F35' }}>Alden Morris</span>
            </h2>
            <p style={{
              fontSize: 20,
              lineHeight: 1.7,
              color: '#666',
              maxWidth: 800,
              margin: '0 auto',
            }}>
              Not an account manager. Not a junior strategist. When you partner with Intentionally Creative, you work directly with the founder on your strategy, your campaigns, and your growth.
            </p>
          </div>

          {/* Main content grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr',
            gap: isMobile ? 40 : 80,
            alignItems: 'start',
          }}>
            {/* Left: Photo and quick stats */}
            <div className="reveal-left">
              {/* Photo placeholder with gradient frame */}
              <div style={{
                position: 'relative',
                marginBottom: 32,
              }}>
                <div style={{
                  aspectRatio: '4/5',
                  background: 'linear-gradient(135deg, #ED7F35 0%, #D625FA 50%, #F93830 100%)',
                  borderRadius: 24,
                  padding: 4,
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 20,
                    overflow: 'hidden',
                  }}>
                    <img
                      src="/alden-morris.avif"
                      alt="Alden Morris - Founder"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                      }}
                    />
                  </div>
                </div>
                {/* Floating badge */}
                <div style={{
                  position: 'absolute',
                  bottom: -16,
                  right: -16,
                  background: '#0A0A0A',
                  color: '#FFFFFF',
                  padding: '16px 24px',
                  borderRadius: 16,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                }}>
                  <div style={{ fontSize: 32, fontWeight: 200, color: '#ED7F35' }}>10+</div>
                  <div style={{ fontSize: 11, letterSpacing: '0.1em', marginTop: 4 }}>YEARS EXPERIENCE</div>
                </div>
              </div>

              {/* Name and title */}
              <h3 style={{
                fontSize: 32,
                fontWeight: 400,
                marginBottom: 8,
              }}>
                Alden Morris
              </h3>
              <div style={{
                fontSize: 14,
                color: '#ED7F35',
                letterSpacing: '0.05em',
                marginBottom: 24,
              }}>
                Founder & Principal Strategist
              </div>
              <p style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: '#666',
              }}>
                Alden brings over ten years of experience across the U.S. beverage industry&apos;s supplier, distributor, and retail tiers. He has led marketing efforts for national brands and worked directly with independent retailers and producers, building a practical understanding of how to grow beverage businesses across different markets.
              </p>
            </div>

            {/* Right: What makes this different */}
            <div className="reveal-right">
              {/* Direct Access Promise */}
              <div style={{
                background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
                borderRadius: 24,
                padding: 48,
                marginBottom: 32,
              }}>
                <div style={{
                  fontSize: 11,
                  letterSpacing: '0.2em',
                  color: '#ED7F35',
                  marginBottom: 24,
                }}>
                  THE DIRECT ACCESS PROMISE
                </div>
                <h4 style={{
                  fontSize: 28,
                  fontWeight: 400,
                  color: '#FFFFFF',
                  marginBottom: 24,
                  lineHeight: 1.3,
                }}>
                  You don&apos;t get pawned off to a junior team
                </h4>
                <p style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: 32,
                }}>
                  Every one of our case studies points to the same thing: clients succeed because Alden is directly involved in their strategy, their projects, and their growth. This isn&apos;t a bait-and-switch agency where you sign with the founder and then never see them again.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    'Alden personally reviews every campaign strategy',
                    'Direct Slack/phone access to discuss your business',
                    'Monthly strategy sessions with the founder',
                    'He knows your store, your market, your customers',
                  ].map((point, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      color: '#FFFFFF',
                      fontSize: 14,
                    }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#ED7F35',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      </div>
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3-Tier Experience Cards */}
              <div style={{
                fontSize: 11,
                letterSpacing: '0.2em',
                color: '#ED7F35',
                marginBottom: 16,
              }}>
                3-TIER EXPERTISE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { tier: 'Tier 1: Producer', focus: 'Brand Development & Strategy', desc: 'Managing brand portfolios, product launches, and marketing strategy for craft beverage producers.', color: '#ED7F35' },
                  { tier: 'Tier 2: Distributor', focus: 'Sales & Distribution', desc: 'Territory management, retailer relationships, shelf placement strategy, and distribution logistics.', color: '#F93830' },
                  { tier: 'Tier 3: Retail', focus: 'Retail Operations', desc: 'Store consulting, promotional strategy, margin optimization, and customer experience.', color: '#ED7F35' },
                ].map((exp, i) => (
                  <div key={i} style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(10, 10, 10, 0.06)',
                    borderRadius: 16,
                    padding: 24,
                    borderLeft: `4px solid ${exp.color}`,
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                      <div>
                        <div style={{
                          fontSize: 10,
                          letterSpacing: '0.15em',
                          color: exp.color,
                          marginBottom: 8,
                        }}>
                          {exp.tier.toUpperCase()}
                        </div>
                        <div style={{
                          fontSize: 16,
                          fontWeight: 500,
                          marginBottom: 8,
                        }}>
                          {exp.focus}
                        </div>
                        <div style={{
                          fontSize: 13,
                          lineHeight: 1.5,
                          color: '#666',
                        }}>
                          {exp.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom testimonial specifically about working with Alden */}
          <div className="reveal" style={{
            marginTop: isMobile ? 32 : 80,
            background: 'rgba(237, 127, 53, 0.05)',
            border: '1px solid rgba(237, 127, 53, 0.15)',
            borderRadius: isMobile ? 12 : 24,
            padding: isMobile ? '20px 16px' : '48px 64px',
            textAlign: 'center',
          }}>
            <svg width={isMobile ? 24 : 40} height={isMobile ? 24 : 40} viewBox="0 0 24 24" fill="none" style={{ marginBottom: isMobile ? 8 : 24, opacity: 0.5 }}>
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" fill="#ED7F35"/>
            </svg>
            <p style={{
              fontSize: isMobile ? 14 : 20,
              color: '#0A0A0A',
              fontStyle: 'italic',
              lineHeight: 1.5,
              maxWidth: 800,
              margin: isMobile ? '0 auto 8px' : '0 auto 24px',
            }}>
              What sets IC apart is that I&apos;m actually working with Alden. He knows my store, knows my customers, and when I have a question, I&apos;m talking to the person making the decisions—not some account manager reading from a script.
            </p>
            <div style={{ fontSize: isMobile ? 11 : 14, color: '#ED7F35', fontWeight: 600 }}>— Independent Wine Shop Owner, NYC</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="contact-section"
        data-element="contact"
        style={{
        padding: isMobile ? '40px 24px' : '120px 64px',
        position: 'relative',
        zIndex: 1,
        background: clientType === 'enterprise' ? 'linear-gradient(180deg, #FDFDFC 0%, rgba(139, 36, 199, 0.05) 100%)' : '#FDFDFC',
      }}>
        <div className="reveal" style={{
          maxWidth: 900,
          margin: '0 auto',
          textAlign: 'center',
        }}>
          {clientType === 'enterprise' ? (
            <>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#8B24C7', marginBottom: 16 }}>
                LET&apos;S BUILD SOMETHING GREAT
              </div>
              <h2 style={{
                fontSize: isMobile ? 36 : 56,
                fontWeight: 200,
                letterSpacing: '-0.02em',
                marginBottom: 24,
              }}>
                Ready to transform your <span style={{
                  color: '#8B24C7',
                  display: 'inline',
                  opacity: ctaFading ? 0 : 1,
                  transition: 'opacity 0.4s ease-in-out',
                }}>{ctaWords[ctaWordIndex]}</span>?
              </h2>
              <p style={{
                fontSize: 18,
                lineHeight: 1.7,
                color: '#666',
                marginBottom: 48,
              }}>
                Schedule a strategy session with our founder to explore how we can accelerate your enterprise beverage brand. No pitch deck, just a real conversation about your growth goals.
              </p>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, justifyContent: 'center' }}>
                <button style={{
                  background: 'linear-gradient(135deg, #8B24C7, #6B21A8)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: isMobile ? '16px 32px' : '20px 48px',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(139, 36, 199, 0.25)',
                  width: isMobile ? '100%' : 'auto',
                }}>
                  SCHEDULE FOUNDER CALL
                </button>
                <button style={{
                  background: 'transparent',
                  color: '#0A0A0A',
                  border: '1px solid rgba(139, 36, 199, 0.3)',
                  padding: '20px 48px',
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}>
                  View Enterprise Case Studies
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 style={{
                fontSize: isMobile ? 32 : 56,
                fontWeight: 200,
                letterSpacing: '-0.02em',
                marginBottom: isMobile ? 16 : 24,
                lineHeight: 1.1,
              }}>
                Ready for measurable growth?
              </h2>
              <p style={{
                fontSize: isMobile ? 15 : 18,
                lineHeight: 1.7,
                color: '#666',
                marginBottom: isMobile ? 32 : 48,
              }}>
                Get a free marketing audit and discover how we can help your liquor store or beverage business compete and grow.
              </p>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, justifyContent: 'center' }}>
                <button style={{
                  background: '#ED7F35',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: isMobile ? '16px 32px' : '20px 48px',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  borderRadius: 8,
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto',
                }}>
                  GET FREE AUDIT
                </button>
                <button style={{
                  background: 'transparent',
                  color: '#0A0A0A',
                  border: '1px solid rgba(10, 10, 10, 0.2)',
                  padding: isMobile ? '16px 32px' : '20px 48px',
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  borderRadius: 8,
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto',
                }}>
                  Schedule Call
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* YouTube Social Proof Section - As Seen On */}
      {clientType === 'retail' && (
      <section
        data-element="social-proof"
        style={{
        padding: isMobile ? '60px 24px' : '120px 64px',
        background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
            <div style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              color: '#ED7F35',
              marginBottom: 16,
            }}>
              AS SEEN ON YOUTUBE & SOCIAL MEDIA
            </div>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: '#FDFDFC',
              marginBottom: 16,
            }}>
              Your Questions, <span style={{ color: '#ED7F35' }}>Answered</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 600, margin: '0 auto' }}>
              We cover the topics liquor store owners ask about most. Watch our video content and see why retailers trust our expertise.
            </p>
          </div>

          {/* Video Grid - 4 columns x 3 rows = 12 videos */}
          <div className="stagger-children" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? 16 : 20,
          }}>
            {[
              { title: 'How to Increase Foot Traffic', topic: 'Marketing' },
              { title: 'Google Business Profile Tips', topic: 'SEO' },
              { title: 'Social Media for Liquor Stores', topic: 'Social' },
              { title: 'Email Marketing That Works', topic: 'Email' },
              { title: 'Geofencing Explained', topic: 'Ads' },
              { title: 'Why SEO Matters for Retail', topic: 'SEO' },
              { title: 'Customer Retention Strategies', topic: 'Strategy' },
              { title: 'Competing with Big Box Stores', topic: 'Strategy' },
              { title: 'Holiday Marketing Tips', topic: 'Seasonal' },
              { title: 'Building Your Brand Locally', topic: 'Branding' },
              { title: 'Understanding Your Analytics', topic: 'Data' },
              { title: 'When to Hire a Marketing Agency', topic: 'Business' },
            ].map((video, i) => (
              <div key={i} className="reveal" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(237, 127, 53, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
              >
                {/* Video Thumbnail */}
                <div style={{
                  aspectRatio: '16/9',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(237, 127, 53, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 0,
                      height: 0,
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderLeft: '14px solid #FFFFFF',
                      marginLeft: 3,
                    }} />
                  </div>
                  {/* Topic badge */}
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: 'rgba(0,0,0,0.7)',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    color: '#ED7F35',
                  }}>
                    {video.topic.toUpperCase()}
                  </div>
                </div>
                {/* Title */}
                <div style={{ padding: '16px' }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    lineHeight: 1.4,
                  }}>
                    {video.title}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA to YouTube channel */}
          <div className="reveal" style={{
            textAlign: 'center',
            marginTop: 48,
          }}>
            <button style={{
              background: 'transparent',
              color: '#FFFFFF',
              border: '1px solid rgba(237, 127, 53, 0.4)',
              padding: '16px 32px',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.05em',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#ED7F35">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              Subscribe on YouTube
            </button>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      <footer
        data-element="footer"
        style={{
        padding: isMobile ? '40px 24px 100px' : '80px 64px',
        borderTop: '1px solid rgba(10, 10, 10, 0.1)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            {/* Logo */}
            <img
              src="/ic-logo.avif"
              alt="Intentionally Creative"
              style={{
                height: 40,
                width: 'auto',
                marginBottom: 16,
              }}
            />
            <p style={{
              fontSize: 13,
              color: '#666',
              maxWidth: 300,
            }}>
              Premier digital marketing agency for the retail liquor industry. 10+ years of 3-tier expertise.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 80 }}>
            <div>
              <div style={{
                fontSize: 11,
                letterSpacing: '0.15em',
                color: '#666',
                marginBottom: 16,
              }}>
                COMPANY
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['About', 'Case Studies', 'Contact', 'Blog'].map(item => (
                  <span key={item} style={{ fontSize: 13, color: '#0A0A0A', cursor: 'pointer' }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Bottom CTA Bar - Mobile Only */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(10, 10, 10, 0.1)',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.08)',
          zIndex: 100,
        }}>
          <button
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.03em',
              background: clientType === 'enterprise'
                ? 'linear-gradient(135deg, #8B24C7, #6B21A8)'
                : '#ED7F35',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              boxShadow: clientType === 'enterprise'
                ? '0 4px 16px rgba(139, 36, 199, 0.3)'
                : '0 4px 16px rgba(237, 127, 53, 0.3)',
            }}
          >
            GET FREE AUDIT
          </button>
        </div>
      )}
    </div>
  );
}
