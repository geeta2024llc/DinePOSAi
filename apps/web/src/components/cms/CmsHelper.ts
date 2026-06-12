'use client';

export interface CmsConfig {
  homepage: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    posTitle: string;
    posDesc: string;
    kdsTitle: string;
    kdsDesc: string;
    conciergeTitle: string;
    conciergeDesc: string;
    guestTitle: string;
    guestDesc: string;
  };
  pricing: {
    starterMonthly: string;
    starterAnnual: string;
    growthMonthly: string;
    growthAnnual: string;
    premiumMonthly: string;
    premiumAnnual: string;
    starterDesc: string;
    growthDesc: string;
    premiumDesc: string;
  };
  support: {
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    hours: string;
    faq1Title: string;
    faq1Desc: string;
    faq2Title: string;
    faq2Desc: string;
  };
  partners: {
    title: string;
    subtitle: string;
    intro: string;
    partner1Name: string;
    partner1Desc: string;
    partner2Name: string;
    partner2Desc: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    signupTitle: string;
    signupSubtitle: string;
  };
  legal: {
    termsTitle: string;
    termsSubtitle: string;
    termsBody1: string;
    privacyTitle: string;
    privacySubtitle: string;
    privacyBody1: string;
  };
}

export const defaultCmsConfig: CmsConfig = {
  homepage: {
    heroTitle: "The Intelligent Standard for Fine Dining Operations",
    heroSubtitle: "DinePOS AI is the next-generation orchestrator for high-volume, multi-location hospitality groups. Fluid table flows, automatic coursing, and predictive telemetry combined.",
    heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_9hW0-Bn5U_Gzfsc5vJk-zOi7qxniua5UktAA96RYKvjwM9qig_LtKHUoXbIY_NdBJ4U9IgjA0RVHzPrNnIYmAaC6q60uAHS_EfbpoxYAge_XxziJs8r8LTcCK24PNHyF3lSI_6WcA7un9-7lx7SueI-rmj7zlNv2UoFyaEwIkTNVBC_O_dFSQQLXsf6MVKKgU6Frp6huK88BJdQd0WU-N9OBozDLtkYvAbeKAGsA6wWv5Cm1oSt9Zk9dnUW-5oBfDgRaorImwhnd",
    posTitle: "Intelligent POS",
    posDesc: "Fluid table management, dynamic coursing, and split-second transaction processing designed for the pace of a busy dining room.",
    kdsTitle: "Kitchen Display",
    kdsDesc: "High-contrast, color-coded ticketing. Prioritize firing times to ensure perfect plating synchronicity.",
    conciergeTitle: "Global Concierge",
    conciergeDesc: "24/7 white-glove technical support. We handle the system so you can focus on the service.",
    guestTitle: "Guest Profiles",
    guestDesc: "Anticipate needs before they arrive. Track preferences, allergies, and milestone dates to deliver a truly personalized concierge experience.",
  },
  pricing: {
    starterMonthly: "3980",
    starterAnnual: "3180",
    growthMonthly: "6980",
    growthAnnual: "5580",
    premiumMonthly: "12980",
    premiumAnnual: "10380",
    starterDesc: "Perfect for small restaurants and cafés getting started with digital ordering.",
    growthDesc: "Designed for restaurants that want to increase sales and automate operations.",
    premiumDesc: "Built for high-volume restaurants, chains, and multi-location businesses.",
  },
  support: {
    title: "Support Desk",
    subtitle: "24/7 White-glove technical administration for DinePOS AI deployments.",
    email: "concierge@dinepos.ai",
    phone: "+1 (888) 555-DINE",
    hours: "24/7/365 — Always Online",
    faq1Title: "What is the Aura Protocol?",
    faq1Desc: "Aura is our proprietary real-time synchronization protocol. It manages zero-latency replication between FOH terminals, kitchen displays, and cloud telemetry services, ensuring offline continuity during connectivity issues.",
    faq2Title: "Do you offer hardware sourcing?",
    faq2Desc: "Yes, we source, pre-configure, and ship enterprise hardware bundles (tablets, terminal stands, custom thermal receipt printers) directly to your establishment.",
  },
  partners: {
    title: "Global Alliance Network",
    subtitle: "Synergistic integrations and certified implementation groups for DinePOS AI.",
    intro: "We collaborate with premier hospitality technology providers, payment processing leaders, and supply chain managers to deliver a unified enterprise management ecosystem.",
    partner1Name: "Olo & Deliverect",
    partner1Desc: "Full menu syndication and direct-to-pass delivery ingestion pipelines, eliminating double tablet management.",
    partner2Name: "Stripe Enterprise",
    partner2Desc: "Global unified payments gateway with robust chip reader support, instant settlements, and secure fraud protection.",
  },
  auth: {
    loginTitle: "Enter the Enterprise Console",
    loginSubtitle: "Welcome back. Access global site metrics, billing details, and terminal operations.",
    signupTitle: "Join the Fine Dining Ecosystem",
    signupSubtitle: "Deploy DinePOS AI. Create your enterprise tenant profile below.",
  },
  legal: {
    termsTitle: "Terms of Service",
    termsSubtitle: "Intelligent Hospitality Systems Agreement",
    termsBody1: "At DinePOS AI, we treat the operational security of your establishment with rigorous protocols. We employ AES-256 encryption at rest and TLS 1.3 for all data in transit.",
    privacyTitle: "Privacy Policy",
    privacySubtitle: "Intelligent Hospitality Systems Data Governance",
    privacyBody1: "At DinePOS AI, we treat the data of your establishment and your patrons with the highest level of security protocols available in the hospitality sector. We employ AES-256 encryption at rest and TLS 1.3 for all data in transit. Your operational data remains entirely sovereign; we act solely as processors.",
  },
};

export const getCmsConfig = (): CmsConfig => {
  if (typeof window === 'undefined') return defaultCmsConfig;
  try {
    const stored = localStorage.getItem('dinepos_cms_config');
    if (stored) {
      return { ...defaultCmsConfig, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to parse CMS config from localStorage:', e);
  }
  return defaultCmsConfig;
};

export const saveCmsConfig = (config: CmsConfig): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('dinepos_cms_config', JSON.stringify(config));
    // Dispatch custom event to notify other components/tabs
    window.dispatchEvent(new Event('dinepos_cms_update'));
  } catch (e) {
    console.error('Failed to save CMS config to localStorage:', e);
  }
};
