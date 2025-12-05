// src/config/api.ts

/**
 * Global API Configuration.
 * Centralizes environment variable access to avoid typos and ensure type safety.
 */
export const API_CONFIG = {
    // Base URL for the Laravel API
    baseURL: import.meta.env.VITE_API_DOMAIN || 'http://localhost:8000',

    // Authentication Key
    apiKey: import.meta.env.VITE_API_KEY || '',

    // Environment mode
    env: import.meta.env.VITE_APP_ENV || 'development',

    // Timeout for requests (in milliseconds)
    timeout: 30000,
};

// Simple validation to ensure we don't run without critical config
if (!API_CONFIG.baseURL) {
    console.warn('⚠️ API_DOMAIN is not defined in your .env file');
}