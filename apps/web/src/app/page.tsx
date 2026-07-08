import React from 'react';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Zap, MonitorPlay, Wifi, BarChart3, Users, ChefHat } from 'lucide-react';
import styles from './Home.module.css';

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>New: DinePosAI Version 1.0 is Live</div>
          <h1 className={styles.title}>
            The Operating System for <br/>
            <span className={styles.titleHighlight}>Modern Restaurants</span>
          </h1>
          <p className={styles.subtitle}>
            Fast like a drive-thru, clean like modern SaaS. DinePosAI gives you the tools to run your restaurant seamlessly from the front-of-house POS to the Kitchen Display System.
          </p>
          <div className={styles.heroActions}>
            <Button size="lg">Start Free Trial</Button>
            <Button variant="secondary" size="lg">Book a Demo</Button>
          </div>
        </div>
        
        <div className={styles.mockupContainer}>
          <div className={styles.mockupImagePlaceholder}>
            {/* The ::after pseudo-element creates a fake browser/app header */}
            <div style={{ marginTop: '40px' }}>POS Dashboard Interface Mockup</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need to scale</h2>
          <p className={styles.sectionSubtitle}>
            Built specifically for high-volume restaurants that need reliability and speed.
          </p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Zap size={24} />
            </div>
            <h3 className={styles.featureTitle}>Lightning Fast POS</h3>
            <p className={styles.featureText}>
              Tablet-first design with 1-tap ordering and zero-delay feedback. Built to handle rush hour without breaking a sweat.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ChefHat size={24} />
            </div>
            <h3 className={styles.featureTitle}>Smart KDS</h3>
            <p className={styles.featureText}>
              Real-time order flow to keep your kitchen organized. Move tickets from New to Cooking to Ready with a single tap.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Wifi size={24} />
            </div>
            <h3 className={styles.featureTitle}>Offline Resilient</h3>
            <p className={styles.featureText}>
              Never lose a sale. Advanced local queueing ensures you stay operational and automatically syncs when the internet returns.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <MonitorPlay size={24} />
            </div>
            <h3 className={styles.featureTitle}>Digital Menu</h3>
            <p className={styles.featureText}>
              Let customers browse and order directly from their tables. Complete with AI-powered upsell recommendations.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <BarChart3 size={24} />
            </div>
            <h3 className={styles.featureTitle}>Advanced Analytics</h3>
            <p className={styles.featureText}>
              Track gross sales, net revenue, and top-selling items in real-time from your centralized manager dashboard.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Users size={24} />
            </div>
            <h3 className={styles.featureTitle}>Role-Based Access</h3>
            <p className={styles.featureText}>
              Granular permissions for Cashiers, Kitchen Staff, and Managers. Keep your data secure while empowering your team.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to upgrade your restaurant?</h2>
          <p className={styles.ctaText}>
            Join hundreds of modern restaurants using DinePosAI to serve customers faster and grow their margins.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
            <Button size="lg" style={{ backgroundColor: 'white', color: 'var(--color-primary-dark)' }}>
              Start 7-Day Free Trial
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
