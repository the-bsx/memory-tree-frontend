import axios from "axios";
import { API_V1_URL } from "../config";

const api = axios.create({
  baseURL: API_V1_URL,
  withCredentials: true, // sends httpOnly refresh token cookie automatically
});

// Attach access token from memory to every request
api.interceptors.request.use((config) => {
  const token = window.__accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If 401, try to refresh token once then retry the original request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await axios.post(
          `${API_V1_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        window.__accessToken = res.data.data.accessToken;
        original.headers.Authorization = `Bearer ${window.__accessToken}`;
        return api(original);
      } catch (refreshError) {
        // Don't force-navigate here. Just clear the token and tell
        // AuthContext the session is dead — it owns the `user` state,
        // and ProtectedRoute will redirect to /login reactively.
        window.__accessToken = null;
        window.dispatchEvent(new Event("session-expired"));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
