import '@/_shared/styles/tailwind.css';
import { Inter } from 'next/font/google';
import { MixpanelContainer } from '@/_shared/components/analytics/mixpanel';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

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
