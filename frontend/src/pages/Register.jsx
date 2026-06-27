import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

function validate({ name, email, password }) {
    if (!name?.trim()) return "Name is required";
    if (!email) return "Email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Enter a valid email";
    if (!password || password.length < 8) return "Password must be at least 8 characters";
    return null;
}

export default function Register() {
    const { signUp } = useAuth();
    const nav = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        const v = validate(form);
        if (v) { setError(v); return; }
        setError(null); setBusy(true);
        try {
            await signUp(form.name.trim(), form.email.trim(), form.password);
            nav(ROUTES.home, { replace: true });
        } catch (err) {
            setError(err?.response?.data?.detail || "Registration failed");
        } finally { setBusy(false); }
    };

    return (
        <div data-testid="register-page" className="cv-container cv-section flex justify-center">
            <form onSubmit={submit} className="cv-card w-full max-w-md p-8" data-testid="register-form">
                <h1 className="font-display text-3xl font-bold tracking-tight">Create your account</h1>
                <p className="mt-2 text-sm text-muted-foreground">Save careers, take the DNA test, and unlock the AI mentor.</p>
                <label className="mt-8 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Name</label>
                <input data-testid="register-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="cv-focus mt-2 w-full rounded-xl border border-border bg-card px-4 py-3"/>
                <label className="mt-5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email</label>
                <input type="email" autoComplete="email" data-testid="register-email"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="cv-focus mt-2 w-full rounded-xl border border-border bg-card px-4 py-3"/>
                <label className="mt-5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Password</label>
                <input type="password" autoComplete="new-password" data-testid="register-password"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="cv-focus mt-2 w-full rounded-xl border border-border bg-card px-4 py-3"/>
                <p className="mt-1 text-xs text-muted-foreground">Min 8 characters.</p>
                {error && <p data-testid="register-error" className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={busy} data-testid="register-submit"
                    className="cv-focus mt-6 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background disabled:opacity-60">
                    {busy ? "Creating…" : "Create account"}
                </button>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to={ROUTES.login} data-testid="register-to-login" className="font-semibold text-ai hover:underline">Sign in</Link>
                </p>
            </form>
        </div>
    );
}
