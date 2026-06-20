import './globals.css';
import type { Metadata } from 'next';
import { PrinterProvider } from './printerContext';

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
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            const setup = () => {
              const handleIcons = (root) => {
                if (!root) return;
                const icons = root.getElementsByClassName('material-symbols-outlined');
                for (let i = 0; i < icons.length; i++) {
                  const icon = icons[i];
                  if (!icon.classList.contains('notranslate')) {
                    icon.classList.add('notranslate');
                  }
                  icon.setAttribute('translate', 'no');
                }
              };
              
              handleIcons(document.body);
              
              const observer = new MutationObserver((mutations) => {
                for (let i = 0; i < mutations.length; i++) {
                  const mutation = mutations[i];
                  for (let j = 0; j < mutation.addedNodes.length; j++) {
                    const node = mutation.addedNodes[j];
                    if (node.nodeType === 1) {
                      if (node.classList && node.classList.contains('material-symbols-outlined')) {
                        if (!node.classList.contains('notranslate')) {
                          node.classList.add('notranslate');
                        }
                        node.setAttribute('translate', 'no');
                      }
                      handleIcons(node);
                    }
                  }
                }
              });
              
              if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
              }
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
        <PrinterProvider>
          {children}
        </PrinterProvider>
      </body>
    </html>
  );
}

