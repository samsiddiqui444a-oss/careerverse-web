import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, align = "left", className }) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3",
                align === "center" && "items-center text-center",
                className,
            )}
        >
            {eyebrow && (
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {eyebrow}
                </span>
            )}
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
            </h2>
            {description && (
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                    {description}
                </p>
            )}
        </div>
    );
}
