import { Link, useParams } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useCareerDetail } from "@/hooks/useContent";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { ROUTES } from "@/constants/routes";
import { CONTENT } from "@/constants/testIds";

export default function CareerDetail() {
    const { slug } = useParams();
    const { data, isLoading, isError } = useCareerDetail(slug);

    if (isLoading) return <div className="cv-container cv-section"><LoadingSkeleton className="h-96" /></div>;
    if (isError || !data) return <div className="cv-container cv-section"><ErrorState description="Career not found." /></div>;

    const { career, category, streams } = data;
    const bands = career.salary_band || {};
    return (
        <div data-testid={CONTENT.careerDetail} className="cv-container cv-section">
            <Link to={ROUTES.careers} className="cv-focus inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Career library
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-2">
                {category && (
                    <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{category.name}</span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-ai/10 px-3 py-1 text-xs font-semibold text-ai">
                    <TrendingUp className="h-3 w-3" /> +{career.growth_pct}% growth
                </span>
            </div>

            <h1 data-testid={CONTENT.careerDetailTitle} className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                {career.title}
            </h1>
            <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">{career.summary}</p>

            <div className="mt-12 grid gap-6 lg:grid-cols-12">
                <section className="cv-card p-6 lg:col-span-7">
                    <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Required skills</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {(career.required_skills || []).map((s) => (
                            <span key={s} className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-sm font-medium">{s}</span>
                        ))}
                    </div>

                    <h2 className="mt-10 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Open to</h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Classes: <span className="font-semibold text-foreground">{(career.applicable_classes || []).join(", ")}</span>
                    </p>
                </section>

                <aside className="cv-card p-6 lg:col-span-5">
                    <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Salary band ({bands.currency || "INR"})</h2>
                    <dl className="mt-4 space-y-3">
                        {[["Entry", bands.entry], ["Mid", bands.mid], ["Senior", bands.senior]].map(([k, v]) => (
                            <div key={k} className="flex items-baseline justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                                <dt className="text-sm text-muted-foreground">{k}</dt>
                                <dd className="font-display text-lg font-semibold">{v || "—"}</dd>
                            </div>
                        ))}
                    </dl>

                    {streams.length > 0 && (
                        <>
                            <h2 className="mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">From streams</h2>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {streams.map((s) => (
                                    <Link
                                        key={s.id}
                                        to={ROUTES.streamDetail(s.slug)}
                                        data-testid={`career-detail-stream-${s.slug}`}
                                        className="cv-focus inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold hover:bg-border"
                                    >
                                        {s.name}
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </aside>
            </div>
        </div>
    );
}
