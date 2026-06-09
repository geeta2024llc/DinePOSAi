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
      </head>
      <body className="bg-surface-container-lowest text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col" suppressHydrationWarning>
        <PrinterProvider>
          {children}
        </PrinterProvider>
      </body>
    </html>
  );
}

