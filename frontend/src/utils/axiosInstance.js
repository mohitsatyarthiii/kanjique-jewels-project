import axios from "axios";

const getBaseURL = () => {
  const host = window.location.hostname;

  if (host.includes("kanjiquejewels.com")) {
    return "https://api.kanjiquejewels.com";
  }

  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");

      if (!error.config.url.includes("/auth/me")) {
        window.location.href = "/admin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
