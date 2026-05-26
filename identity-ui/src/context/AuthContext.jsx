import { createContext, useContext, useState, useEffect, useCallback } from "react";
import AuthService from "../services/auth.service";
import TokenService from "../services/token.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(TokenService.getUser);
  const [loading, setLoading] = useState(false);

  // Listen for forced logout (refresh token expired)
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const u = await AuthService.login(email, password);
      setUser(u);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      await AuthService.register(name, email, password);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await AuthService.logout();
    setUser(null);
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await AuthService.getMe();
      TokenService.saveUser(u);
      setUser(u);
    } catch {
      // token invalid — don't crash
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
