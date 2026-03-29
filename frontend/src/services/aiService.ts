import API_BASE_URL, { apiFetch } from "../config/api";

export async function predictRisk(driver: any) {
  const response = await apiFetch(`${API_BASE_URL}/predict-risk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(driver),
  });
  return response.json();
}

export async function getFeatureImportance() {
  const response = await apiFetch(`${API_BASE_URL}/feature-importance`);
  const data = await response.json();
  return data.feature_importance;
}