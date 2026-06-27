import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
    return (
        <div className="cv-container cv-section flex flex-col items-center text-center">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                404 · Lost in the verse
            </span>
            <h1 className="mt-4 font-display text-5xl font-bold tracking-tight sm:text-6xl">
                This page isn&apos;t built yet.
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
                CareerVerse is still in its foundation stage — every page will arrive in upcoming
                milestones.
            </p>
            <Link
                to={ROUTES.home}
                data-testid="not-found-home-link"
                className="cv-focus mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
            >
                Back to home
            </Link>
        </div>
    );
}
