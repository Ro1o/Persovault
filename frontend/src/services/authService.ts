export interface User {
  username: string;
  role: "admin" | "driver" | "police";
}

const API_URL = "http://localhost:8000";

/* LOGIN */

export async function login(
  username: string,
  password: string,
  role: "admin" | "driver" | "police"
): Promise<User | null> {

  try {

    const response = await fetch(`${API_URL}/login`, {
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

  const response = await fetch(`${API_URL}/signup`, {
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

  const user = localStorage.getItem("user");

  if (!user) return null;

  return JSON.parse(user);
}

/* LOGOUT */

export function logout() {
  localStorage.removeItem("user");
}