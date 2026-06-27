import { createContext, useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/services/api";

const STORAGE_KEY = "careerverse:auth";
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw).token : null;
        } catch { return null; }
    });
    const [status, setStatus] = useState(token ? "loading" : "guest");

    useEffect(() => {
        if (token) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common.Authorization;
        }
    }, [token]);

    useEffect(() => {
        if (!token) { setUser(null); setStatus("guest"); return; }
        api.get("/auth/me")
            .then((r) => { setUser(r.data); setStatus("authed"); })
            .catch(() => {
                window.localStorage.removeItem(STORAGE_KEY);
                setToken(null); setUser(null); setStatus("guest");
            });
    }, [token]);

    const persist = useCallback((tok, u) => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: tok }));
        setToken(tok); setUser(u); setStatus("authed");
    }, []);

    const signIn = useCallback(async (email, password) => {
        const r = await api.post("/auth/login", { email, password });
        persist(r.data.token, r.data.user);
        return r.data.user;
    }, [persist]);

    const signUp = useCallback(async (name, email, password) => {
        const r = await api.post("/auth/register", { name, email, password });
        persist(r.data.token, r.data.user);
        return r.data.user;
    }, [persist]);

    const signOut = useCallback(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setToken(null); setUser(null); setStatus("guest");
    }, []);

    const value = useMemo(() => ({ user, token, status, signIn, signUp, signOut }),
        [user, token, status, signIn, signUp, signOut]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
