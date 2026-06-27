import { Link } from "react-router-dom";
import { Compass, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PRIMARY_NAV } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { NAV } from "@/constants/testIds";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { cn } from "@/lib/utils";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            data-testid={NAV.bar}
            className={cn(
                "sticky top-0 z-40 w-full transition-all duration-300",
                scrolled
                    ? "cv-glass border-b border-border/60"
                    : "bg-transparent border-b border-transparent",
            )}
        >
            <div className="cv-container flex h-16 items-center justify-between gap-6">
                <Link
                    to={ROUTES.home}
                    data-testid={NAV.logo}
                    className="cv-focus flex items-center gap-2 font-display text-lg font-bold tracking-tight"
                >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background">
                        <Compass className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    CareerVerse
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {PRIMARY_NAV.map((item) =>
                        item.enabled ? (
                            <Link
                                key={item.id}
                                to={item.href}
                                data-testid={NAV.primaryItem(item.id)}
                                className="cv-focus inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                key={item.id}
                                data-testid={NAV.primaryItem(item.id)}
                                className="group relative inline-flex cursor-default items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground"
                                aria-disabled
                            >
                                {item.label}
                                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Soon
                                </span>
                            </span>
                        ),
                    )}
                </nav>

                <div className="flex items-center gap-2">
                    <Link
                        to={ROUTES.login}
                        data-testid={NAV.ctaLogin}
                        className="cv-focus hidden rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary md:inline-flex"
                    >
                        Sign in
                    </Link>
                    <Link
                        to={ROUTES.register}
                        data-testid={NAV.ctaRegister}
                        className="cv-focus hidden rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.02] md:inline-flex"
                    >
                        Get started
                    </Link>
                    <ThemeToggle />
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        data-testid={NAV.mobileMenuToggle}
                        aria-label="Toggle menu"
                        className="cv-focus inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card md:hidden"
                    >
                        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {open && (
                <div
                    data-testid={NAV.mobileMenu}
                    className="cv-glass border-t border-border/60 md:hidden"
                >
                    <div className="cv-container flex flex-col gap-1 py-4">
                        {PRIMARY_NAV.map((item) => (
                            <span
                                key={item.id}
                                data-testid={NAV.primaryItem(`${item.id}-mobile`)}
                                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground"
                            >
                                {item.label}
                                {!item.enabled && (
                                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Soon
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
