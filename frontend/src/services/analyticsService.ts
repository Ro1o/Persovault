import API_BASE_URL from "../config/api";

export async function getAnalytics() {
  const response = await apiFetch(`${API_BASE_URL}/analytics`);
  return response.json();
}