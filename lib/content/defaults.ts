// Default content for the IC website
// This serves as both the fallback when CMS is empty and the source of truth for code-based editing

export interface SectionContent {
  [key: string]: unknown;
}

export interface DefaultContent {
  hero: {
    industryBadge: string;
    yearsExperience: number;
    yearsLabel: string;
    tiers: Array<{ tier: string; name: string; desc: string; color: string }>;
    retailHeadline: { prefix: string; highlight: string; suffix: string };
    enterpriseHeadline: { prefix: string; highlight: string; suffix: string };
    retailDescription: string;
    enterpriseDescription: string;
    retailClientTypes: string[];
    enterpriseClientTypes: string[];
    ctaPrimary: string;
    ctaSecondary: string;
    ctaWords: string[];
  };
  stats: {
    items: Array<{ stat: string; label: string; sublabel: string }>;
  };
  services: {
    selectableServices: Array<{ name: string; desc: string; immediate: number; longterm: number }>;
    lockedServices: Array<{ name: string; desc: string; immediate: number; longterm: number }>;
    allServices: Array<{ name: string; desc: string }>;
  };
  enterpriseServices: Array<{
    title: string;
    desc: string;
    icon: string;
    for: string;
  }>;
  pricing: {
    tiers: Array<{
      name: string;
      price: number;
      onboarding: number;
      services: number;
      tagline: string;
      desc: string;
      keyDiff: string;
      keyDiffDetail: string;
      features: string[];
      expandedFeatures: string[];
      bestFor: string;
      commitment: string;
      best: boolean;
    }>;
  };
  caseStudies: Array<{
    metric: string;
    label: string;
    client: string;
    desc: string;
  }>;
  cityHive: {
    title: string;
    description: string;
    impressions: string;
    revenue: string;
    bulletPoints: string[];
    quote: string;
  };
  testimonials: Array<{
    quote: string;
    name: string;
    location: string;
  }>;
  clientTypes: Array<{
    name: string;
    count: string;
  }>;
  growthPartnerPoints: Array<{
    title: string;
    desc: string;
    icon: string;
  }>;
  comparison: {
    typicalAgency: Array<{ text: string; detail: string }>;
    intentionallyCreative: Array<{ text: string; detail: string }>;
    bottomQuote: { text: string; attribution: string };
  };
  about: {
    founderName: string;
    founderTitle: string;
    founderBio: string;
    directAccessPromise: {
      title: string;
      description: string;
      points: string[];
    };
    tierExpertise: Array<{
      tier: string;
      focus: string;
      desc: string;
      color: string;
    }>;
    testimonial: {
      quote: string;
      attribution: string;
    };
  };
  contact: {
    retail: {
      sectionLabel: string;
      headline: string;
      description: string;
    };
    enterprise: {
      sectionLabel: string;
      headline: string;
      ctaWords: string[];
    };
    formLabels: {
      storeName: string;
      email: string;
      locations: string;
      submit: string;
    };
  };
  navigation: {
    items: Array<{ label: string; id: string }>;
    clientTypes: {
      retail: string;
      enterprise: string;
    };
    stickyCta: string;
  };
}

