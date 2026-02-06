import axios from "axios";

const getBaseURL = () => {
  const host = window.location.hostname;

  if (host.includes("kanjiquejewels.com")) {
    return "https://api.kanjiquejewels.com";
  }

  // Local dev (both localhost & 127.0.0.1)
  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");

      // ❗ IMPORTANT FIX — don't redirect on /me failure
      if (!error.config.url.includes("/auth/me")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
