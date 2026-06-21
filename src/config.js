// Single source of truth for the backend's base URL.
//
// In development, Vite loads .env.development (or .env.local) automatically.
// In production (Vercel), set VITE_API_BASE_URL in the project's Environment
// Variables settings to your deployed backend's URL.
//
// Falls back to localhost:3000 so local dev keeps working even if no .env
// file is present yet.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Convenience: the versioned API root used by every endpoint.
export const API_V1_URL = `${API_BASE_URL}/api/v1`;
