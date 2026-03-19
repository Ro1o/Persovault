export async function predictRisk(driver: any) {

  const response = await fetch("http://localhost:8000/predict-risk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(driver)
  });

  return response.json();
}


export async function getFeatureImportance() {

  const response = await fetch("http://localhost:8000/feature-importance", {
    method: "GET"
  });

  const data = await response.json();

  return data.feature_importance;
}