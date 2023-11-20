'use client';
import mixpanel, { Dict, Query } from 'mixpanel-browser';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const IS_PROD = process.env.NEXT_PUBLIC_APP_ENV === 'production';
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '';

if (typeof window !== 'undefined' && IS_PROD) {
  mixpanel.init(MIXPANEL_TOKEN, { debug: !IS_PROD });
}

export const Mixpanel = {
  identify: (id: string) => {
    if (IS_PROD) {
      mixpanel.identify(id);
    }
  },
  track: (name: string, props?: Dict) => {
    if (IS_PROD) {
      mixpanel.track(name, props);
    }
  },
  trackLinks: (query: Query, name: string) => {
    if (IS_PROD) {
      mixpanel.track_links(query, name, {
        referrer: document.referrer,
      });
    }
  },
  people: {
    set: (props: Dict) => {
      if (IS_PROD) {
        mixpanel.people.set(props);
      }
    },
  },
};

const useNavigationChangeTrack = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      ) as HTMLMetaElement;

      Mixpanel.track('Open page', {
        title: document.title || '-',
        description: metaDescription?.content || '-',
      });
    }
  }, [pathname, searchParams]);
};

export const MixpanelContainer = () => {
  useNavigationChangeTrack();

  return <></>;
};
