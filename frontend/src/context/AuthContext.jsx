

import { createContext, useState } from "react";
import api from "../services/api";
/* eslint-disable react-refresh/only-export-components */


export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(fullName, email, password) {
    const { data } = await api.post("/auth/register", {
      fullName,
      email,
      password,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  function updateUserInStorage(updatedUser) {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUserInStorage }}
    >
      {children}
    </AuthContext.Provider>
  );
}
