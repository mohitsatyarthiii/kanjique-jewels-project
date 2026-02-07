import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we have a stored token (fallback), attach it to axios defaults so
    // the /me call can succeed even when cookies are not available.
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }

    const fetchMe = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
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

  const signup = async (form) => {
    const { data } = await api.post("/api/auth/signup", form);

    if (data?.token) {
      localStorage.setItem("token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    }

    try {
      const meRes = await api.get("/api/auth/me");
      setUser(meRes.data.user);
      localStorage.setItem("user", JSON.stringify(meRes.data.user));
      return meRes.data.user;
    } catch (err) {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      throw err;
    }
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
