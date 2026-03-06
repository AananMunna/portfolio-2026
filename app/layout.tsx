import type {Metadata} from 'next';
import { Share_Tech_Mono, Syne, Syne_Mono } from 'next/font/google';
import SmoothScroll from '@/components/SmoothScroll';
import './globals.css';

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-share-tech-mono',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
});

const syneMono = Syne_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-syne-mono',
});

export const metadata: Metadata = {
  title: 'Aanan | Front-End Developer',
  description: 'A cutting-edge front-end developer portfolio',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${shareTechMono.variable} ${syne.variable} ${syneMono.variable}`}>
      <body suppressHydrationWarning>
        <SmoothScroll>
          <div className="noise-bg"></div>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
