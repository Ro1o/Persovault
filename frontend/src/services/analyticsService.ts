export async function getAnalytics() {

const response = await fetch("http://localhost:8000/analytics");

return response.json();

}