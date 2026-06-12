'use client';

export interface CmsConfig {
  homepage: {
    heroLaunchBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    heroPrimaryCtaText: string;
    heroSecondaryCtaText: string;
    solutionsHeader: string;
    solutionsSubtitle: string;
    posTitle: string;
    posDesc: string;
    kdsTitle: string;
    kdsDesc: string;
    conciergeTitle: string;
    conciergeDesc: string;
    guestTitle: string;
    guestDesc: string;
    pricingHeaderBadge: string;
    pricingHeaderTitle: string;
    pricingHeaderSubtitle: string;
    trialTitle: string;
    trialDesc: string;
    trialFeatures: string;
    ambassadorBadge: string;
    ambassadorTitle: string;
    ambassadorSubtitle: string;
    ambassadorStat1Value: string;
    ambassadorStat1Label: string;
    ambassadorStat2Value: string;
    ambassadorStat2Label: string;
    ambassadorStat3Value: string;
    ambassadorStat3Label: string;
    ambassador1Title: string;
    ambassador1Desc: string;
    ambassador2Title: string;
    ambassador2Desc: string;
    ambassador3Title: string;
    ambassador3Desc: string;
    ambassadorPrimaryCtaText: string;
    ambassadorSecondaryCtaText: string;
    testimonialBadge: string;
    testimonialTitle: string;
    testimonialSubtitle: string;
    testimonial1Quote: string;
    testimonial1Author: string;
    testimonial1Role: string;
    testimonial1Image: string;
    testimonial1Position: string;
    testimonial2Quote: string;
    testimonial2Author: string;
    testimonial2Role: string;
    testimonial2Image: string;
    testimonial2Position: string;
    testimonial3Quote: string;
    testimonial3Author: string;
    testimonial3Role: string;
    testimonial3Image: string;
    testimonial3Position: string;
    ctaSectionTitle: string;
    ctaSectionSubtitle: string;
    ctaSectionPrimaryText: string;
    ctaSectionSecondaryText: string;
    footerCopyright: string;
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
    starterFeatures: string;
    growthFeatures: string;
    premiumFeatures: string;
    starterName: string;
    starterLabel: string;
    starterButtonText: string;
    growthName: string;
    growthLabel: string;
    growthButtonText: string;
    premiumName: string;
    premiumLabel: string;
    premiumButtonText: string;
    popularBadgeText: string;
    savePercentBadgeText: string;
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
    kbTitle: string;
    kbSubtitle: string;
    kbButtonText: string;
    kb1Title: string;
    kb1Desc: string;
    kb1Icon: string;
    kb2Title: string;
    kb2Desc: string;
    kb2Icon: string;
    kb3Title: string;
    kb3Desc: string;
    kb3Icon: string;
    formTitle: string;
    formEstPlaceholder: string;
    formNamePlaceholder: string;
    formEmailPlaceholder: string;
    formMsgPlaceholder: string;
    formButtonText: string;
    portalTitle: string;
    portalDesc: string;
    faqTitle: string;
    faqSubtitle: string;
  };
  partners: {
    title: string;
    subtitle: string;
    intro: string;
    partner1Name: string;
    partner1Desc: string;
    partner2Name: string;
    partner2Desc: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    testimonialQuote: string;
    testimonialAuthor: string;
    allianceTitle: string;
    allianceSubtitle: string;
    payoutPolicies: string;
    regTitle: string;
    regSubtitle: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    signupTitle: string;
    signupSubtitle: string;
    loginPageTitle: string;
    signupPageTitle: string;
    loginRoleLabel: string;
    loginEmailLabel: string;
    loginPasswordLabel: string;
    loginRememberMe: string;
    loginForgotPassword: string;
    loginButtonText: string;
    loginDemoTitle: string;
    loginFooter: string;
    signupLeftEyebrow: string;
    signupLeftTitle: string;
    signupLeftDesc: string;
    signupRightEyebrow: string;
    signupButtonText: string;
    signupFooter: string;
  };
  legal: {
    termsTitle: string;
    termsSubtitle: string;
    termsBody1: string;
    privacyTitle: string;
    privacySubtitle: string;
    privacyBody1: string;
    termsIntro: string;
    termsUsage1: string;
    termsUsage2: string;
    termsSub1: string;
    termsSub2: string;
    termsLiability1: string;
    termsLiability2: string;
    privacySovereignty2: string;
    privacyCollection: string;
    privacyCompliance: string;
    privacyThirdParty: string;
  };
}

