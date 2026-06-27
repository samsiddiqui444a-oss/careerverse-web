import { cn } from "@/lib/utils";

/**
 * LoadingSkeleton — generic skeleton block with shimmer.
 */
export function LoadingSkeleton({ className, testId }) {
    return (
        <div
            data-testid={testId || "loading-skeleton"}
            className={cn(
                "relative overflow-hidden rounded-xl bg-secondary",
                className,
            )}
        >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
        </div>
    );
}
