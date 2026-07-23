import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from './authContext';
import { PrinterProvider } from './printerContext';
import { PostHogProvider } from './providers';
import DemoBanner from '@/components/DemoBanner';

const playfair = { variable: 'font-serif' };
const inter = { variable: 'font-sans' };

export const metadata: Metadata = {
  title: 'DinePOS AI - Modern Hospitality Systems',
  description: 'Precision tools crafted for high-end culinary environments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark scroll-smooth ${playfair.variable} ${inter.variable}`} suppressHydrationWarning data-gramm="false" data-grammarly-disable="true">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0e0e0d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              let currentError = console.error;
              Object.defineProperty(console, 'error', {
                get() {
                  return function(...args) {
                    const message = args.map(arg => {
                      try {
                        return typeof arg === 'string' ? arg : JSON.stringify(arg);
                      } catch (e) {
                        return String(arg);
                      }
                    }).join(' ');

                    if (
                      message.includes('hydration') || 
                      message.includes('Hydration') || 
                      message.includes('bis_skin_checked') || 
                      message.includes('notranslate') ||
                      message.includes('translate="no"')
                    ) {
                      return; // Silently suppress browser extension hydration attribute warnings
                    }
                    if (currentError) {
                      currentError.apply(console, args);
                    }
                  };
                },
                set(newVal) {
                  currentError = newVal;
                },
                configurable: true
              });
            } catch (e) {}

            try {
              const originalSet = Element.prototype.setAttribute;
              Element.prototype.setAttribute = function(name, value) {
                if (name === 'bis_skin_checked') return;
                originalSet.apply(this, arguments);
              };
              
              const originalSetNS = Element.prototype.setAttributeNS;
              Element.prototype.setAttributeNS = function(ns, name, value) {
                if (name === 'bis_skin_checked') return;
                originalSetNS.apply(this, arguments);
              };

              const originalSetNode = Element.prototype.setAttributeNode;
              Element.prototype.setAttributeNode = function(attr) {
                if (attr && attr.name === 'bis_skin_checked') return null;
                return originalSetNode.apply(this, arguments);
              };

              const originalSetNodeNS = Element.prototype.setAttributeNodeNS;
              Element.prototype.setAttributeNodeNS = function(attr) {
                if (attr && attr.name === 'bis_skin_checked') return null;
                return originalSetNodeNS.apply(this, arguments);
              };

              if (Element.prototype.toggleAttribute) {
                const originalToggle = Element.prototype.toggleAttribute;
                Element.prototype.toggleAttribute = function(name, force) {
                  if (name === 'bis_skin_checked') return false;
                  return originalToggle.apply(this, arguments);
                };
              }

              const originalSetNamedItem = NamedNodeMap.prototype.setNamedItem;
              NamedNodeMap.prototype.setNamedItem = function(attr) {
                if (attr && attr.name === 'bis_skin_checked') return null;
                return originalSetNamedItem.apply(this, arguments);
              };

              const originalSetNamedItemNS = NamedNodeMap.prototype.setNamedItemNS;
              NamedNodeMap.prototype.setNamedItemNS = function(attr) {
                if (attr && attr.name === 'bis_skin_checked') return null;
                return originalSetNamedItemNS.apply(this, arguments);
              };
            } catch (e) {}

            // Register Service Worker for offline PWA caching
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  console.log('[SW] Registered successfully for scope:', reg.scope);
                }).catch(function(err) {
                  console.warn('[SW] Registration failed:', err);
                });
              });
            }
          })();
        ` }} />
      </head>
      <body className="bg-surface-container-lowest text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col" suppressHydrationWarning data-gramm="false" data-grammarly-disable="true">
        <PostHogProvider>
          <AuthProvider>
            <PrinterProvider>
              {children}
              <DemoBanner />
            </PrinterProvider>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}

