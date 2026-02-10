import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // If user was previously logged in, don't set loading to true
    // This prevents unnecessary redirects
    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
          api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
        }

        const res = await api.get("/api/auth/me", { timeout: 5000 });
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (err) {
        // User is not authenticated, clear stored data
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  const login = async (form) => {
    const { data } = await api.post("/api/auth/login", form);

    // If backend returned a token (fallback for cross-site cookie issues),
    // store it and attach to axios defaults so subsequent calls (including
    // /api/auth/me) will succeed via Authorization header.
    if (data?.token) {
      localStorage.setItem("token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    }

    // Verify server-side session/cookie (or token) by calling /me. Only set
    // client auth when /me confirms the user.
    try {
      const meRes = await api.get("/api/auth/me");
      setUser(meRes.data.user);
      localStorage.setItem("user", JSON.stringify(meRes.data.user));
      return meRes.data.user;
    } catch (err) {
      // If /me fails, clear any client-side state (including fallback token)
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
