import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext({
    theme: "light",
    setTheme: () => {},
    toggleTheme: () => {},
});

const STORAGE_KEY = "careerverse:theme";

function getInitialTheme() {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(getInitialTheme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        root.style.colorScheme = theme;
        window.localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const setTheme = useCallback((next) => setThemeState(next), []);
    const toggleTheme = useCallback(
        () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
        [],
    );

    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
