/**
 * StreamCard — represents an academic stream (Science, Commerce, Arts, etc).
 * Visual-only foundation component.
 */
export function StreamCard({ icon: Icon, name, tagline, accent = "ai", testId }) {
    const accentClass =
        accent === "discovery"
            ? "bg-discovery/10 text-discovery"
            : "bg-ai/10 text-ai";
    return (
        <article
            data-testid={testId || `stream-card-${name?.toLowerCase().replace(/\s+/g, "-")}`}
            className="cv-card group relative flex h-full flex-col gap-5 overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
            <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accentClass}`}
            >
                {Icon ? <Icon className="h-5 w-5" strokeWidth={2.25} /> : null}
            </span>
            <div className="space-y-1.5">
                <h3 className="font-display text-xl font-semibold tracking-tight">{name}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{tagline}</p>
            </div>
        </article>
    );
}
