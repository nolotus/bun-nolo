export const isBrowser = typeof window !== 'undefined';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const currentDomain = isDevelopment
  ? 'localhost'
  : window.location.port
  ? `${window.location.hostname}:${window.location.port}`
  : `${window.location.hostname}`;
