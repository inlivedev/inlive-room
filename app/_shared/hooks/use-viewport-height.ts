import { useEffect } from 'react';

const useViewportHeight = () => {
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight / 100;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('orientationchange', setViewportHeight);

    return () => {
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);
};

export { useViewportHeight };
