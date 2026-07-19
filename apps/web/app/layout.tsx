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
    <html lang="en" className={`dark scroll-smooth ${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
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
                      console.warn("[Hydration Overruled]", ...args);
                      return;
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

            const handleClean = (root) => {
              if (!root) return;
              const icons = root.getElementsByClassName('material-symbols-outlined');
              for (let i = 0; i < icons.length; i++) {
                const icon = icons[i];
                if (!icon.classList.contains('notranslate')) {
                  icon.classList.add('notranslate');
                }
                icon.setAttribute('translate', 'no');
              }
              if (root.removeAttribute) {
                if (root.hasAttribute && root.hasAttribute('bis_skin_checked')) {
                  root.removeAttribute('bis_skin_checked');
                }
                const badDivs = root.querySelectorAll ? root.querySelectorAll('[bis_skin_checked]') : [];
                for (let i = 0; i < badDivs.length; i++) {
                  badDivs[i].removeAttribute('bis_skin_checked');
                }
              }
            };

            const observer = new MutationObserver((mutations) => {
              for (let i = 0; i < mutations.length; i++) {
                const mutation = mutations[i];
                for (let j = 0; j < mutation.addedNodes.length; j++) {
                  const node = mutation.addedNodes[j];
                  if (node.nodeType === 1) {
                    handleClean(node);
                  }
                }
              }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });

            const setup = () => {
              handleClean(document.body);
            };

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', setup);
            } else {
              setup();
            }
          })();
        ` }} />
      </head>
      <body className="bg-surface-container-lowest text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col" suppressHydrationWarning>
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

