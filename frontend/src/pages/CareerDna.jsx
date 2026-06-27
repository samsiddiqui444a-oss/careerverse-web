import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { DNA_QUESTIONS, scoreAnswers } from "@/data/dnaQuiz";
import { useCareers, useCategories } from "@/hooks/useContent";
import { CareerCard } from "@/components/common/CareerCard";
import { SectionHeading } from "@/components/common/SectionHeading";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function CareerDna() {
    const [step, setStep] = useState(0); // 0..N-1 = quiz, N = results
    const [answers, setAnswers] = useState({});
    const { data: careers = [] } = useCareers();
    const { data: categories = [] } = useCategories();

    const total = DNA_QUESTIONS.length;
    const onResults = step >= total;
    const q = !onResults ? DNA_QUESTIONS[step] : null;
    const progress = (step / total) * 100;

    const ranked = useMemo(() => scoreAnswers(answers), [answers]);
    const topCats = ranked.slice(0, 3).map((r) => r.cat);
    const catNameById = useMemo(
        () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
        [categories],
    );
    const recommended = useMemo(() => {
        if (!onResults || careers.length === 0) return [];
        const scoreCareer = (c) => {
            const idx = topCats.indexOf(c.category_id);
            if (idx === -1) return -1;
            return (3 - idx) * 10 + (c.growth_pct || 0);
        };
        return [...careers]
            .map((c) => ({ ...c, _s: scoreCareer(c) }))
            .filter((c) => c._s >= 0)
            .sort((a, b) => b._s - a._s)
            .slice(0, 6);
    }, [onResults, careers, topCats]);

    const choose = (qid, oid) => {
        setAnswers((prev) => ({ ...prev, [qid]: oid }));
        setTimeout(() => setStep((s) => s + 1), 220);
    };

    const restart = () => {
        setAnswers({});
        setStep(0);
    };

    return (
        <div data-testid="career-dna-page" className="cv-container cv-section">
            {!onResults && (
                <>
                    <SectionHeading
                        eyebrow={`Question ${step + 1} of ${total}`}
                        title="Career DNA Test"
                        description="10 quick questions. No right answers — just clues about how your mind works."
                    />
                    <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-secondary" data-testid="dna-progress">
                        <div
                            className="h-full bg-foreground transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="mt-12">
                        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{q.q}</h2>
                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            {q.options.map((o) => (
                                <button
                                    key={o.id}
                                    type="button"
                                    onClick={() => choose(q.id, o.id)}
                                    data-testid={`dna-option-${q.id}-${o.id}`}
                                    className={cn(
                                        "cv-focus cv-card flex items-center justify-between gap-3 p-5 text-left text-base font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg",
                                        answers[q.id] === o.id && "ring-2 ring-ai",
                                    )}
                                >
                                    <span>{o.label}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                        {step > 0 && (
                            <button
                                type="button"
                                onClick={() => setStep((s) => s - 1)}
                                data-testid="dna-back-btn"
                                className="cv-focus mt-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-3 w-3" /> Back
                            </button>
                        )}
                    </div>
                </>
            )}

            {onResults && (
                <div data-testid="dna-results">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-ai" /> Your Career DNA
                    </span>
                    <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                        You lean toward <span className="text-ai">{catNameById[topCats[0]] || topCats[0]}</span>.
                    </h1>
                    <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                        Your top three categories from {total} questions — these are the spaces where your instincts shine.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-2">
                        {ranked.slice(0, 3).map((r, i) => (
                            <span
                                key={r.cat}
                                data-testid={`dna-top-cat-${i}`}
                                className={cn(
                                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                                    i === 0
                                        ? "border-ai/30 bg-ai/10 text-ai"
                                        : "border-border bg-card text-foreground",
                                )}
                            >
                                #{i + 1} {catNameById[r.cat] || r.cat} · {r.score} pts
                            </span>
                        ))}
                    </div>

                    <h2 className="mt-16 font-display text-2xl font-bold tracking-tight">Careers worth exploring</h2>
                    {recommended.length === 0 ? (
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={`dna-rec-skel-${i}`} className="h-56" />)}
                        </div>
                    ) : (
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {recommended.map((c) => (
                                <Link
                                    key={c.id}
                                    to={ROUTES.careerDetail(c.slug)}
                                    data-testid={`dna-recommended-${c.slug}`}
                                    className="cv-focus block h-full"
                                >
                                    <CareerCard
                                        title={c.title}
                                        category={catNameById[c.category_id] || c.category_id}
                                        summary={c.summary}
                                        salary={c.salary_band?.entry || "—"}
                                        growth={`+${c.growth_pct}%`}
                                        testId={`dna-rec-card-${c.slug}`}
                                    />
                                </Link>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={restart}
                        data-testid="dna-restart-btn"
                        className="cv-focus mt-12 inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-secondary"
                    >
                        <RotateCcw className="h-4 w-4" /> Take it again
                    </button>
                </div>
            )}
        </div>
    );
}
