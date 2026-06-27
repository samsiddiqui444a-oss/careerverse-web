import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Send, Trash2, Sparkles, MessageSquare, Loader2 } from "lucide-react";
import { api, API_BASE } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { MENTOR } from "@/constants/testIds";

const SUGGESTIONS = [
    "I'm in Class 10. Should I take PCM, PCB, or Commerce?",
    "Best engineering branches for a student who loves coding?",
    "How do I prepare for JEE Main alongside Class 12 boards?",
    "Career options after BSc in Computer Science?",
];

function fmtTime(iso) {
    try {
        return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch { return ""; }
}

function MessageBubble({ role, content, testid }) {
    const isUser = role === "user";
    return (
        <div data-testid={testid} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                isUser
                    ? "bg-foreground text-background"
                    : "border border-border bg-card text-foreground"
            }`}>
                {!isUser && (
                    <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Sparkles className="h-3 w-3" /> Disha · AI Mentor
                    </div>
                )}
                {content || (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> thinking…
                    </span>
                )}
            </div>
        </div>
    );
}

export default function AiMentor() {
    const auth = useAuth();
    const [sessions, setSessions] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [streaming, setStreaming] = useState(false);
    const [streamBuf, setStreamBuf] = useState("");
    const [error, setError] = useState(null);
    const [loadingSession, setLoadingSession] = useState(false);
    const threadRef = useRef(null);

    const authed = auth?.status === "authed";

    const loadSessions = useCallback(async () => {
        const r = await api.get("/mentor/sessions");
        setSessions(r.data);
        return r.data;
    }, []);

    const loadMessages = useCallback(async (sid) => {
        setLoadingSession(true);
        try {
            const r = await api.get(`/mentor/sessions/${sid}/messages`);
            setMessages(r.data);
        } finally { setLoadingSession(false); }
    }, []);

    // Initial load: list sessions, pick first or create one
    useEffect(() => {
        if (!authed) return;
        (async () => {
            try {
                const list = await loadSessions();
                if (list.length > 0) {
                    setActiveId(list[0].id);
                } else {
                    const r = await api.post("/mentor/sessions", {});
                    setSessions([r.data]);
                    setActiveId(r.data.id);
                }
            } catch (e) {
                setError(e?.response?.data?.detail || "Could not load mentor sessions");
            }
        })();
    }, [authed, loadSessions]);

    // Load messages when active session changes
    useEffect(() => {
        if (!activeId || !authed) return;
        loadMessages(activeId).catch((e) =>
            setError(e?.response?.data?.detail || "Could not load messages"));
    }, [activeId, authed, loadMessages]);

    // Auto-scroll on new content
    useEffect(() => {
        const el = threadRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages, streamBuf]);

    const newSession = async () => {
        try {
            const r = await api.post("/mentor/sessions", {});
            setSessions((s) => [r.data, ...s]);
            setActiveId(r.data.id);
            setMessages([]);
            setError(null);
        } catch (e) {
            setError(e?.response?.data?.detail || "Could not create session");
        }
    };

    const deleteSession = async (sid, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this conversation?")) return;
        try {
            await api.delete(`/mentor/sessions/${sid}`);
            setSessions((s) => s.filter((x) => x.id !== sid));
            if (activeId === sid) {
                setActiveId(null);
                setMessages([]);
            }
        } catch (err) {
            setError(err?.response?.data?.detail || "Delete failed");
        }
    };

    const send = async (overrideText) => {
        const text = (overrideText ?? draft).trim();
        if (!text || streaming || !activeId) return;
        setError(null);
        setDraft("");
        // Optimistic user bubble
        const tempUserId = `tmp-${Date.now()}`;
        setMessages((m) => [
            ...m,
            { id: tempUserId, role: "user", content: text, createdAt: new Date().toISOString() },
        ]);
        setStreaming(true);
        setStreamBuf("");

        try {
            const res = await fetch(`${API_BASE}/mentor/sessions/${activeId}/stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({ message: text }),
            });
            if (!res.ok || !res.body) {
                const detail = await res.text().catch(() => "");
                throw new Error(detail || `HTTP ${res.status}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let assistantText = "";

            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                // Parse SSE frames separated by blank line
                let idx;
                while ((idx = buffer.indexOf("\n\n")) !== -1) {
                    const frame = buffer.slice(0, idx);
                    buffer = buffer.slice(idx + 2);
                    const lines = frame.split("\n");
                    let evName = "message";
                    let dataStr = "";
                    for (const ln of lines) {
                        if (ln.startsWith("event:")) evName = ln.slice(6).trim();
                        else if (ln.startsWith("data:")) dataStr += ln.slice(5).trim();
                    }
                    if (!dataStr) continue;
                    let payload = {};
                    try { payload = JSON.parse(dataStr); } catch { continue; }

                    if (evName === "delta" && payload.content) {
                        assistantText += payload.content;
                        setStreamBuf(assistantText);
                    } else if (evName === "error") {
                        throw new Error(payload.message || "AI error");
                    } else if (evName === "done") {
                        // refresh authoritative messages from server
                        await loadMessages(activeId);
                        await loadSessions();
                        setStreamBuf("");
                    }
                }
            }
        } catch (err) {
            const msg = err?.message || "Stream failed";
            setError(msg);
            // Roll back: reload messages from server (drops temp user bubble & any partial)
            try { await loadMessages(activeId); } catch { /* ignore */ }
            setStreamBuf("");
        } finally {
            setStreaming(false);
        }
    };

    if (!authed) {
        return (
            <div data-testid={MENTOR.authGate} className="cv-container cv-section">
                <div className="cv-card mx-auto max-w-xl p-8 text-center">
                    <Sparkles className="mx-auto h-8 w-8 text-ai" />
                    <h1 className="mt-4 font-display text-3xl font-bold">Meet Disha — your AI Career Mentor</h1>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Sign in or create a free account to start a personalised conversation about
                        streams, careers, exams, and colleges in India.
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                        <Link to={`${ROUTES.login}?next=${ROUTES.aiMentor}`}
                            className="cv-focus rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
                            Sign in
                        </Link>
                        <Link to={ROUTES.register}
                            className="cv-focus rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold">
                            Create account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div data-testid={MENTOR.page} className="cv-container cv-section">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                {/* Sidebar */}
                <aside data-testid={MENTOR.sidebar} className="cv-card flex h-[70vh] flex-col p-3">
                    <button type="button" onClick={newSession} data-testid={MENTOR.newSession}
                        className="cv-focus inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-3 py-2.5 text-sm font-semibold text-background">
                        <Plus className="h-4 w-4" /> New conversation
                    </button>
                    <div className="mt-3 flex-1 overflow-y-auto">
                        {sessions.length === 0 && (
                            <p className="px-3 pt-4 text-xs text-muted-foreground">No conversations yet.</p>
                        )}
                        <ul className="space-y-1">
                            {sessions.map((s) => (
                                <li key={s.id}>
                                    <button type="button"
                                        onClick={() => setActiveId(s.id)}
                                        data-testid={MENTOR.sessionItem(s.id)}
                                        className={`group flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                                            activeId === s.id ? "bg-secondary" : "hover:bg-secondary/60"
                                        }`}>
                                        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                        <span className="flex-1 truncate">{s.title}</span>
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => deleteSession(s.id, e)}
                                            data-testid={MENTOR.sessionDelete(s.id)}
                                            className="cv-focus rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Thread */}
                <section className="cv-card flex h-[70vh] flex-col">
                    <header className="flex items-center justify-between border-b border-border px-5 py-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-ai" />
                            <h1 className="font-display text-lg font-semibold">AI Career Mentor</h1>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            Claude Sonnet 4.6
                        </span>
                    </header>

                    <div ref={threadRef} data-testid={MENTOR.threadContainer}
                        className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
                        {loadingSession ? (
                            <p className="text-sm text-muted-foreground">Loading…</p>
                        ) : messages.length === 0 && !streaming ? (
                            <div data-testid={MENTOR.emptyState} className="mx-auto max-w-md py-6 text-center">
                                <Sparkles className="mx-auto h-7 w-7 text-ai" />
                                <h2 className="mt-3 font-display text-xl font-semibold">Hi, I'm Disha 👋</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Ask me anything about streams, careers, entrance exams, scholarships,
                                    or skills. Try one of these:
                                </p>
                                <div className="mt-4 flex flex-col gap-2">
                                    {SUGGESTIONS.map((s, i) => (
                                        <button key={s} type="button"
                                            data-testid={MENTOR.suggestionChip(i)}
                                            onClick={() => send(s)}
                                            disabled={streaming}
                                            className="cv-focus rounded-xl border border-border bg-card px-3 py-2 text-left text-sm hover:bg-secondary disabled:opacity-50">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((m) => (
                                    <MessageBubble key={m.id} role={m.role} content={m.content}
                                        testid={MENTOR.messageItem(m.id)} />
                                ))}
                                {streaming && (
                                    <MessageBubble role="assistant" content={streamBuf}
                                        testid={MENTOR.streamingBubble} />
                                )}
                            </>
                        )}
                        {error && (
                            <p data-testid={MENTOR.error}
                                className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {error}
                            </p>
                        )}
                    </div>

                    <form data-testid={MENTOR.composer}
                        onSubmit={(e) => { e.preventDefault(); send(); }}
                        className="flex items-end gap-2 border-t border-border px-5 py-3">
                        <textarea
                            data-testid={MENTOR.composerInput}
                            rows={1}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            }}
                            placeholder="Ask about streams, careers, exams…"
                            disabled={streaming || !activeId}
                            className="cv-focus min-h-[44px] max-h-32 flex-1 resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
                        />
                        <button type="submit"
                            data-testid={MENTOR.composerSend}
                            disabled={streaming || !draft.trim() || !activeId}
                            className="cv-focus inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-foreground px-4 text-sm font-semibold text-background disabled:opacity-50">
                            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </form>
                    <p className="px-5 pb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Press Enter to send · Shift+Enter for new line
                    </p>
                </section>
            </div>
        </div>
    );
}