export const defaultCmsConfig: CmsConfig = {
  homepage: {
    heroLaunchBadge: "Introducing DinePOS AI System",
    heroTitle: "The Intelligent Standard for Fine Dining Operations",
    heroSubtitle: "DinePOS AI is the next-generation orchestrator for high-volume, multi-location hospitality groups. Fluid table flows, automatic coursing, and predictive telemetry combined.",
    heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_9hW0-Bn5U_Gzfsc5vJk-zOi7qxniua5UktAA96RYKvjwM9qig_LtKHUoXbIY_NdBJ4U9IgjA0RVHzPrNnIYmAaC6q60uAHS_EfbpoxYAge_XxziJs8r8LTcCK24PNHyF3lSI_6WcA7un9-7lx7SueI-rmj7zlNv2UoFyaEwIkTNVBC_O_dFSQQLXsf6MVKKgU6Frp6huK88BJdQd0WU-N9OBozDLtkYvAbeKAGsA6wWv5Cm1oSt9Zk9dnUW-5oBfDgRaorImwhnd",
    heroPrimaryCtaText: "Request a Demo",
    heroSecondaryCtaText: "Explore Solutions",
    solutionsHeader: "Integrated Solutions",
    solutionsSubtitle: "Seamless synchronization from front-of-house to the pass.",
    posTitle: "Intelligent POS",
    posDesc: "Fluid table management, dynamic coursing, and split-second transaction processing designed for the pace of a busy dining room.",
    kdsTitle: "Kitchen Display",
    kdsDesc: "High-contrast, color-coded ticketing. Prioritize firing times to ensure perfect plating synchronicity.",
    conciergeTitle: "Global Concierge",
    conciergeDesc: "24/7 white-glove technical support. We handle the system so you can focus on the service.",
    guestTitle: "Guest Profiles",
    guestDesc: "Anticipate needs before they arrive. Track preferences, allergies, and milestone dates to deliver a truly personalized concierge experience.",
    pricingHeaderBadge: "Subscription Tiers",
    pricingHeaderTitle: "Simple, Transparent Pricing",
    pricingHeaderSubtitle: "Choose the plan that best fits your establishment's scale, transaction volume, and operational ambition.",
    trialTitle: "14 Days Free Trial",
    trialDesc: "Experience the complete power of DinePOS AI with all premium features unlocked during your trial. No credit card required.",
    trialFeatures: "AI Upsell, Inventory, Staff Management, POS, KDS, Analytics",
    ambassadorBadge: "Ambassador Network",
    ambassadorTitle: "Earn While You Introduce",
    ambassadorSubtitle: "Refer restaurants to DinePOS AI and earn premium cash rewards for every onboarded location. Our ambassador network is growing globally.",
    ambassadorStat1Value: "$150",
    ambassadorStat1Label: "Reward per signup",
    ambassadorStat2Value: "10%",
    ambassadorStat2Label: "Commission on first payment",
    ambassadorStat3Value: "$0",
    ambassadorStat3Label: "Cost to join the program",
    ambassador1Title: "Register & Get Your Code",
    ambassador1Desc: "Sign up as a DinePOS ambassador in under 2 minutes. You'll receive a unique referral code and link to share with your network.",
    ambassador2Title: "Restaurants Sign Up",
    ambassador2Desc: "When a venue registers using your code, they're instantly tracked on your ambassador dashboard — showing status, services, and accrued rewards.",
    ambassador3Title: "Collect Your Earnings",
    ambassador3Desc: "Earnings are credited per onboarded location and paid directly to your bank account once you reach the minimum threshold.",
    ambassadorPrimaryCtaText: "Join the Ambassador Program",
    ambassadorSecondaryCtaText: "Ambassador Login",
    testimonialBadge: "Michelin-Grade Partners",
    testimonialTitle: "Trusted by the Elite",
    testimonialSubtitle: "See how top-tier establishments are redefining culinary service and front-of-house flow with DinePOS AI.",
    testimonial1Quote: "DinePOS AI is the absolute cornerstone of our business operations at GEETA LLC. The seamless KDS integration, combined with real-time multi-branch telemetry and AI upselling, has allowed us to scale our culinary concepts with absolute consistency and efficiency.",
    testimonial1Author: "シリス　テクラル (SHREES TEKLAL)",
    testimonial1Role: "OWNER OF GEETA合同会社",
    testimonial1Image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEid7UQR_nMKW3G3jPlC08Wk9mr2l-nkxjh3ar_eR_u9b85HgBO8SzA6H5bwjTt3UtafFlb3IxXTeY2JxUN3xFkEIx1HL3I_42PiDzRFxy_AKQ6Yi81BKjiTfP-2Luko51rLj525315xEG14mUuK_NLKmWRXD5gl3ga11R2wAwtSdO6Wn23PcT8o6-dWbcg/s320/9aa544e2-ec4d-476a-8bbf-c589d0ee2464.jpg",
    testimonial1Position: "center 15%",
    testimonial2Quote: "KDS integration completely transformed our kitchen flow. Course-based firing and automatic allergy alerts mean we execute flawless services every single night. It is an indispensable culinary tool.",
    testimonial2Author: "Chef Antoine Laurent",
    testimonial2Role: "Executive Chef, Le Céleste",
    testimonial2Image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBF7LtjyBWbBlUr7NILHD6qzt9b-YtzTj9_1YVoX1bQqVJRgCLmBb4wIeFMkalbqm55eKEtN939-SsncojktN3xbYpAQHsoZpvhZ6CkeucH3gyG0sRKQRLg648a6f9OFqvhFuK0dW6v7zRo513dF9P_qLSsluq43CsukuUC6K_WGN5IOmOhoqEejVf1VPB06wdgFjWdt6_llCe29jlKCL-yKAZha7dQNIrL_PStu-XkNiQyTcCInb2ok0jVD3O_duXfbLnpp6ZdTKJi",
    testimonial2Position: "center",
    testimonial3Quote: "With unified analytics across our multi-unit portfolio, we optimized table turns by 18% and improved server tip averages. The platform paid for itself within the first month.",
    testimonial3Author: "Sophia Vance",
    testimonial3Role: "Director of Operations, The Gilded Group",
    testimonial3Image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBA_tr72qxwryiHrap9NizCYdmdT52uUIq0_1k1RU99eytvG8QoC_kdRpDVU1GwA6oxikSwZbJ82mfyykJdg9czijrb93Rz0_BE_8xHPbnqVPPYkP2vec8cEZhWes7_ZhtTOsMYq6yZnE4NYIc5567rAQ5nfaGyaQMZehPd2vMhepiMt4zDM4M0m3o2BdvH4LVPmvMAuMiU1Jw42sM2HTrIbh_EK1GZyLjQmhCuqOcdreyhu9jgpQdIZz9JA0xKgH9c0vL3xIVRRK7m",
    testimonial3Position: "center",
    ctaSectionTitle: "The Future of Hospitality is Here.",
    ctaSectionSubtitle: "Join the world's most discerning culinary institutions.",
    ctaSectionPrimaryText: "Request a Demo",
    ctaSectionSecondaryText: "View Pricing",
    footerCopyright: "© 2026 DinePOS AI Hospitality Systems",
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
    starterFeatures: "Digital Menu System, Tablet Ordering, POS Billing System, Kitchen Display System (KDS), Order Management, Sales Reports, 1 Restaurant Location, Up to 5 Staff Accounts",
    growthFeatures: "Everything in Starter, AI Upsell Engine, Smart Combo Suggestions, Inventory Management, Stock Alerts, Staff Management, Advanced Analytics, Customer Insights",
    premiumFeatures: "Everything in Growth, Multi-Branch Management, Central Dashboard, Role-Based Permissions, Priority Support, API Access, Advanced AI Personalization, Unlimited Staff Accounts",
    starterName: "Starter",
    starterLabel: "Starter Package",
    starterButtonText: "Choose Starter",
    growthName: "Growth",
    growthLabel: "Growth Package",
    growthButtonText: "Choose Growth",
    premiumName: "Business",
    premiumLabel: "Business Package",
    premiumButtonText: "Choose Business",
    popularBadgeText: "Popular Choice",
    savePercentBadgeText: "Save 20%",
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
    kbTitle: "Knowledge Base",
    kbSubtitle: "Detailed guides and solutions for common operational queries.",
    kbButtonText: "View All Articles",
    kb1Title: "Menu Engineering",
    kb1Desc: "Best practices for updating pricing and modifier groups during active service safely without disrupting open tickets.",
    kb1Icon: "restaurant_menu",
    kb2Title: "Offline Operations",
    kb2Desc: "Maintaining seamless order flow and local print routing during temporary network interruptions or ISP outages.",
    kb2Icon: "wifi_off",
    kb3Title: "Access Permissions",
    kb3Desc: "Configuring granular access levels for management, servers, and kitchen staff across all POS terminals.",
    kb3Icon: "manage_accounts",
    formTitle: "Direct Inquiry",
    formEstPlaceholder: "e.g. The French Laundry",
    formNamePlaceholder: "Your Name",
    formEmailPlaceholder: "contact@restaurant.com",
    formMsgPlaceholder: "How can our concierge assist you today?",
    formButtonText: "Submit Request",
    portalTitle: "Ticket Portal",
    portalDesc: "Track your submitted requests and view resolution history.",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Common questions about DinePOS AI services and network replication.",
  },
  partners: {
    title: "Global Alliance Network",
    subtitle: "Synergistic integrations and certified implementation groups for DinePOS AI.",
    intro: "We collaborate with premier hospitality technology providers, payment processing leaders, and supply chain managers to deliver a unified enterprise management ecosystem.",
    partner1Name: "Olo & Deliverect",
    partner1Desc: "Full menu syndication and direct-to-pass delivery ingestion pipelines, eliminating double tablet management.",
    partner2Name: "Stripe Enterprise",
    partner2Desc: "Global unified payments gateway with robust chip reader support, instant settlements, and secure fraud protection.",
    step1Title: "1. Share Your Code",
    step1Desc: "Register as a partner, add your bank details for payouts, and copy your custom invite link. No upfront commitments, no fees.",
    step2Title: "2. Venues Register",
    step2Desc: "When a restaurant signs up using your code, you instantly see who joined, when, and what services they activated on your live dashboard.",
    step3Title: "3. Get Paid",
    step3Desc: "Earn {rewardPerSignup} per onboarded business plus {commissionRate}% commission. Paid directly to your bank once you hit the {minPayoutThreshold} threshold.",
    testimonialQuote: "As a culinary consultant, I suggest DinePOS to every fine-dining restaurant I work with. The onboarding is incredibly smooth, and the payout system ensures I am rewarded transparently for helping businesses find the right tools.",
    testimonialAuthor: "Eric Ripert • Chef & DinePOS Ambassador",
    allianceTitle: "Certified Platform Alliances",
    allianceSubtitle: "DinePOS AI integrates with best-of-breed enterprise services to orchestrate your entire restaurant workflow.",
    payoutPolicies: "Rewards accumulate when a referred merchant completes their registration using your code.,Flat reward per signup: {rewardPerSignup} per establishment.,Commission on first payment: {commissionRate}% of the referred tenant's first subscription payment.,Minimum payout threshold: {minPayoutThreshold}. Admin processes transfers within 3 business days.,Cookie tracking window: {cookieDuration} days — referral attribution is maintained for returning visitors.",
    regTitle: "Join the Ambassador Network",
    regSubtitle: "Fill in your details and payout bank accounts to start earning.",
  },
  auth: {
    loginTitle: "Enter the Enterprise Console",
    loginSubtitle: "Welcome back. Access global site metrics, billing details, and terminal operations.",
    signupTitle: "Join the Fine Dining Ecosystem",
    signupSubtitle: "Deploy DinePOS AI. Create your enterprise tenant profile below.",
    loginPageTitle: "DinePOS AI",
    signupPageTitle: "DinePOS AI",
    loginRoleLabel: "SELECT OPERATIONAL ROLE",
    loginEmailLabel: "EMAIL ADDRESS",
    loginPasswordLabel: "PASSWORD",
    loginRememberMe: "Remember this device",
    loginForgotPassword: "Forgot Password?",
    loginButtonText: "Sign In",
    loginDemoTitle: "Quick Demo Access",
    loginFooter: "Secure operational gateway · Authorized personnel only",
    signupLeftEyebrow: "Enterprise Hospitality Suite",
    signupLeftTitle: "The Art of Modern Hospitality.",
    signupLeftDesc: "Precision tools built for high-end culinary environments. Reduce operational friction and let your team focus on what matters — the guest.",
    signupRightEyebrow: "Free Trial — 14 Days",
    signupButtonText: "Get Started — It's Free",
    signupFooter: "© 2026 DinePOS AI Hospitality Systems",
  },
  legal: {
    termsTitle: "Terms of Service",
    termsSubtitle: "Intelligent Hospitality Systems Agreement",
    termsBody1: "At DinePOS AI, we treat the operational security of your establishment with rigorous protocols. We employ AES-256 encryption at rest and TLS 1.3 for all data in transit.",
    privacyTitle: "Privacy Policy",
    privacySubtitle: "Intelligent Hospitality Systems Data Governance",
    privacyBody1: "At DinePOS AI, we treat the data of your establishment and your patrons with the highest level of security protocols available in the hospitality sector. We employ AES-256 encryption at rest and TLS 1.3 for all data in transit. Your operational data remains entirely sovereign; we act solely as processors.",
    termsIntro: "Welcome to DinePOS AI Hospitality Systems. These Terms and Conditions govern your access to and use of our point-of-sale, kitchen display systems, and broader hospitality management platforms. By accessing or using our services, you agree to be bound by these terms. If you do not agree to all the terms and conditions, then you may not access the services.",
    termsUsage1: "You agree to use the DinePOS AI platforms solely for your internal business operations within the hospitality sector. You shall not license, sublicense, sell, resell, transfer, assign, distribute, or otherwise commercially exploit or make available to any third party the Service in any way.",
    termsUsage2: "Users are strictly prohibited from attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service. Operational screens (KDS/POS) must be maintained in environments consistent with hardware specifications to ensure optimal high-contrast legibility and functional uptime.",
    termsSub1: "Access to the DinePOS AI suite is provided on a subscription basis. Fees are billed in advance on a recurring schedule as determined by your selected service tier.",
    termsSub2: "Failure to maintain active payment methods may result in immediate suspension of POS and KDS operational screens to protect system resources. Reinstatement requires clearing all outstanding balances.",
    termsLiability1: "DinePOS AI Hospitality Systems shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.",
    termsLiability2: "Our total liability for all claims related to the Service shall not exceed the total amount paid by you to us for the Service during the twelve (12) months preceding the claim.",
    privacySovereignty2: "Our AI models are trained on anonymized, aggregated datasets. Specific patron identifiers, payment details, and proprietary recipes are never ingested into global training environments without explicit, opt-in enterprise agreements.",
    privacyCollection: "Transactional Point-of-Sale records, Patron reservation & preference metrics, Staff interaction and terminal logs, AI-driven predictive inventory telemetry",
    privacyCompliance: "Right to access and erasure (Right to be forgotten), Strict data processing agreements (DPAs), Automated compliance reporting for franchisees, Zero-knowledge proof architecture for sensitive fields",
    privacyThirdParty: "DinePOS AI integrates seamlessly with leading delivery aggregators, CRM platforms, and payment gateways. Data shared with these entities is strictly limited to the necessary operational scope. We require all third-party vendors to adhere to our stringent 'Aura Protocol' data standards before integration is authorized.",
  },
};

export const getCmsConfig = (): CmsConfig => {
  if (typeof window === 'undefined') return defaultCmsConfig;
  try {
    const stored = localStorage.getItem('dinepos_cms_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      
      const mergeSection = <T extends object>(defaultSection: T, parsedSection: any): T => {
        const result = { ...defaultSection };
        if (!parsedSection) return result;
        for (const key of Object.keys(defaultSection) as Array<keyof T>) {
          const val = parsedSection[key];
          if (val !== undefined && val !== null && val !== '') {
            result[key] = val;
          }
        }
        return result;
      };

      return {
        homepage: mergeSection(defaultCmsConfig.homepage, parsed.homepage),
        pricing: mergeSection(defaultCmsConfig.pricing, parsed.pricing),
        support: mergeSection(defaultCmsConfig.support, parsed.support),
        partners: mergeSection(defaultCmsConfig.partners, parsed.partners),
        auth: mergeSection(defaultCmsConfig.auth, parsed.auth),
        legal: mergeSection(defaultCmsConfig.legal, parsed.legal),
      };
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
