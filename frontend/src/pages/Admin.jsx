import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users, Shield, Ban, Trash2, Eye, X, RefreshCw, Search,
    UserCheck, UserX, MessageSquare, Sparkles,
} from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { ADMIN } from "@/constants/testIds";

function fmtDate(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: "medium", timeStyle: "short",
        });
    } catch { return iso; }
}

function StatCard({ k, label, value, icon: Icon }) {
    return (
        <div data-testid={ADMIN.statsCard(k)} className="cv-card flex items-center gap-3 p-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="font-display text-2xl font-bold leading-tight">{value}</p>
            </div>
        </div>
    );
}

function StatusBadge({ user }) {
    if (user.deletedAt) {
        return <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-destructive">Deleted</span>;
    }
    if (user.bannedAt) {
        return <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-warning-foreground" style={{ backgroundColor: "rgba(234,179,8,0.15)", color: "#854d0e" }}>Banned</span>;
    }
    if (user.role === "admin") {
        return <span className="rounded-full bg-ai/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ai">Admin</span>;
    }
    return <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">User</span>;
}

function UserDrawer({ uid, onClose, onMutated }) {
    const [data, setData] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            const r = await api.get(`/admin/users/${uid}`);
            setData(r.data);
        } catch (e) {
            setError(e?.response?.data?.detail || "Failed to load user");
        }
    }, [uid]);

    useEffect(() => { if (uid) load(); }, [uid, load]);

    if (!uid) return null;

    const doBan = async (banned) => {
        setBusy(true); setError(null);
        try {
            await api.patch(`/admin/users/${uid}/ban`, { banned });
            await load(); onMutated();
        } catch (e) {
            setError(e?.response?.data?.detail || "Action failed");
        } finally { setBusy(false); }
    };

    const doDelete = async () => {
        if (!window.confirm("Soft-delete this user? They will no longer be able to log in.")) return;
        setBusy(true); setError(null);
        try {
            await api.delete(`/admin/users/${uid}`);
            await load(); onMutated();
        } catch (e) {
            setError(e?.response?.data?.detail || "Action failed");
        } finally { setBusy(false); }
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <aside data-testid={ADMIN.drawer}
                className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-border bg-background p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold">User details</h2>
                    <button type="button" onClick={onClose} data-testid={ADMIN.drawerClose}
                        className="cv-focus inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card hover:bg-secondary">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {!data && !error && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
                {error && <p data-testid={ADMIN.error} className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

                {data && (
                    <>
                        <div className="mt-5 space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-display text-2xl font-bold">{data.name}</h3>
                                <StatusBadge user={data} />
                            </div>
                            <p data-testid={ADMIN.drawerEmail} className="text-sm text-muted-foreground">{data.email}</p>
                            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">ID · {data.id}</p>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="cv-card p-3">
                                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Registered</p>
                                <p className="mt-1 text-sm font-medium">{fmtDate(data.createdAt)}</p>
                            </div>
                            <div className="cv-card p-3">
                                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Last login</p>
                                <p className="mt-1 text-sm font-medium">{fmtDate(data.lastLoginAt)}</p>
                            </div>
                            <div className="cv-card p-3">
                                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Mentor sessions</p>
                                <p className="mt-1 text-sm font-medium">{data.mentorSessionCount}</p>
                            </div>
                            <div className="cv-card p-3">
                                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Mentor messages</p>
                                <p className="mt-1 text-sm font-medium">{data.mentorMessageCount}</p>
                            </div>
                        </div>

                        <div data-testid={ADMIN.drawerActivity} className="mt-6">
                            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Recent activity
                            </h4>
                            {data.recentSessions.length === 0 ? (
                                <p className="mt-3 text-sm text-muted-foreground">No mentor conversations yet.</p>
                            ) : (
                                <ul className="mt-3 space-y-2">
                                    {data.recentSessions.map((s) => (
                                        <li key={s.id} className="cv-card p-3">
                                            <p className="text-sm font-medium">{s.title}</p>
                                            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                                {s.messageCount} message{s.messageCount === 1 ? "" : "s"} · {fmtDate(s.updatedAt)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {data.role !== "admin" && !data.deletedAt && (
                            <div className="mt-6 flex flex-col gap-2">
                                {data.bannedAt ? (
                                    <button type="button" onClick={() => doBan(false)} disabled={busy}
                                        data-testid={`${ADMIN.userBanBtn(data.id)}-drawer`}
                                        className="cv-focus inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-50">
                                        <UserCheck className="h-4 w-4" /> Unban user
                                    </button>
                                ) : (
                                    <button type="button" onClick={() => doBan(true)} disabled={busy}
                                        data-testid={`${ADMIN.userBanBtn(data.id)}-drawer`}
                                        className="cv-focus inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-50">
                                        <Ban className="h-4 w-4" /> Ban user
                                    </button>
                                )}
                                <button type="button" onClick={doDelete} disabled={busy}
                                    data-testid={`${ADMIN.userDeleteBtn(data.id)}-drawer`}
                                    className="cv-focus inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50">
                                    <Trash2 className="h-4 w-4" /> Soft delete
                                </button>
                            </div>
                        )}
                    </>
                )}
            </aside>
        </>
    );
}

export default function Admin() {
    const auth = useAuth();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [q, setQ] = useState("");
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [drawerId, setDrawerId] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const isAdmin = auth?.status === "authed" && auth.user?.role === "admin";

    const fetchAll = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const params = new URLSearchParams();
            if (q.trim()) params.set("q", q.trim());
            if (includeDeleted) params.set("include_deleted", "true");
            const [u, s] = await Promise.all([
                api.get(`/admin/users?${params.toString()}`),
                api.get("/admin/stats"),
            ]);
            setUsers(u.data.users);
            setStats(s.data);
        } catch (e) {
            setError(e?.response?.data?.detail || "Failed to load admin data");
        } finally { setLoading(false); }
    }, [q, includeDeleted]);

    useEffect(() => { if (isAdmin) fetchAll(); }, [isAdmin, fetchAll]);

    const totalRows = useMemo(() => users.length, [users]);

    if (auth?.status === "loading") {
        return <div className="cv-container cv-section text-sm text-muted-foreground">Loading…</div>;
    }
    if (!isAdmin) {
        return (
            <div data-testid={ADMIN.accessDenied} className="cv-container cv-section">
                <div className="cv-card mx-auto max-w-lg p-8 text-center">
                    <Shield className="mx-auto h-8 w-8 text-destructive" />
                    <h1 className="mt-4 font-display text-2xl font-bold">Admin access required</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        You don't have permission to view this page. Please sign in with an
                        administrator account.
                    </p>
                    <Link to={`${ROUTES.login}?next=${ROUTES.admin}`}
                        className="mt-5 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
                        Sign in
                    </Link>
                </div>
            </div>
        );
    }

    const quickBan = async (uid, banned, ev) => {
        ev.stopPropagation();
        try {
            await api.patch(`/admin/users/${uid}/ban`, { banned });
            await fetchAll();
        } catch (e) {
            setError(e?.response?.data?.detail || "Ban action failed");
        }
    };

    const quickDelete = async (uid, ev) => {
        ev.stopPropagation();
        if (!window.confirm("Soft-delete this user?")) return;
        try {
            await api.delete(`/admin/users/${uid}`);
            await fetchAll();
        } catch (e) {
            setError(e?.response?.data?.detail || "Delete failed");
        }
    };

    return (
        <div data-testid={ADMIN.page} className="cv-container cv-section">
            <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Admin · CareerVerse</p>
                    <h1 className="font-display text-3xl font-bold tracking-tight">User management</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Signed in as <span className="font-medium">{auth.user.email}</span> · Admin
                    </p>
                </div>
                <button type="button" onClick={fetchAll} disabled={loading} data-testid={ADMIN.refresh}
                    className="cv-focus inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50">
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                </button>
            </header>

            {stats && (
                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard k="total" label="Total users" value={stats.totalUsers} icon={Users} />
                    <StatCard k="banned" label="Banned" value={stats.bannedUsers} icon={UserX} />
                    <StatCard k="admins" label="Admins" value={stats.adminCount} icon={Shield} />
                    <StatCard k="mentor" label="Mentor sessions" value={stats.mentorSessions} icon={MessageSquare} />
                </div>
            )}

            <div className="cv-card mb-4 flex flex-wrap items-center gap-3 p-3">
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input data-testid={ADMIN.search}
                        type="search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by name or email…"
                        className="cv-focus h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm" />
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input data-testid={ADMIN.includeDeletedToggle}
                        type="checkbox"
                        checked={includeDeleted}
                        onChange={(e) => setIncludeDeleted(e.target.checked)}
                        className="h-4 w-4 rounded border-border" />
                    Include deleted
                </label>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {totalRows} result{totalRows === 1 ? "" : "s"}
                </span>
            </div>

            {error && (
                <p data-testid={ADMIN.error} className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                </p>
            )}

            <div className="cv-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table data-testid={ADMIN.table} className="w-full text-sm">
                        <thead className="bg-secondary/50 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3 hidden md:table-cell">Registered</th>
                                <th className="px-4 py-3 hidden lg:table-cell">Last login</th>
                                <th className="px-4 py-3 hidden md:table-cell">Mentor</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr data-testid={ADMIN.emptyRow}>
                                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                        {loading ? "Loading…" : "No users found."}
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u.id} data-testid={ADMIN.userRow(u.id)}
                                    onClick={() => setDrawerId(u.id)}
                                    className="cursor-pointer border-t border-border transition-colors hover:bg-secondary/40">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{u.name}</p>
                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{fmtDate(u.createdAt)}</td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{fmtDate(u.lastLoginAt)}</td>
                                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                                        <span className="inline-flex items-center gap-1">
                                            <Sparkles className="h-3 w-3" /> {u.mentorSessionCount}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge user={u} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button type="button"
                                                onClick={(e) => { e.stopPropagation(); setDrawerId(u.id); }}
                                                data-testid={ADMIN.userViewBtn(u.id)}
                                                title="View"
                                                className="cv-focus inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary">
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>
                                            {u.role !== "admin" && !u.deletedAt && (
                                                <>
                                                    <button type="button"
                                                        onClick={(e) => quickBan(u.id, !u.bannedAt, e)}
                                                        data-testid={ADMIN.userBanBtn(u.id)}
                                                        title={u.bannedAt ? "Unban" : "Ban"}
                                                        className="cv-focus inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary">
                                                        {u.bannedAt ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                                                    </button>
                                                    <button type="button"
                                                        onClick={(e) => quickDelete(u.id, e)}
                                                        data-testid={ADMIN.userDeleteBtn(u.id)}
                                                        title="Soft delete"
                                                        className="cv-focus inline-flex h-8 w-8 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {drawerId && (
                <UserDrawer uid={drawerId}
                    onClose={() => setDrawerId(null)}
                    onMutated={fetchAll} />
            )}
        </div>
    );
}
