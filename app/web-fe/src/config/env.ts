const rawUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';
const cleanUrl = rawUrl.replace(/\/$/, '');
const apiBaseUrl = cleanUrl === '' ? '/api' : (cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`);

export const env = {
    apiBaseUrl
} as const;