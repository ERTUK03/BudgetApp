import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userJson = await SecureStore.getItemAsync("user");
        if (userJson) setUser(JSON.parse(userJson));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    await SecureStore.setItemAsync("token", data.access_token);
    await SecureStore.setItemAsync("user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (email, username, password) => {
    const data = await api.auth.register(email, username, password);
    await SecureStore.setItemAsync("token", data.access_token);
    await SecureStore.setItemAsync("user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
