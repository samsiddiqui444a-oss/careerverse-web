import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useStreamDetail } from "@/hooks/useContent";
import { CareerCard } from "@/components/common/CareerCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import { CONTENT } from "@/constants/testIds";

export default function StreamDetail() {
    const { slug } = useParams();
    const { data, isLoading, isError } = useStreamDetail(slug);

    if (isLoading) return <div className="cv-container cv-section"><LoadingSkeleton className="h-64" /></div>;
    if (isError || !data) return <div className="cv-container cv-section"><ErrorState description="Stream not found." /></div>;

    const { stream, careers } = data;
    return (
        <div data-testid={CONTENT.streamDetail} className="cv-container cv-section">
            <Link to={ROUTES.streams} className="cv-focus inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> All streams
            </Link>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">{stream.name}</h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">{stream.tagline}</p>

            <h2 className="mt-16 font-display text-2xl font-bold tracking-tight">
                {careers.length} career{careers.length === 1 ? "" : "s"} from this stream
            </h2>
            {careers.length === 0 ? (
                <div className="mt-6"><EmptyState title="No careers mapped yet" description="Check back as we expand the library." /></div>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
