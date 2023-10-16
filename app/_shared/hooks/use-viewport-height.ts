import { useEffect } from 'react';

let timeout: ReturnType<typeof setTimeout> | null = null;

const useViewportHeight = () => {
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight / 100;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const onOrientationChange = () => setViewportHeight();

    const onResize = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(setViewportHeight, 250);
    };

    window.addEventListener('orientationchange', onOrientationChange);
    window.addEventListener('resize', onResize);

    setViewportHeight();

    return () => {
      window.removeEventListener('orientationchange', onOrientationChange);
      window.removeEventListener('resize', onResize);
    };
  }, []);
};

export { useViewportHeight };
