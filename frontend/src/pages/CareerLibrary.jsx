import { Link } from "react-router-dom";
import { useState } from "react";
import { Search } from "lucide-react";
import { useCareers, useCategories } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CareerCard } from "@/components/common/CareerCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import { CONTENT } from "@/constants/testIds";
import { cn } from "@/lib/utils";

export default function CareerLibrary() {
    const [q, setQ] = useState("");
    const [category, setCategory] = useState(null);
    const { data: categories = [] } = useCategories();
    const { data: careers, isLoading, isError } = useCareers({
        q: q || undefined,
        category: category || undefined,
    });

    return (
        <div data-testid={CONTENT.careerLibrary} className="cv-container cv-section">
            <SectionHeading
                eyebrow="Career Library"
                title="Find your next move."
                description="Search 25+ Indian career paths by name, summary, or category."
            />

            <div className="mt-10 flex flex-col gap-4">
                <div className="relative max-w-xl">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Try 'designer', 'data', 'finance'..."
                        data-testid={CONTENT.careerSearch}
                        className="cv-focus w-full rounded-full border border-border bg-card pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground/60"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setCategory(null)}
                        data-testid={CONTENT.careerCategoryFilter("all")}
                        className={cn(
                            "cv-focus rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                            !category
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-card text-foreground hover:bg-secondary",
                        )}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            data-testid={CONTENT.careerCategoryFilter(cat.id)}
                            className={cn(
                                "cv-focus rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                                category === cat.id
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border bg-card text-foreground hover:bg-secondary",
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading && (
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={`career-skel-${i}`} className="h-56" />)}
                </div>
            )}
            {isError && <div className="mt-10"><ErrorState description="Could not load careers." /></div>}
            {careers && careers.length === 0 && (
                <div className="mt-10" data-testid={CONTENT.careerEmpty}>
                    <EmptyState title="Nothing matched" description="Try a different keyword or remove filters." />
                </div>
            )}
            {careers && careers.length > 0 && (
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {careers.map((c) => (
                        <Link
                            key={c.id}
                            to={ROUTES.careerDetail(c.slug)}
                            data-testid={CONTENT.careerCard(c.slug)}
                            className="cv-focus block h-full"
                        >
                            <CareerCard
                                title={c.title}
                                category={c.category_id}
                                summary={c.summary}
                                salary={c.salary_band?.entry || "—"}
                                growth={`+${c.growth_pct}%`}
                                testId={`career-card-inner-${c.slug}`}
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
