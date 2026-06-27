import { Link } from "react-router-dom";
import { useClasses } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { ROUTES } from "@/constants/routes";
import { CONTENT } from "@/constants/testIds";

export default function ClassExplorer() {
    const { data, isLoading, isError } = useClasses();
    return (
        <div data-testid={CONTENT.classExplorer} className="cv-container cv-section">
            <SectionHeading
                eyebrow="Class Explorer"
                title="Start where you are."
                description="Pick your class and we'll show you the streams and career paths that open up next."
            />
            {isLoading && (
                <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <LoadingSkeleton key={`class-skel-${i}`} className="h-40" />
                    ))}
                </div>
            )}
            {isError && <div className="mt-12"><ErrorState description="Could not load classes." /></div>}
            {data && (
                <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {data.map((c) => (
                        <Link
                            key={c.id}
                            to={ROUTES.classDetail(c.id)}
                            data-testid={CONTENT.classCard(c.id)}
                            className="cv-card cv-focus flex flex-col gap-2 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="flex items-baseline justify-between">
                                <span className="font-display text-4xl font-bold tracking-tight">{c.level}</span>
                                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Class</span>
                            </div>
                            <h3 className="font-display text-sm font-semibold">{c.label}</h3>
                            <p className="text-xs text-muted-foreground">{c.blurb}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
