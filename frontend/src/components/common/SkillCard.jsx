import { Sparkles } from "lucide-react";

/**
 * SkillCard — represents a skill (technical, soft, domain-specific).
 */
export function SkillCard({ name, level, hours, testId }) {
    return (
        <article
            data-testid={testId || `skill-card-${name?.toLowerCase().replace(/\s+/g, "-")}`}
            className="cv-card flex flex-col gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
            <div className="flex items-center justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ai/10 text-ai">
                    <Sparkles className="h-4 w-4" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {level}
                </span>
            </div>
            <div>
                <h3 className="font-display text-base font-semibold">{name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">~ {hours} hrs to fluency</p>
            </div>
        </article>
    );
}
