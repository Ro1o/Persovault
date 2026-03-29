const API_BASE_URL = "https://unavid-roentgenological-rikki.ngrok-free.dev";
export default API_BASE_URL;

export const apiFetch = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
};