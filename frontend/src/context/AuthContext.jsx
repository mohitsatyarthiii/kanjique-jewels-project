import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    // Verify server-side session/cookie is set by calling /me.
    // Some environments may not set cookies due to CORS or domain issues;
    // only mark the client authenticated if the server confirms the session.
    try {
      const meRes = await api.get("/api/auth/me");
      setUser(meRes.data.user);
      localStorage.setItem("user", JSON.stringify(meRes.data.user));
      return meRes.data.user;
    } catch (err) {
      // If /me fails, clear any client-side user and surface error to caller
      setUser(null);
      localStorage.removeItem("user");
      throw err;
    }
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
