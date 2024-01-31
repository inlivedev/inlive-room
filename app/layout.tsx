import type { Metadata } from 'next';
import '@/_shared/styles/tailwind.css';
import { Inter } from 'next/font/google';
import { MixpanelContainer } from '@/_shared/components/analytics/mixpanel';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;
const title = 'Virtual room for your real-time collaboration — inLive Room';
const description = `Host or join in seconds. It's that simple! Experience real-time messaging, video, and audio for seamless collaboration, all within open-source virtual rooms.`;
const ogImage = '/images/general-og.png';

export const metadata: Metadata = {
  metadataBase: new URL(`${APP_ORIGIN || ''}`),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
    url: `${APP_ORIGIN}`,
    images: [ogImage],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* charset and viewport are added automatically */}
        <link rel="icon" href="/images/favicon/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/images/favicon/favicon.svg"
          type="image/svg+xml"
        />
        <link
          rel="apple-touch-icon"
          href="/images/favicon/apple-touch-icon.png"
        />
        <link rel="manifest" href="/images/favicon/manifest.webmanifest" />
      </head>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning={true}
      >
        <Suspense fallback={null}>
          <MixpanelContainer />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
