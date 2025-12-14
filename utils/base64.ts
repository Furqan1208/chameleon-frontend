// utils/base64.ts
export function encodeBase64(str: string): string {
  if (typeof window === 'undefined') {
    // Node.js environment
    return Buffer.from(str).toString('base64').replace(/=/g, '');
  } else {
    // Browser environment
    return btoa(str).replace(/=/g, '');
  }
}

export function decodeBase64(str: string): string {
  if (typeof window === 'undefined') {
    // Node.js environment
    return Buffer.from(str, 'base64').toString('utf-8');
  } else {
    // Browser environment
    return atob(str);
  }
}