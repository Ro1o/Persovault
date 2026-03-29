import API_BASE_URL from "../config/api";

export interface User {
  username: string;
  role: "admin" | "driver" | "police";
}

/* LOGIN */

export async function login(
  username: string,
  password: string,
  role: "admin" | "driver" | "police"
): Promise<User | null> {

  try {

    const response = await apiFetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password,
        role
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const session: User = {
      username: data.username,
      role: data.role
    };

    localStorage.setItem("user", JSON.stringify(session));

    return session;

  } catch (error) {

    console.error("Login failed", error);
    return null;

  }
}

/* SIGNUP */

export async function signup(userData: any) {

  const response = await apiFetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  return response.ok;
}

/* GET CURRENT USER */

export function getCurrentUser(): User | null {

  const stored =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!stored) return null;

  return JSON.parse(stored);
}

/* LOGOUT */

export function logout() {
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
}