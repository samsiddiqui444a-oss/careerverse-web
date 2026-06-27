import { Compass } from "lucide-react";
import { FOOTER_GROUPS } from "@/constants/navigation";
import { FOOTER } from "@/constants/testIds";

export function Footer() {
    return (
        <footer
            data-testid={FOOTER.root}
            className="border-t border-border bg-card/40"
        >
            <div className="cv-container py-16">
                <div className="grid gap-12 md:grid-cols-12">
                    <div className="md:col-span-4">
                        <div className="flex items-center gap-2 font-display text-lg font-bold">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background">
                                <Compass className="h-4 w-4" strokeWidth={2.5} />
                            </span>
                            CareerVerse
                        </div>
                        <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                            AI-powered career guidance for students in India — from Class 8 all
                            the way to college and beyond.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 md:col-span-8 md:grid-cols-4">
                        {FOOTER_GROUPS.map((group) => (
                            <div
                                key={group.id}
                                data-testid={FOOTER.group(group.id)}
                            >
                                <h4 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                    {group.title}
                                </h4>
                                <ul className="mt-4 space-y-3">
                                    {group.links.map((link) => (
                                        <li key={link.label}>
                                            <span
                                                data-testid={FOOTER.link(
                                                    `${group.id}-${link.label.toLowerCase().replace(/\s+/g, "-")}`,
                                                )}
                                                className="cursor-default text-sm text-foreground/80 transition-colors hover:text-foreground"
                                            >
                                                {link.label}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
                    <p>© {new Date().getFullYear()} CareerVerse. All rights reserved.</p>
                    <p className="font-mono">v0.1.0 · foundation</p>
                </div>
            </div>
        </footer>
    );
}
