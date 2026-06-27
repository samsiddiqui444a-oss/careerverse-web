import { ArrowUpRight } from "lucide-react";

/**
 * CareerCard — reusable card to represent a single career option.
 * Visual-only placeholder: data shape is intentional and matches the future
 * `Career` database schema (see /app/docs/DATABASE.md).
 */
export function CareerCard({ title, category, summary, salary, growth, testId }) {
    return (
        <article
            data-testid={testId || `career-card-${title?.toLowerCase().replace(/\s+/g, "-")}`}
            className="cv-card group flex h-full flex-col gap-5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="flex items-start justify-between">
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                    {category}
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                    <ArrowUpRight className="h-4 w-4" />
                </span>
            </div>
            <div className="space-y-2">
                <h3 className="font-display text-xl font-semibold tracking-tight">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
            </div>
            <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-border pt-5">
                <div>
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Avg. Salary
                    </dt>
                    <dd className="mt-1 font-display text-sm font-semibold">{salary}</dd>
                </div>
                <div>
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Growth
                    </dt>
                    <dd className="mt-1 inline-flex items-center gap-1 font-display text-sm font-semibold text-ai">
                        {growth}
                    </dd>
                </div>
            </dl>
        </article>
    );
}
