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
        <PrinterProvider>
          {children}
        </PrinterProvider>
      </body>
    </html>
  );
}

