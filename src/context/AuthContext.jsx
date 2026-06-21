import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, logoutUser, refreshToken as refreshTokenApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check existing session

  // On app load, try to silently refresh using the httpOnly cookie.
  // If it succeeds, the user is still logged in from a previous visit.
  useEffect(() => {
    const tryRestoreSession = async () => {
      try {
        const res = await refreshTokenApi();
        window.__accessToken = res.data.data.accessToken;
        setUser(res.data.data.user ?? null);
      } catch {
        window.__accessToken = null;
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    tryRestoreSession();

    // If any request elsewhere discovers the session is dead (refresh
    // failed inside the axios interceptor), clear user state here too —
    // this is what lets ProtectedRoute redirect without a hard reload.
    const handleSessionExpired = () => setUser(null);
    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    window.__accessToken = res.data.data.accessToken;
    setUser(res.data.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      window.__accessToken = null;
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
