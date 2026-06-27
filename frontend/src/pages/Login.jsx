import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

function validate({ email, password }) {
    if (!email) return "Email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Enter a valid email";
    if (!password) return "Password is required";
    return null;
}

export default function Login() {
    const { signIn } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const next = new URLSearchParams(loc.search).get("next") || ROUTES.home;
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        const v = validate(form);
        if (v) { setError(v); return; }
        setError(null); setBusy(true);
        try {
            await signIn(form.email.trim(), form.password);
            nav(next, { replace: true });
        } catch (err) {
            setError(err?.response?.data?.detail || "Login failed");
        } finally { setBusy(false); }
    };

    return (
        <div data-testid="login-page" className="cv-container cv-section flex justify-center">
            <form onSubmit={submit} className="cv-card w-full max-w-md p-8" data-testid="login-form">
                <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="mt-2 text-sm text-muted-foreground">Sign in to continue your CareerVerse journey.</p>
                <label className="mt-8 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email</label>
                <input type="email" autoComplete="email" data-testid="login-email"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="cv-focus mt-2 w-full rounded-xl border border-border bg-card px-4 py-3"/>
                <label className="mt-5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Password</label>
                <input type="password" autoComplete="current-password" data-testid="login-password"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="cv-focus mt-2 w-full rounded-xl border border-border bg-card px-4 py-3"/>
                {error && <p data-testid="login-error" className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={busy} data-testid="login-submit"
                    className="cv-focus mt-6 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background disabled:opacity-60">
                    {busy ? "Signing in…" : "Sign in"}
                </button>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    New here?{" "}
                    <Link to={ROUTES.register} data-testid="login-to-register" className="font-semibold text-ai hover:underline">Create an account</Link>
                </p>
            </form>
        </div>
    );
}
