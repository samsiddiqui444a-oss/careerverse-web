import { Link, useParams } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useClassDetail } from "@/hooks/useContent";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { ROUTES } from "@/constants/routes";
import { CONTENT } from "@/constants/testIds";

export default function ClassDetail() {
    const { classId } = useParams();
    const { data, isLoading, isError } = useClassDetail(classId);

    if (isLoading) return <div className="cv-container cv-section"><LoadingSkeleton className="h-64" /></div>;
    if (isError || !data) return <div className="cv-container cv-section"><ErrorState description="Class not found." /></div>;

    const { class: cls, streams } = data;
    return (
        <div data-testid={CONTENT.classDetail} className="cv-container cv-section">
            <Link to={ROUTES.classes} className="cv-focus inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> All classes
            </Link>
            <div className="mt-6 flex items-baseline gap-4">
                <span className="font-display text-7xl font-bold tracking-tight">{cls.level}</span>
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{cls.label}</h1>
                    <p className="mt-2 max-w-2xl text-base text-muted-foreground sm:text-lg">{cls.blurb}</p>
                </div>
            </div>

            <h2 className="mt-16 font-display text-2xl font-bold tracking-tight">Streams available</h2>
            {streams.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No streams mapped for this class yet — try Class 11 or 12.</p>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {streams.map((s) => (
                        <Link
                            key={s.id}
                            to={ROUTES.streamDetail(s.slug)}
                            data-testid={CONTENT.streamCard(s.slug)}
                            className="cv-card cv-focus group flex flex-col gap-3 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <h3 className="font-display text-xl font-semibold tracking-tight">{s.name}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{s.tagline}</p>
                            <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-ai">
                                Explore careers <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
