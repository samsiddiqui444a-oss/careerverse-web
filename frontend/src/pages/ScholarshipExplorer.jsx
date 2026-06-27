import { useState, useMemo } from "react";
import { Award, Calendar, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { SectionHeading } from "@/components/common/SectionHeading";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";

const TAG_OPTIONS = [
    { id: null, label: "All" },
    { id: "school", label: "School" },
    { id: "ug", label: "Undergrad" },
    { id: "science", label: "Science" },
    { id: "tech", label: "Tech" },
    { id: "girls", label: "For Girls" },
    { id: "need-based", label: "Need-based" },
    { id: "merit", label: "Merit" },
    { id: "research", label: "Research" },
];

export default function ScholarshipExplorer() {
    const [tag, setTag] = useState(null);
    const { data, isLoading, isError } = useQuery({
        queryKey: ["scholarships"],
        queryFn: async () => (await api.get("/scholarships")).data,
    });

    const filtered = useMemo(() => {
        if (!data) return [];
        if (!tag) return data;
        return data.filter((s) => (s.tags || []).includes(tag));
    }, [data, tag]);

    return (
        <div data-testid="scholarship-explorer-page" className="cv-container cv-section">
            <SectionHeading
                eyebrow="Scholarships"
                title="Money you might already qualify for."
                description="Government, AICTE, foundation and merit-based scholarships available to Indian students."
            />

            <div className="mt-10 flex flex-wrap gap-2">
                {TAG_OPTIONS.map((t) => (
                    <button
                        key={t.id || "all"}
                        type="button"
                        onClick={() => setTag(t.id)}
                        data-testid={`scholarship-filter-${t.id || "all"}`}
                        className={cn(
                            "cv-focus rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                            tag === t.id
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-card text-foreground hover:bg-secondary",
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {isLoading && (
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <LoadingSkeleton key={`sch-skel-${i}`} className="h-48" />
                    ))}
                </div>
            )}
            {isError && <div className="mt-10"><ErrorState description="Could not load scholarships." /></div>}
            {filtered.length === 0 && data && (
                <div className="mt-10" data-testid="scholarship-empty">
                    <EmptyState title="No scholarships match" description="Try a different filter." />
                </div>
            )}
            {filtered.length > 0 && (
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((s) => (
                        <article
                            key={s.id}
                            data-testid={`scholarship-card-${s.slug}`}
                            className="cv-card flex h-full flex-col gap-4 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-discovery/10 text-discovery">
                                    <Award className="h-5 w-5" />
                                </span>
                                <div className="flex flex-wrap justify-end gap-1">
                                    {(s.tags || []).slice(0, 2).map((t) => (
                                        <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="font-display text-lg font-semibold tracking-tight">{s.name}</h3>
                                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.provider}</p>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">{s.eligibility}</p>
                            <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-border pt-4">
                                <div>
                                    <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Amount</dt>
                                    <dd className="mt-1 font-display text-sm font-semibold">{s.amount}</dd>
                                </div>
                                <div>
                                    <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Deadline</dt>
                                    <dd className="mt-1 inline-flex items-center gap-1 font-display text-sm font-semibold">
                                        <Calendar className="h-3 w-3" /> {s.deadline}
                                    </dd>
                                </div>
                            </dl>
                            {s.url && (
                                <a
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    data-testid={`scholarship-link-${s.slug}`}
                                    className="cv-focus inline-flex items-center gap-1 text-xs font-semibold text-ai hover:underline"
                                >
                                    Apply <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
