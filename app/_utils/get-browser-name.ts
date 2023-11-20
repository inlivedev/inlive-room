export const CHROME = 'Chrome',
  FIREFOX = 'Firefox',
  SAFARI = 'Safari',
  OPERA = 'Opera',
  IE = 'IE',
  EDGE = 'Edge';

export const getBrowserName = () => {
  if (
    navigator.userAgent.indexOf(CHROME) > -1 &&
    navigator.userAgent.indexOf(EDGE) > -1
  )
    return EDGE;
  if (
    navigator.userAgent.indexOf(CHROME) > -1 &&
    navigator.userAgent.indexOf(OPERA) > -1
  )
    return OPERA;
  if (navigator.userAgent.indexOf(CHROME) > -1) return CHROME;
  if (navigator.userAgent.indexOf(FIREFOX) > -1) return FIREFOX;
  if (navigator.userAgent.indexOf(SAFARI) > -1) return SAFARI;
  if (navigator.userAgent.indexOf(IE) > -1) return IE;
  return null;
};