export const defaultContent: DefaultContent = {
  hero: {
    industryBadge: 'ALCOHOLIC BEVERAGE INDUSTRY ONLY',
    yearsExperience: 10,
    yearsLabel: 'YEARS IN THE 3-TIER ALC-BEV INDUSTRY',
    tiers: [
      { tier: 'Tier 1', name: 'Producer', desc: 'Breweries, Distilleries, Wineries', color: '#ED7F35' },
      { tier: 'Tier 2', name: 'Distributor', desc: 'Wholesale & Distribution', color: '#F93830' },
      { tier: 'Tier 3', name: 'Retail', desc: 'Liquor Stores & Chains', color: '#ED7F35' },
    ],
    retailHeadline: { prefix: '', highlight: 'Alcohol retail', suffix: ' marketing agency' },
    enterpriseHeadline: { prefix: 'Enterprise ', highlight: 'beverage marketing', suffix: ' at scale' },
    retailDescription: "We help independent liquor stores and regional chains compete with big-box retailers through data-driven digital marketing built exclusively for the alcoholic beverage industry.",
    enterpriseDescription: "From Anheuser-Busch to regional distributors, we provide enterprise-grade marketing for breweries, distilleries, wineries, and beverage corporations.",
    retailClientTypes: ['Liquor Stores', 'Wine Shops', 'Beer Retailers', 'Regional Chains'],
    enterpriseClientTypes: ['Breweries', 'Distilleries', 'Wineries', 'Distributors', 'Beverage Corps'],
    ctaPrimary: 'GET FREE AUDIT',
    ctaSecondary: 'View Case Studies',
    ctaWords: ['brand', 'chain', 'distribution', 'products'],
  },

  stats: {
    items: [
      { stat: '10+', label: 'Years in beverage', sublabel: 'Producer, distributor & retail' },
      { stat: '107', label: 'Retail partners', sublabel: 'And growing every month' },
      { stat: '312%', label: 'Average ROI', sublabel: 'Across our client base' },
    ],
  },

  services: {
    selectableServices: [
      { name: 'Geofencing Ads', desc: 'Precision targeting within 5 miles', immediate: 2.8, longterm: 1.4 },
      { name: 'Google Ads', desc: 'Search campaigns that convert', immediate: 3.2, longterm: 1.2 },
      { name: 'Facebook & Instagram Ads', desc: 'Social that drives foot traffic', immediate: 2.4, longterm: 1.8 },
      { name: 'Email & SMS Marketing', desc: 'Direct customer engagement', immediate: 2.6, longterm: 2.8 },
      { name: 'Organic Social (FB/IG)', desc: 'Content & community building', immediate: 1.4, longterm: 2.6 },
    ],
    lockedServices: [
      { name: 'Dedicated Customer Success Manager', desc: 'Your strategic partner', immediate: 1.2, longterm: 1.8 },
      { name: 'Bev-Alc Specialized Staff', desc: 'Access to entire team', immediate: 1.0, longterm: 1.5 },
      { name: 'Customer Dashboard', desc: 'State-of-the-art reporting', immediate: 0.8, longterm: 1.2 },
      { name: 'Foot Traffic & Online Insights', desc: 'State, regional & national data exclusive to partners', immediate: 2.0, longterm: 2.8 },
      { name: 'Google Platform Suite', desc: 'Business Profile, Search Console, Merchant Center', immediate: 1.8, longterm: 2.5 },
      { name: 'Website Optimization', desc: 'Ongoing optimization & seasonal changes', immediate: 1.5, longterm: 2.2 },
    ],
    allServices: [
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
    ],
  },

  enterpriseServices: [
    {
      title: 'Custom GTM Strategy',
      desc: 'Tailored go-to-market strategies built for your specific market, audience, and growth objectives.',
      icon: '01',
      for: 'All Enterprise Clients',
    },
    {
      title: 'Centralized Campaign Management',
      desc: "Whether 1 location or 500+, everything is managed centrally with localized execution and unified brand voice.",
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
  ],

  pricing: {
    tiers: [
      {
        name: 'White Glove',
        price: 3000,
        onboarding: 1500,
        services: 5,
        tagline: 'PROVEN EXCELLENCE',
        desc: "Gain access to the exact strategies and marketing playbooks that power the top 0.1% of liquor stores nationwide.",
        keyDiff: 'Elite Store Strategies',
        keyDiffDetail: 'Proven tactics from top-performing stores',
        features: [
          "Strategies from America's top liquor stores",
          'Dedicated Customer Success Manager',
          'Monthly strategy sessions',
          'Real-time performance dashboard',
          'Aggregated insights from 107 stores',
        ],
        expandedFeatures: [
          'Dedicated Slack channel',
          'Monthly performance reports',
          'Quarterly strategy reviews',
          'Access to creative templates',
          'Priority email support',
        ],
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
        features: [
          'Monthly founder strategy sessions',
          'Full executive team collaboration',
          'Production team support',
          'Sales & fulfillment coordination',
          'Custom growth roadmap',
        ],
        expandedFeatures: [
          'Chain competition monitoring',
          'Rebranding consultation',
          'Long-term growth roadmap',
          'Custom analytics dashboards',
          'Quarterly business reviews',
          'Priority implementation',
        ],
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
        desc: "Your dedicated account manager (no shared clients), two hours monthly with our founder, plus deep market intelligence.",
        keyDiff: 'Dedicated AM + 2hr Founder Monthly',
        keyDiffDetail: 'Exclusive attention & market intelligence',
        features: [
          "Dedicated Account Manager (you're their only client)",
          '2x 1-hour founder sessions per month',
          'Deep foot traffic & market insights',
          'Competitor tracking & analysis',
          'Executive-ready presentations',
        ],
        expandedFeatures: [
          'Board/investor presentation support',
          'M&A due diligence support',
          'National expansion strategy',
          'Vendor negotiation support',
          'Crisis management',
          'Direct founder mobile access',
        ],
        bestFor: 'Regional chains & market leaders',
        commitment: '6 months',
        best: false,
      },
    ],
  },

  caseStudies: [
    { metric: '+312%', label: 'ROI', client: 'Regional Chain (14 Locations)', desc: 'Comprehensive digital strategy combining geofencing with SEO optimization' },
    { metric: '+47%', label: 'Foot Traffic', client: 'Urban Wine Shop', desc: 'Precision geofencing during off-peak hours drove measurable in-store visits' },
    { metric: '+89%', label: 'Online Orders', client: 'Suburban Liquor Store', desc: 'City Hive optimization combined with Google Ads campaign' },
  ],

  cityHive: {
    title: 'FEATURED PARTNERSHIP',
    description: "In early 2024, we partnered with CityHive—the nation's #1 e-commerce platform for beverage retail—to advance their in-store involvement efforts, increase app engagement, and execute general marketing initiatives across their network of 7,000+ liquor stores nationwide.",
    impressions: '50M+',
    revenue: '$M+',
    bulletPoints: [
      'Nationwide reach across 7,000+ retail locations',
      'Coordinated marketing across all participating stores',
      'In-store engagement and app adoption campaigns',
      'Full attribution tracking for ROI measurement',
    ],
    quote: "Intentionally Creative understood our platform and our retailers from day one. They delivered results that moved the needle for thousands of stores.",
  },

  testimonials: [
    { quote: 'They understand liquor retail like no other agency. Our ROI tripled in 6 months.', name: 'Owner', location: 'Multi-Location Chain, Texas' },
    { quote: "Finally, an agency that speaks our language. The 3-tier expertise is real.", name: 'Marketing Director', location: 'Regional Distributor, California' },
    { quote: 'LiquorChat alone paid for the entire engagement. Game changer.', name: 'Owner', location: 'Independent Wine Shop, NYC' },
  ],

  clientTypes: [
    { name: 'Independent Liquor Stores', count: '47' },
    { name: 'Regional Chains', count: '23' },
    { name: 'Wine & Spirits Shops', count: '31' },
    { name: 'Craft Beverage Retailers', count: '15' },
  ],

  growthPartnerPoints: [
    {
      title: 'We Think Like Owners',
      desc: "Most agencies treat you like a task list. We think about your business as if it were ours—analyzing margins, understanding seasonality, and optimizing for real profit, not vanity metrics.",
      icon: '01',
    },
    {
      title: 'Strategy Before Tactics',
      desc: "We don't just run ads. We build comprehensive growth systems that compound over time. Every campaign connects to a larger strategic framework designed for long-term dominance.",
      icon: '02',
    },
    {
      title: 'Data-Obsessed Decisions',
      desc: "Every recommendation is backed by proprietary data from 107 liquor retailers. We know what works because we've tested it across diverse markets, store sizes, and demographics.",
      icon: '03',
    },
    {
      title: 'Skin in the Game',
      desc: "We built LiquorChat—a SaaS product with 3 patents pending. We're not just advisors, we're operators who understand the daily challenges of running a beverage retail business.",
      icon: '04',
    },
  ],

  comparison: {
    typicalAgency: [
      { text: 'Generic strategies across all industries', detail: 'No understanding of compliance or 3-tier' },
      { text: 'Learning your industry on your dime', detail: 'Months of ramp-up time you pay for' },
      { text: 'One-size-fits-all campaigns', detail: "Copy-paste templates that don't convert" },
      { text: "Vanity metrics that don't drive sales", detail: 'Likes and impressions mean nothing' },
      { text: 'Junior staff executing your account', detail: 'Your strategy is an afterthought' },
      { text: 'Quarterly reports with excuses', detail: 'No accountability, no results' },
    ],
    intentionallyCreative: [
      { text: '10+ years of beverage industry specialization', detail: "We've lived every tier of this business" },
      { text: 'Proven playbooks customized for your store', detail: 'We know what works, tailored to you' },
      { text: 'Campaigns built for your exact customer base', detail: 'Hyper-local targeting that converts' },
      { text: 'Foot traffic and revenue as our KPIs', detail: "If you don't make money, we failed" },
      { text: 'Direct access to founder Alden Morris', detail: 'No handoffs, no junior account managers' },
      { text: 'Real-time dashboards with transparent results', detail: 'See every dollar at work 24/7' },
    ],
    bottomQuote: {
      text: "Working with a specialist who already knows the beverage industry saved us 6 months of trial and error. The results were immediate because they didn't have to learn our business—they already lived it.",
      attribution: '— Regional Chain Owner, 12 Locations',
    },
  },

  about: {
    founderName: 'Alden Morris',
    founderTitle: 'Founder & Principal Strategist',
    founderBio: "Alden brings over ten years of experience across the U.S. beverage industry's supplier, distributor, and retail tiers. He has led marketing efforts for national brands and worked directly with independent retailers and producers, building a practical understanding of how to grow beverage businesses across different markets.",
    directAccessPromise: {
      title: "You don't get pawned off to a junior team",
      description: "Every one of our case studies points to the same thing: clients succeed because Alden is directly involved in their strategy, their projects, and their growth. This isn't a bait-and-switch agency where you sign with the founder and then never see them again.",
      points: [
        'Alden personally reviews every campaign strategy',
        'Direct Slack/phone access to discuss your business',
        'Monthly strategy sessions with the founder',
        'He knows your store, your market, your customers',
      ],
    },
    tierExpertise: [
      { tier: 'Tier 1: Producer', focus: 'Brand Development & Strategy', desc: 'Managing brand portfolios, product launches, and marketing strategy for craft beverage producers.', color: '#ED7F35' },
      { tier: 'Tier 2: Distributor', focus: 'Sales & Distribution', desc: 'Territory management, retailer relationships, shelf placement strategy, and distribution logistics.', color: '#F93830' },
      { tier: 'Tier 3: Retail', focus: 'Retail Operations', desc: 'Store consulting, promotional strategy, margin optimization, and customer experience.', color: '#ED7F35' },
    ],
    testimonial: {
      quote: "What sets IC apart is that I'm actually working with Alden. He knows my store, knows my customers, and when I have a question, I'm talking to the person making the decisions—not some account manager reading from a script.",
      attribution: '— Independent Wine Shop Owner, NYC',
    },
  },

  contact: {
    retail: {
      sectionLabel: "LET'S GROW TOGETHER",
      headline: 'Ready for a free audit?',
      description: "Get a comprehensive analysis of your current marketing efforts and a custom roadmap for growth.",
    },
    enterprise: {
      sectionLabel: "LET'S BUILD SOMETHING GREAT",
      headline: 'Ready to transform your',
      ctaWords: ['brand', 'chain', 'distribution', 'products'],
    },
    formLabels: {
      storeName: 'Store / Company Name',
      email: 'Email Address',
      locations: 'Number of Locations',
      submit: 'Get My Free Audit',
    },
  },

  navigation: {
    items: [
      { label: 'Services', id: 'services-section' },
      { label: 'Results', id: 'results-section' },
      { label: 'About', id: 'about-section' },
      { label: 'Contact', id: 'contact-section' },
    ],
    clientTypes: {
      retail: 'Liquor Retail',
      enterprise: 'Enterprise: Chains / Distributor / Producer',
    },
    stickyCta: 'Free Audit',
  },
};

// Helper to get section by key
export function getSectionDefaults(sectionKey: keyof DefaultContent): SectionContent {
  return defaultContent[sectionKey] as SectionContent;
}

// Helper to merge CMS content with defaults (CMS wins on conflicts)
export function mergeWithDefaults<T extends Record<string, unknown>>(
  defaults: T,
  cmsContent: Partial<T> | null
): T {
  if (!cmsContent) return defaults;

  // Deep merge for objects
  const result = { ...defaults } as T;
  for (const key of Object.keys(cmsContent)) {
    const k = key as keyof T;
    const cmsValue = cmsContent[k];
    if (cmsValue !== undefined) {
      if (
        typeof cmsValue === 'object' &&
        cmsValue !== null &&
        !Array.isArray(cmsValue) &&
        typeof defaults[k] === 'object' &&
        defaults[k] !== null &&
        !Array.isArray(defaults[k])
      ) {
        // Recursively merge nested objects
        (result as Record<string, unknown>)[key] = mergeWithDefaults(
          defaults[k] as Record<string, unknown>,
          cmsValue as Record<string, unknown>
        );
      } else {
        // Direct assignment for primitives and arrays
        (result as Record<string, unknown>)[key] = cmsValue;
      }
    }
  }
  return result;
}
