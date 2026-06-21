import api from "./axiosInstance";

// All routes mounted at /api/v1/auth on the backend

// POST /register - multipart/form-data (avatar optional)
export const registerUser = (formData) =>
  api.post("/auth/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// GET /verify-email?token=...
export const verifyEmail = (token) =>
  api.get(`/auth/verify-email?token=${token}`);

// POST /resend-verification
export const resendVerificationEmail = (email) =>
  api.post("/auth/resend-verification", { email });

// POST /login
export const loginUser = (credentials) =>
  api.post("/auth/login", credentials);

// POST /logout
export const logoutUser = () => api.post("/auth/logout");

// POST /refresh-token
export const refreshToken = () => api.post("/auth/refresh-token");
