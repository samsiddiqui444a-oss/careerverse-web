/**
 * ClassCard — represents a class level (8, 9, 10, 11, 12, College).
 */
export function ClassCard({ level, label, blurb, testId }) {
    return (
        <article
            data-testid={testId || `class-card-${level}`}
            className="cv-card flex h-full flex-col gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="flex items-baseline justify-between">
                <span className="font-display text-5xl font-bold tracking-tight text-foreground">
                    {level}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Class
                </span>
            </div>
            <div className="space-y-1.5">
                <h3 className="font-display text-base font-semibold">{label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{blurb}</p>
            </div>
        </article>
    );
}
