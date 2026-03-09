type RuntimeConfig = {
  apiBaseUrl?: string;
};

const runtimeConfig = (globalThis as typeof globalThis & {
  __APP_CONFIG__?: RuntimeConfig;
}).__APP_CONFIG__;

const localhostApi = 'http://localhost:4000/api/v1';

export const API_BASE_URL =
  runtimeConfig?.apiBaseUrl ??
  (globalThis.location.hostname === 'localhost' ? localhostApi : '/api/v1');