const getWindowOrigin = () => {
  if (typeof window === "undefined") {
    return "https://marico-insight-safe.vercel.app";
  }
  return window.location.origin;
};

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? getWindowOrigin() : "http://localhost:3002");


