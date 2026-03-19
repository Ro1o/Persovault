import API_BASE_URL from "../config/api";

export async function getAnalytics() {
  const response = await fetch(`${API_BASE_URL}/analytics`);
  return response.json();
}