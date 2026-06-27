import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useStreams } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { ROUTES } from "@/constants/routes";
import { CONTENT } from "@/constants/testIds";

export default function StreamExplorer() {
    const { data, isLoading, isError } = useStreams();
    return (
        <div data-testid={CONTENT.streamExplorer} className="cv-container cv-section">
            <SectionHeading
                eyebrow="Stream Explorer"
                title="Every stream is a door."
                description="Science, Commerce, Humanities or Hybrid — see what each one unlocks."
            />
            {isLoading && (
                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={`stream-skel-${i}`} className="h-48" />)}
                </div>
            )}
            {isError && <div className="mt-12"><ErrorState description="Could not load streams." /></div>}
            {data && (
                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {data.map((s) => (
                        <Link
                            key={s.id}
                            to={ROUTES.streamDetail(s.slug)}
                            data-testid={CONTENT.streamCard(s.slug)}
                            className="cv-card cv-focus group flex h-full flex-col gap-4 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <h3 className="font-display text-xl font-semibold tracking-tight">{s.name}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{s.tagline}</p>
                            <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-ai">
                                Browse careers <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
