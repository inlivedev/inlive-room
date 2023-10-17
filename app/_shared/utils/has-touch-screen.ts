export const hasTouchScreen = () => {
  let hasTouchScreen = false;

  if (typeof window === 'undefined') return hasTouchScreen;

  if ('maxTouchPoints' in navigator) {
    hasTouchScreen = navigator.maxTouchPoints > 0;
  } else if ('msMaxTouchPoints' in navigator) {
    hasTouchScreen = navigator['msMaxTouchPoints'] > 0;
  } else {
    const mediaQuery = matchMedia?.('(pointer:coarse)');
    if (mediaQuery?.media === '(pointer:coarse)') {
      hasTouchScreen = !!mediaQuery.matches;
    } else if ('orientation' in window) {
      hasTouchScreen = true; // deprecated, but good fallback
    } else {
      const UA = navigator['userAgent'];
      hasTouchScreen =
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
        /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
    }
  }

  return hasTouchScreen;
};
