import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/landing/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Intellect — Where Great Minds Discuss, Debate & Appreciate',
  description: 'AI-powered intellectual debate platform. Start or join debates, earn reputation, grow.',
  manifest: '/manifest.json',
  themeColor: '#0f0d0b',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Intellect',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="dark">
        <body>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
