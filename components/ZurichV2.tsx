'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DefaultContent } from '@/lib/content/defaults';

interface ZurichV2Props {
  content: DefaultContent;
}

export default function ZurichV2({ content }: ZurichV2Props) {
  const [clientType, setClientType] = useState<'retail' | 'enterprise'>('retail');
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const [yearsCount, setYearsCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [selectedServices, setSelectedServices] = useState<number[]>([0, 1, 2]); // User chooses 3, Google Suite & Website are locked
  const [adHocDesign, setAdHocDesign] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(3); // 0=1mo, 1=3mo, 2=6mo, 3=12mo
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [allTiersExpanded, setAllTiersExpanded] = useState(false);
  const [ctaWordIndex, setCtaWordIndex] = useState(0);
  const [ctaFading, setCtaFading] = useState(false);
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
          // Animate from 0 to yearsExperience
          const targetCount = content.hero.yearsExperience;
          let count = 0;
          const interval = setInterval(() => {
            count += 1;
            setYearsCount(count);
            if (count >= targetCount) clearInterval(interval);
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

  // Services data from CMS
  const selectableServices = content.services.selectableServices;
  const lockedServices = content.services.lockedServices;
  const allServices = [...selectableServices, ...lockedServices];
  const services = content.services.allServices;

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

  // Data from CMS
  const pricingTiers = content.pricing.tiers;
  const caseStudies = content.caseStudies;
  const testimonials = content.testimonials;
  const clientTypes = content.clientTypes;
  const enterpriseServices = content.enterpriseServices;
  const growthPartnerPoints = content.growthPartnerPoints;

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
        top: 24,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        {/* Inner nav container - expands to fit content */}
        <nav style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 24px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12), 0 8px 48px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          pointerEvents: 'auto',
        }}>
          {/* Logo */}
          <img
            src="/ic-logo.avif"
            alt="Intentionally Creative"
            style={{
              height: 36,
              width: 'auto',
              flexShrink: 0,
            }}
          />
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
                padding: '12px 24px',
                fontSize: 13,
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
              data-section="navigation"
              data-field="clientTypes.retail"
            >
              {content.navigation.clientTypes.retail}
            </button>
            <button
              onClick={() => setClientType('enterprise')}
              style={{
                padding: '12px 24px',
                fontSize: 13,
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
              data-section="navigation"
              data-field="clientTypes.enterprise"
            >
              {content.navigation.clientTypes.enterprise}
            </button>
          </div>
          <div style={{
            width: 1,
            height: 32,
            background: 'rgba(10, 10, 10, 0.1)',
            flexShrink: 0,
          }} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {content.navigation.items.map((item, i) => (
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
                data-section="navigation"
                data-field={`items.${i}.label`}
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
                data-section="navigation"
                data-field="stickyCta"
              >
                {content.navigation.stickyCta}
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '140px 64px 80px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
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
              }} data-section="hero" data-field="industryBadge">
                {content.hero.industryBadge}
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
            }} data-section="hero" data-field="yearsLabel">
              {content.hero.yearsLabel}
            </div>

            {/* 3-Tier Indicators */}
            <div className="hero-animate hero-animate-delay-4" style={{
              display: 'flex',
              gap: 40,
              marginTop: 48,
            }}>
              {content.hero.tiers.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  <div style={{
                    width: 56,
                    height: 4,
                    background: item.color,
                    borderRadius: 2,
                  }} />
                  <span style={{
                    fontSize: 12,
                    letterSpacing: '0.12em',
                    color: '#555',
                    fontWeight: 500,
                  }}>
                    {item.tier.toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#0A0A0A',
                  }}>
                    {item.name}
                  </span>
                  <span style={{
                    fontSize: 13,
                    color: '#777',
                    lineHeight: 1.4,
                  }}>
                    {item.desc}
                  </span>
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
              }} data-section="hero" data-field="industryLeading">
                {content.hero.industryLeading}
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
                ? <>
                    <span data-section="hero" data-field="retailHeadline.prefix">{content.hero.retailHeadline.prefix}</span>
                    <span style={{ color: '#ED7F35' }} data-section="hero" data-field="retailHeadline.highlight">{content.hero.retailHeadline.highlight}</span>
                    <span data-section="hero" data-field="retailHeadline.suffix">{content.hero.retailHeadline.suffix}</span>
                  </>
                : <>
                    <span data-section="hero" data-field="enterpriseHeadline.prefix">{content.hero.enterpriseHeadline.prefix}</span>
                    <span style={{ color: '#ED7F35' }} data-section="hero" data-field="enterpriseHeadline.highlight">{content.hero.enterpriseHeadline.highlight}</span>
                    <span data-section="hero" data-field="enterpriseHeadline.suffix">{content.hero.enterpriseHeadline.suffix}</span>
                  </>
              }
            </h1>
            <p className="hero-animate hero-animate-delay-3" style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: '#555',
              maxWidth: 520,
              marginBottom: 40,
            }} data-section="hero" data-field={clientType === 'retail' ? 'retailDescription' : 'enterpriseDescription'}>
              {clientType === 'retail'
                ? content.hero.retailDescription
                : content.hero.enterpriseDescription
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
                ? content.hero.retailClientTypes
                : content.hero.enterpriseClientTypes
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
                }}
                data-section="hero"
                data-field={`${clientType === 'retail' ? 'retailClientTypes' : 'enterpriseClientTypes'}.${i}`}
              >
                  {type}
              </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hero-animate hero-animate-delay-5" style={{ display: 'flex', gap: 16 }}>
              <button style={{
                background: '#ED7F35',
                color: '#FFFFFF',
                border: 'none',
                padding: '18px 36px',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.05em',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(237, 127, 53, 0.25)',
              }} data-section="hero" data-field="ctaPrimary">
                {content.hero.ctaPrimary}
              </button>
              <button style={{
                background: 'rgba(237, 127, 53, 0.12)',
                color: '#0A0A0A',
                border: '1px solid rgba(237, 127, 53, 0.3)',
                padding: '18px 36px',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '0.05em',
                borderRadius: 8,
                cursor: 'pointer',
              }} data-section="hero" data-field="ctaSecondary">
                {content.hero.ctaSecondary}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
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
      </section>

      {/* Case Studies Section - With Videos */}
      <section id="results-section" style={{
        padding: '120px 64px',
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
            fontSize: 48,
            fontWeight: 300,
            letterSpacing: '-0.02em',
            marginBottom: 64,
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
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 32,
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
              marginTop: 64,
              background: 'linear-gradient(135deg, #1A1708 0%, #2A2510 100%)',
              borderRadius: 24,
              padding: 64,
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
                gridTemplateColumns: '1fr 1.5fr',
                gap: 64,
                alignItems: 'center',
                position: 'relative',
              }}>
                {/* Left: Stats */}
                <div>
                  <div style={{
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    color: '#F5B700',
                    marginBottom: 24,
                  }}>
                    FEATURED PARTNERSHIP
                  </div>
                  <div style={{
                    marginBottom: 32,
                  }}>
                    <img
                      src="/cityhive-logo-white.png"
                      alt="CityHive"
                      style={{
                        height: 72,
                        width: 'auto',
                      }}
                    />
                  </div>
                  <p style={{
                    fontSize: 16,
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: 32,
                  }}>
                    In early 2024, we partnered with CityHive—the nation&apos;s #1 e-commerce platform for beverage retail—to advance their in-store involvement efforts, increase app engagement, and execute general marketing initiatives across their network of <strong style={{ color: '#F5B700' }}>7,000+ liquor stores nationwide</strong>.
                  </p>

                  {/* Key metrics */}
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
                </div>

                {/* Right: Description */}
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
                    THE RESULTS
                  </div>
                  <p style={{
                    fontSize: 18,
                    lineHeight: 1.8,
                    color: '#FFFFFF',
                    marginBottom: 24,
                  }}>
                    Our campaigns generated over <strong style={{ color: '#F5B700' }}>50 million impressions</strong> for liquor stores across the country on the leading e-commerce platform for our niche—along with millions of dollars in attributed revenue.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      'Nationwide reach across 7,000+ retail locations',
                      'Coordinated marketing across all participating stores',
                      'In-store engagement and app adoption campaigns',
                      'Full attribution tracking for ROI measurement',
                    ].map((point, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: 14,
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5B700" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        {point}
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: 32,
                    paddingTop: 24,
                    borderTop: '1px solid rgba(245, 183, 0, 0.2)',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.5)',
                    fontStyle: 'italic',
                  }}>
                    &ldquo;Intentionally Creative understood our platform and our retailers from day one. They delivered results that moved the needle for thousands of stores.&rdquo;
                  </div>
                </div>
              </div>
            </div>
            </>
          ) : (
            /* Enterprise Services - Enhanced Layout */
            <div>
              {/* Featured Enterprise Capabilities */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 32,
                marginBottom: 48,
              }}>
                {/* Left: What You Get */}
                <div style={{
                  background: 'linear-gradient(135deg, #1A0A20 0%, #2D1A35 100%)',
                  borderRadius: 24,
                  padding: 48,
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
                    <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#8B24C7', marginBottom: 16 }}>
                      THE ENTERPRISE ADVANTAGE
                    </div>
                    <h3 style={{
                      fontSize: 28,
                      fontWeight: 400,
                      color: '#FFFFFF',
                      marginBottom: 24,
                      lineHeight: 1.3,
                    }}>
                      Same expertise that grew 107 retailers—now scaled for your enterprise.
                    </h3>
                    <p style={{
                      fontSize: 15,
                      lineHeight: 1.7,
                      color: 'rgba(255,255,255,0.7)',
                      marginBottom: 24,
                    }}>
                      We&apos;ve spent 10+ years perfecting beverage retail marketing. Enterprise clients get that same proven approach—plus dedicated resources, custom campaign strategy, and direct founder involvement.
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 20px',
                      background: 'rgba(139, 36, 199, 0.2)',
                      borderRadius: 12,
                      border: '1px solid rgba(139, 36, 199, 0.3)',
                    }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #8B24C7 0%, #6B21A8 100%)',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                          <path d="M2 17l10 5 10-5"></path>
                          <path d="M2 12l10 5 10-5"></path>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>Custom GTM Strategy & Execution</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Campaigns, creative, and full-service delivery</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Why Enterprise */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(139, 36, 199, 0.1)',
                  borderRadius: 24,
                  padding: 48,
                }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#8B24C7', marginBottom: 16 }}>
                    WHY ENTERPRISE CLIENTS CHOOSE US
                  </div>
                  <h3 style={{
                    fontSize: 28,
                    fontWeight: 400,
                    color: '#0A0A0A',
                    marginBottom: 24,
                    lineHeight: 1.3,
                  }}>
                    Centralized management, dedicated support, and custom campaigns—at any scale.
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                      'Dedicated account executive + direct access to Alden Morris',
                      'Custom campaign strategy, creative, and full execution',
                      'Centralized marketing management across all locations',
                      'Custom reporting dashboards for executive teams',
                    ].map((point, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B24C7" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        <span style={{ fontSize: 15, color: '#333', lineHeight: 1.5 }}>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enterprise Services Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
              }}>
                {enterpriseServices.map((service, i) => (
                  <div key={i} style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 36, 199, 0.15)',
                    borderRadius: 20,
                    padding: 32,
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
      <section style={{
        position: 'relative',
        zIndex: 1,
        padding: '80px 0',
        background: clientType === 'enterprise'
          ? 'linear-gradient(180deg, #FDFDFC 0%, rgba(139, 36, 199, 0.03) 100%)'
          : 'linear-gradient(180deg, #FDFDFC 0%, rgba(237, 127, 53, 0.03) 100%)',
        transition: 'background 0.3s ease',
      }}>
        <div style={{
          maxWidth: 1600,
          margin: '0 auto',
          padding: '0 64px',
        }}>
          {/* Main headline stat */}
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{
              fontSize: 'clamp(100px, 20vw, 200px)',
              fontWeight: 100,
              letterSpacing: '-0.05em',
              lineHeight: 0.9,
              color: clientType === 'enterprise' ? '#8B24C7' : '#ED7F35',
            }}>
              {clientType === 'enterprise' ? '10+' : '107'}
            </div>
            <div style={{
              fontSize: 24,
              fontWeight: 300,
              letterSpacing: '0.1em',
              marginTop: 16,
              color: '#0A0A0A',
            }}>
              {clientType === 'enterprise' ? 'YEARS OF 3-TIER EXPERTISE' : 'LIQUOR RETAILERS AND BRANDS HAVE GROWN WITH US'}
            </div>
          </div>

          {/* Secondary stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
            background: clientType === 'enterprise'
              ? 'rgba(139, 36, 199, 0.1)'
              : 'rgba(237, 127, 53, 0.1)',
            borderRadius: 24,
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
                padding: 48,
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  fontSize: 'clamp(48px, 6vw, 72px)',
                  fontWeight: 200,
                  letterSpacing: '-0.03em',
                  color: i === 0 ? (clientType === 'enterprise' ? '#8B24C7' : '#ED7F35') : '#0A0A0A',
                  lineHeight: 1,
                  transition: 'color 0.3s ease',
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  marginTop: 16,
                  color: '#0A0A0A',
                }}>
                  {stat.label.toUpperCase()}
                </div>
                <div style={{
                  fontSize: 12,
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
      <section id="services-section" style={{
        padding: '120px 64px 60px',
        background: '#0A0A0A',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="reveal" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 80,
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
                fontSize: 48,
                fontWeight: 300,
                color: '#FDFDFC',
                letterSpacing: '-0.02em',
              }}>
                Done-for-you marketing
              </h2>
            </div>
            <p style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 400,
            }}>
              Comprehensive digital marketing services designed specifically for liquor stores, wine shops, and beverage retailers.
            </p>
          </div>

          <div className="stagger-children" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
          }}>
            {services.map((service, i) => (
              <div key={i} className="reveal" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: 40,
                borderLeft: i % 4 === 0 ? `2px solid ${i < 4 ? '#ED7F35' : '#F93830'}` : 'none',
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
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Technology Section - LiquorChat */}
      <section style={{
        padding: '80px 64px 120px',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'center',
        }}>
          <div className="reveal-left">
            <div style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              color: '#4A90D9',
              marginBottom: 16,
            }} data-section="liquorChat" data-field="sectionLabel">
              {content.liquorChat.sectionLabel}
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
                }} data-section="liquorChat" data-field="posBadge">
                  {content.liquorChat.posBadge}
                </span>
              </div>
            </div>
            <h2 style={{
              fontSize: 40,
              fontWeight: 300,
              color: '#FDFDFC',
              letterSpacing: '-0.02em',
              marginBottom: 24,
            }} data-section="liquorChat" data-field="headline">
              {content.liquorChat.headline}
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
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
              marginBottom: 32,
            }}>
              {content.liquorChat.features.map((item, i) => (
                <div key={i} style={{
                  background: 'rgba(74, 144, 217, 0.1)',
                  borderRadius: 12,
                  padding: 20,
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
            borderRadius: 20,
            padding: 48,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 24,
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#4A90D9',
              }} />
              <span style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
              }}>
                LiquorChat Kiosk Interface
              </span>
            </div>
            <div style={{
              background: '#FAFAFA',
              borderRadius: 12,
              padding: 24,
            }}>
              {/* Chat bubble from customer */}
              <div style={{
                background: '#F4F4F5',
                borderRadius: '16px 16px 16px 4px',
                padding: '12px 16px',
                marginBottom: 16,
                maxWidth: '80%',
              }}>
                <div style={{ fontSize: 14, color: '#18181B' }}>
                  What pairs well with grilled salmon?
                </div>
              </div>
              {/* AI response */}
              <div style={{
                background: 'linear-gradient(135deg, #4A90D9 0%, #5D6AF6 100%)',
                borderRadius: '16px 16px 4px 16px',
                padding: '12px 16px',
                marginLeft: 'auto',
                maxWidth: '85%',
              }}>
                <div style={{ fontSize: 14, color: '#FFFFFF', lineHeight: 1.5 }}>
                  For grilled salmon, I recommend our <strong>2022 Willamette Valley Pinot Noir</strong> - $24.99, currently in stock in Aisle 3. Light body with bright cherry notes that complement the fish beautifully.
                </div>
              </div>
              <div style={{
                fontSize: 11,
                color: '#A1A1AA',
                marginTop: 12,
                textAlign: 'right',
              }}>
                Real-time inventory • AI recommendations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator + Pricing Section - Combined */}
      <section style={{
        padding: '100px 64px',
        background: 'linear-gradient(180deg, #FAFAF8 0%, #FDFDFC 100%)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* ROI Calculator - Only for Retail */}
          {clientType === 'retail' && (
          <div style={{ marginBottom: 80 }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#ED7F35', marginBottom: 12 }}>
                BUILD YOUR SERVICE PACKAGE
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 300, letterSpacing: '-0.02em' }}>
                ROI Calculator
              </h2>
            </div>

            <div className="reveal-scale animate-delay-200" style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: 40,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px)',
              borderRadius: 24,
              padding: 40,
              border: '1px solid rgba(10, 10, 10, 0.06)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
            }}>
              {/* Left: Service Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* Always Included - 2 Column Grid */}
                <div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    color: '#22C55E',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                    ALWAYS INCLUDED
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {lockedServices.map((service, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        background: 'rgba(34, 197, 94, 0.06)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        borderRadius: 10,
                      }}>
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          background: '#22C55E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{service.name}</div>
                          <div style={{ fontSize: 11, color: '#666' }}>{service.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Choose 3 Services - 2 Column Grid */}
                <div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    color: '#ED7F35',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ED7F35" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="3" /></svg>
                    CHOOSE 3 SERVICES
                    <span style={{
                      marginLeft: 'auto',
                      background: selectedServices.length === 3 ? '#22C55E' : '#ED7F35',
                      color: '#FFF',
                      padding: '4px 10px',
                      borderRadius: 100,
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {selectedServices.length}/3
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {selectableServices.map((service, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleService(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '14px 16px',
                          background: selectedServices.includes(idx) ? 'rgba(237, 127, 53, 0.08)' : '#FFF',
                          border: selectedServices.includes(idx) ? '2px solid #ED7F35' : '1px solid rgba(10, 10, 10, 0.1)',
                          borderRadius: 10,
                          cursor: selectedServices.length >= 3 && !selectedServices.includes(idx) ? 'not-allowed' : 'pointer',
                          opacity: selectedServices.length >= 3 && !selectedServices.includes(idx) ? 0.5 : 1,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          border: selectedServices.includes(idx) ? 'none' : '2px solid rgba(10, 10, 10, 0.15)',
                          background: selectedServices.includes(idx) ? '#ED7F35' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {selectedServices.includes(idx) && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{service.name}</div>
                          <div style={{ fontSize: 11, color: '#666' }}>{service.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ad-Hoc Design Toggle */}
                <div style={{
                  padding: 18,
                  background: adHocDesign ? 'rgba(139, 36, 199, 0.06)' : 'rgba(10, 10, 10, 0.02)',
                  border: adHocDesign ? '2px solid #8B24C7' : '1px solid rgba(10, 10, 10, 0.1)',
                  borderRadius: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: adHocDesign ? '#8B24C7' : '#0A0A0A', marginBottom: 2 }}>Ad-Hoc Design Requests</div>
                      <div style={{ fontSize: 12, color: '#666' }}>Custom projects each month <span style={{ fontWeight: 600, color: '#8B24C7' }}>+$1,000/mo</span></div>
                    </div>
                    <div
                      onClick={() => setAdHocDesign(!adHocDesign)}
                      style={{
                        width: 52,
                        height: 28,
                        borderRadius: 14,
                        background: adHocDesign ? '#8B24C7' : 'rgba(10, 10, 10, 0.15)',
                        padding: 3,
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
                        transform: adHocDesign ? 'translateX(24px)' : 'translateX(0)',
                        transition: 'transform 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Unified Black ROI Panel */}
              <div style={{
                background: 'linear-gradient(180deg, #0A0A0A 0%, #141414 100%)',
                borderRadius: 20,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}>
                  <div style={{
                    fontSize: 11,
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
                    padding: '4px 10px',
                    borderRadius: 100,
                  }}>
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#22C55E',
                      animation: 'pulse 2s infinite',
                    }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#22C55E', letterSpacing: '0.05em' }}>LIVE</span>
                  </div>
                </div>

                {/* Timeframe Selector */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <div style={{
                    display: 'inline-flex',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: 10,
                    padding: 4,
                    gap: 4,
                  }}>
                    {[
                      { idx: 0, label: '1 Month' },
                      { idx: 1, label: '3 Months' },
                      { idx: 2, label: '6 Months' },
                      { idx: 3, label: '12 Months' },
                    ].map(({ idx, label }) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTimeframe(idx)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          border: 'none',
                          background: selectedTimeframe === idx ? '#ED7F35' : 'transparent',
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: selectedTimeframe === idx ? 600 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results Summary - Row 1: Immediate + Retention with explanations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {/* Row 1: Immediate & Retention */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* Immediate Revenue */}
                    <div style={{
                      background: 'rgba(237, 127, 53, 0.08)',
                      borderRadius: 12,
                      padding: 16,
                      border: '1px solid rgba(237, 127, 53, 0.15)',
                    }}>
                      <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#ED7F35', marginBottom: 8, fontWeight: 600 }}>IMMEDIATE REVENUE</div>
                      <div style={{ fontSize: 26, fontWeight: 300, color: '#ED7F35', marginBottom: 10 }}>
                        ${calculateROI().sparkline[selectedTimeframe].immediate.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 1.5 }}>
                        Revenue from new customers you can directly track and attribute to marketing spend.
                      </div>
                    </div>
                    {/* Increased Retention */}
                    <div style={{
                      background: 'rgba(139, 36, 199, 0.08)',
                      borderRadius: 12,
                      padding: 16,
                      border: '1px solid rgba(139, 36, 199, 0.15)',
                    }}>
                      <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#8B24C7', marginBottom: 8, fontWeight: 600 }}>INCREASED RETENTION</div>
                      <div style={{ fontSize: 26, fontWeight: 300, color: '#8B24C7', marginBottom: 10 }}>
                        ${calculateROI().sparkline[selectedTimeframe].repeat.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 1.5 }}>
                        Revenue from repeat customers and increased basket sizes that compound over time.
                      </div>
                    </div>
                  </div>
                  {/* Row 2: Long-term full width */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                    borderRadius: 12,
                    padding: 18,
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#22C55E', marginBottom: 8, fontWeight: 600 }}>TOTAL PROJECTED VALUE</div>
                        <div style={{ fontSize: 14, color: '#FFFFFF', lineHeight: 1.5, maxWidth: 280 }}>
                          Combined value of immediate revenue plus retention—the full picture of your marketing ROI.
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 32, fontWeight: 300, color: '#22C55E' }}>
                          ${calculateROI().sparkline[selectedTimeframe].longterm.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                          in {[1, 3, 6, 12][selectedTimeframe]} {selectedTimeframe === 0 ? 'month' : 'months'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Investment - Bottom */}
                <div style={{
                  marginTop: 'auto',
                  padding: 20,
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#ED7F35', marginBottom: 4, fontWeight: 500 }}>YOUR INVESTMENT</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {selectedServices.length + lockedServices.length} services{adHocDesign ? ' + design' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 32, fontWeight: 300, color: '#FFF' }}>${(3000 + (adHocDesign ? 1000 : 0)).toLocaleString()}</span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>/mo</span>
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

            <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {pricingTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="reveal"
                  style={{
                    background: tier.best ? 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 20,
                    padding: 28,
                    border: tier.best ? 'none' : '1px solid rgba(10, 10, 10, 0.08)',
                    color: tier.best ? '#FFF' : '#0A0A0A',
                    position: 'relative',
                    transform: tier.best ? 'scale(1.02)' : 'scale(1)',
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

            {/* Growth Partner Differentiators - Single Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: 48,
            }}>
              {growthPartnerPoints.map((point, i) => (
                <div key={i} style={{
                  background: 'rgba(139, 36, 199, 0.03)',
                  border: '1px solid rgba(139, 36, 199, 0.1)',
                  borderRadius: 16,
                  padding: 24,
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
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
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #8B24C7, #6B21A8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#FFF', fontFamily: 'monospace' }}>
                      {point.icon}
                    </span>
                  </div>
                  <h4 style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#0A0A0A',
                    marginBottom: 8,
                  }}>
                    {point.title}
                  </h4>
                  <p style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: '#666',
                  }}>
                    {point.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Enterprise Pricing Card - Optimized Wide Layout */}
            <div style={{
              background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
              borderRadius: 24,
              padding: 48,
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

              <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
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
        padding: '120px 64px',
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
            display: 'flex',
            justifyContent: 'center',
            gap: 48,
            marginBottom: 64,
            padding: '40px 0',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            {content.stats.items.map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 48,
                  fontWeight: 200,
                  color: '#ED7F35',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}>
                  {item.stat}
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginTop: 8,
                  letterSpacing: '0.05em',
                }}>
                  {item.label.toUpperCase()}
                </div>
                <div style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.4)',
                  marginTop: 4,
                }}>
                  {item.sublabel}
                </div>
              </div>
            ))}
          </div>

          <div className="stagger-children" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
          }}>
            {/* Typical Agency Column */}
            <div className="reveal-left" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 24,
              padding: 40,
              position: 'relative',
            }}>
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
              <div style={{
                fontSize: 12,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 24,
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
              borderRadius: 24,
              padding: 40,
              position: 'relative',
              boxShadow: '0 20px 60px rgba(237, 127, 53, 0.15)',
            }}>
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
              <div style={{
                fontSize: 12,
                letterSpacing: '0.15em',
                color: '#ED7F35',
                marginBottom: 24,
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
            marginTop: 64,
            background: 'linear-gradient(135deg, rgba(237, 127, 53, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)',
            borderRadius: 24,
            padding: '48px 64px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 24, opacity: 0.3 }}>
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" fill="#ED7F35"/>
            </svg>
            <p style={{
              fontSize: 22,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 24,
              fontStyle: 'italic',
              lineHeight: 1.6,
              maxWidth: 700,
              margin: '0 auto 24px',
            }}>
              Working with a specialist who already knows the beverage industry saved us 6 months of trial and error. The results were immediate because they didn&apos;t have to learn our business—they already lived it.
            </p>
            <div style={{ fontSize: 14, color: '#ED7F35', fontWeight: 600 }}>— Regional Chain Owner, 12 Locations</div>
          </div>
        </div>
      </section>

      {/* About Alden Section - Direct Access Emphasis */}
      <section id="about-section" style={{
        padding: '120px 64px',
        position: 'relative',
        zIndex: 1,
        background: 'linear-gradient(180deg, #FDFDFC 0%, rgba(237, 127, 53, 0.03) 100%)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Hero statement about working directly with Alden */}
          <div className="reveal" style={{
            textAlign: 'center',
            marginBottom: 80,
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
            gridTemplateColumns: '1fr 1.2fr',
            gap: 80,
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
              }} data-section="about" data-field="founderName">
                {content.about.founderName}
              </h3>
              <div style={{
                fontSize: 14,
                color: '#ED7F35',
                letterSpacing: '0.05em',
                marginBottom: 24,
              }} data-section="about" data-field="founderTitle">
                {content.about.founderTitle}
              </div>
              <p style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: '#666',
              }} data-section="about" data-field="founderBio">
                {content.about.founderBio}
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
                }} data-section="about" data-field="directAccessPromise.title">
                  {content.about.directAccessPromise.title}
                </h4>
                <p style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: 32,
                }} data-section="about" data-field="directAccessPromise.description">
                  {content.about.directAccessPromise.description}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {content.about.directAccessPromise.points.map((point, i) => (
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
            marginTop: 80,
            background: 'rgba(237, 127, 53, 0.05)',
            border: '1px solid rgba(237, 127, 53, 0.15)',
            borderRadius: 24,
            padding: '48px 64px',
            textAlign: 'center',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 24, opacity: 0.5 }}>
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" fill="#ED7F35"/>
            </svg>
            <p style={{
              fontSize: 20,
              color: '#0A0A0A',
              marginBottom: 24,
              fontStyle: 'italic',
              lineHeight: 1.6,
              maxWidth: 800,
              margin: '0 auto 24px',
            }}>
              What sets IC apart is that I&apos;m actually working with Alden. He knows my store, knows my customers, and when I have a question, I&apos;m talking to the person making the decisions—not some account manager reading from a script.
            </p>
            <div style={{ fontSize: 14, color: '#ED7F35', fontWeight: 600 }}>— Independent Wine Shop Owner, NYC</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact-section" style={{
        padding: '120px 64px',
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
                fontSize: 56,
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
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <button style={{
                  background: 'linear-gradient(135deg, #8B24C7, #6B21A8)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '20px 48px',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(139, 36, 199, 0.25)',
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
                fontSize: 56,
                fontWeight: 200,
                letterSpacing: '-0.02em',
                marginBottom: 24,
              }}>
                Ready for measurable growth?
              </h2>
              <p style={{
                fontSize: 18,
                lineHeight: 1.7,
                color: '#666',
                marginBottom: 48,
              }}>
                Get a free marketing audit and discover how we can help your liquor store or beverage business compete and grow.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <button style={{
                  background: '#ED7F35',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '20px 48px',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}>
                  GET FREE AUDIT
                </button>
                <button style={{
                  background: 'transparent',
                  color: '#0A0A0A',
                  border: '1px solid rgba(10, 10, 10, 0.2)',
                  padding: '20px 48px',
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  borderRadius: 8,
                  cursor: 'pointer',
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
      <section style={{
        padding: '120px 64px',
        background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
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
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
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
      <footer style={{
        padding: '80px 64px',
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
    </div>
  );
};
