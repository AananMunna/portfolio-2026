import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import ClickSound from '@/components/ClickSound';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false, // only used for small labels, so don't block first paint
});

export const metadata: Metadata = {
  title: { default: 'Aanan Munna | Full Stack Developer', template: '%s | Aanan Munna' },
  description:
    'Full Stack Developer building production SaaS, marketplace and logistics platforms with Next.js, React, Node.js, PostgreSQL and MongoDB.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicon-180x180.png',
  },
};

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fbfbfd',
};

// Always start in light mode, whatever the device prefers. Dark only if the
// visitor switched to it earlier in this browser session.
const themeScript = `try{if(sessionStorage.getItem("theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <CustomCursor />
        <ClickSound />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
