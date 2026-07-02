declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

function getEnvVar(key: string, fallback: string): string {
  if (typeof window !== "undefined" && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key];
  }
  if (import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  return fallback;
}

export const env = {
  APP_NAME: getEnvVar("VITE_APP_NAME", "Nuvvi"),
  APP_ENV: getEnvVar("VITE_APP_ENV", "development"),
  API_BASE_URL: getEnvVar("VITE_API_BASE_URL", "http://localhost:8000"),
  API_PREFIX: getEnvVar("VITE_API_PREFIX", "/api"),
  ENABLE_3D: getEnvVar("VITE_ENABLE_3D", "true") === "true",
} as const;

export const API_URL = `${env.API_BASE_URL}${env.API_PREFIX}`;
