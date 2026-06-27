import { ArrowRight, Sparkles, Compass, GraduationCap, Briefcase, BookOpen, Lightbulb, Award, ArrowUpRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CareerCard } from "@/components/common/CareerCard";
import { StreamCard } from "@/components/common/StreamCard";
import { ClassCard } from "@/components/common/ClassCard";
import { SkillCard } from "@/components/common/SkillCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { LANDING } from "@/constants/testIds";

const COLOR_SWATCHES = [
    { token: "background", label: "Background", varName: "--background" },
    { token: "card", label: "Card", varName: "--card" },
    { token: "secondary", label: "Secondary", varName: "--secondary" },
    { token: "muted", label: "Muted", varName: "--muted" },
    { token: "primary", label: "Primary", varName: "--primary" },
    { token: "ai", label: "AI Teal", varName: "--ai" },
    { token: "discovery", label: "Discovery", varName: "--discovery" },
    { token: "success", label: "Success", varName: "--success" },
    { token: "warning", label: "Warning", varName: "--warning" },
    { token: "destructive", label: "Destructive", varName: "--destructive" },
    { token: "border", label: "Border", varName: "--border" },
    { token: "foreground", label: "Foreground", varName: "--foreground" },
];

const TYPE_SAMPLES = [
    { name: "Display / H1", cls: "font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight", sample: "Your career, decoded." },
    { name: "Heading / H2", cls: "font-display text-3xl sm:text-4xl font-bold tracking-tight", sample: "Built for every Indian student." },
    { name: "Heading / H3", cls: "font-display text-2xl font-semibold tracking-tight", sample: "Explore streams & careers" },
    { name: "Body large", cls: "text-lg leading-relaxed", sample: "From Class 8 through college, CareerVerse maps the path from curiosity to career." },
    { name: "Body base", cls: "text-base leading-relaxed", sample: "Every recommendation is grounded in real outcomes, not generic advice." },
    { name: "Caption", cls: "text-sm text-muted-foreground", sample: "Aligned to NEP 2020 and India's evolving curriculum." },
    { name: "Overline / Mono", cls: "font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground", sample: "Design System · v0.1" },
];

const FAQ_ITEMS = [
    { q: "What is CareerVerse?", a: "An AI-powered career guidance platform for Indian students from Class 8 through college — combining stream selection, career exploration, personalized roadmaps and scholarship discovery in one place." },
    { q: "Is this for school students or college students?", a: "Both. The product is class-aware: a Class 9 student sees stream-selection guidance, while a college student sees specialization, internship and career roadmap content." },
    { q: "How does the AI mentor work?", a: "Once launched, the AI mentor will use your profile, interests and class to offer personalized, conversational guidance grounded in verified career data — not generic chat." },
];

export default function LandingShowcase() {
    return (
        <div data-testid={LANDING.page}>
            {/* HERO */}
            <section data-testid={LANDING.hero} className="relative overflow-hidden">
                <div className="cv-container relative cv-section">
                    <div className="grid items-center gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-7">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
                                <Sparkles className="h-3 w-3 text-ai" /> Design System · v0.1 · Foundation
                            </span>
                            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                                Your career,
                                <br />
                                <span className="text-ai">decoded</span> by AI.
                            </h1>
                            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                                CareerVerse is an AI-powered career guidance platform for Indian
                                students from Class 8 through college. This page is the visual
                                contract for every screen we will ever ship.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    data-testid={LANDING.heroCta}
                                    className="cv-focus inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
                                >
                                    Explore design system
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    data-testid={LANDING.heroSecondaryCta}
                                    className="cv-focus inline-flex items-center gap-2 rounded-full border border-ai/30 bg-ai/10 px-6 py-3 text-sm font-semibold text-ai transition-colors hover:bg-ai hover:text-ai-foreground"
                                >
                                    <Sparkles className="h-4 w-4" /> Meet the AI Mentor
                                </button>
                            </div>
                            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8">
                                {[
                                    ["8→Grad", "Class coverage"],
                                    ["200+", "Career paths planned"],
                                    ["Live", "Scholarship data"],
                                ].map(([k, v]) => (
                                    <div key={k}>
                                        <dt className="font-display text-2xl font-bold tracking-tight">{k}</dt>
                                        <dd className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                            {v}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="relative lg:col-span-5">
                            <div className="cv-card relative aspect-[4/5] overflow-hidden p-0">
                                <img
                                    src="https://images.unsplash.com/photo-1604177091072-b7b677a077f6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjBzdHVkZW50JTIwbW9kZXJuJTIwc3R1ZHl8ZW58MHx8fHwxNzgyNTIzMDI5fDA&ixlib=rb-4.1.0&q=85"
                                    alt="Student exploring careers"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                                <div className="absolute inset-x-6 bottom-6">
                                    <div className="cv-glass rounded-2xl p-4">
                                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                            AI Insight
                                        </p>
                                        <p className="mt-1 font-display text-sm font-semibold">
                                            &ldquo;You show strong pattern affinity for Data + Design careers.&rdquo;
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* COLOR PALETTE */}
            <section data-testid={LANDING.colorSection} className="cv-container cv-section">
                <SectionHeading
                    eyebrow="01 · Color"
                    title="A trustworthy, education-tech palette."
                    description="Charcoal anchors authority. Teal carries AI moments. Coral powers discovery cues. Tested in both light and dark."
                />
                <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {COLOR_SWATCHES.map((s) => (
                        <div
                            key={s.token}
                            data-testid={`color-swatch-${s.token}`}
                            className="cv-card overflow-hidden p-0"
                        >
                            <div
                                className="h-20 w-full border-b border-border"
                                style={{ background: `hsl(var(${s.varName}))` }}
                            />
                            <div className="p-3">
                                <p className="font-display text-sm font-semibold">{s.label}</p>
                                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                                    {s.varName}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* TYPOGRAPHY */}
            <section data-testid={LANDING.typographySection} className="cv-container cv-section">
                <SectionHeading
                    eyebrow="02 · Typography"
                    title="Outfit + Plus Jakarta Sans."
                    description="A confident, geometric display face paired with a friendly humanist sans for body — chosen to feel premium without feeling corporate."
                />
                <div className="mt-12 space-y-8">
                    {TYPE_SAMPLES.map((t) => (
                        <div
                            key={t.name}
                            className="flex flex-col gap-2 border-b border-border pb-6 last:border-0 sm:flex-row sm:items-baseline sm:gap-10"
                        >
                            <div className="sm:w-40 sm:shrink-0">
                                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                    {t.name}
                                </p>
                            </div>
                            <p className={t.cls}>{t.sample}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* BUTTONS */}
            <section data-testid={LANDING.buttonsSection} className="cv-container cv-section">
                <SectionHeading
                    eyebrow="03 · Buttons"
                    title="One pill, many voices."
                    description="A unified pill geometry across primary, secondary, AI, and ghost variants."
                />
                <div className="mt-12 flex flex-wrap items-center gap-4">
                    <button data-testid="btn-primary" className="cv-focus inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.02]">
                        Get started <ArrowRight className="h-4 w-4" />
                    </button>
                    <button data-testid="btn-secondary" className="cv-focus inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                        Browse careers
                    </button>
                    <button data-testid="btn-ai" className="cv-focus inline-flex items-center gap-2 rounded-full border border-ai/30 bg-ai/10 px-6 py-3 text-sm font-semibold text-ai transition-colors hover:bg-ai hover:text-ai-foreground">
                        <Sparkles className="h-4 w-4" /> Ask AI Mentor
                    </button>
                    <button data-testid="btn-discovery" className="cv-focus inline-flex items-center gap-2 rounded-full bg-discovery px-6 py-3 text-sm font-semibold text-discovery-foreground transition-transform hover:scale-[1.02]">
                        Take Career DNA Test
                    </button>
                    <button data-testid="btn-ghost" className="cv-focus inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                        Skip for now
                    </button>
                    <button data-testid="btn-destructive" className="cv-focus inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-6 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground">
                        Delete account
                    </button>
                </div>

                <div className="mt-10 flex flex-wrap gap-2">
                    {[
                        { label: "AI Insight", cls: "bg-ai/10 text-ai border-ai/20" },
                        { label: "New", cls: "bg-discovery/10 text-discovery border-discovery/20" },
                        { label: "Live data", cls: "bg-success/10 text-success border-success/20" },
                        { label: "In review", cls: "bg-warning/10 text-warning-foreground border-warning/20" },
                        { label: "Beta", cls: "bg-secondary text-secondary-foreground border-border" },
                    ].map((b) => (
                        <span
                            key={b.label}
                            data-testid={`badge-${b.label.toLowerCase().replace(/\s+/g, "-")}`}
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${b.cls}`}
                        >
                            {b.label}
                        </span>
                    ))}
                </div>
            </section>

            {/* CARDS — Bento */}
            <section data-testid={LANDING.cardsSection} className="cv-container cv-section">
                <SectionHeading
                    eyebrow="04 · Cards"
                    title="A card for every artifact."
                    description="Classes, streams, careers, skills — each gets its own card archetype, all sharing one geometry."
                />

                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <ClassCard level="9" label="Foundation Year" blurb="Discover what makes you light up." />
                    <ClassCard level="10" label="Stream Selection" blurb="Make your first big academic call." />
                    <ClassCard level="12" label="Career Shortlist" blurb="Lock in the top 3 paths to chase." />
                    <ClassCard level="UG" label="Specialize" blurb="Internships, electives, first jobs." />
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <StreamCard icon={GraduationCap} name="Science" tagline="PCM, PCB, and emerging hybrid tracks." accent="ai" />
                    <StreamCard icon={Briefcase} name="Commerce" tagline="Finance, analytics, entrepreneurship." accent="discovery" />
                    <StreamCard icon={BookOpen} name="Humanities" tagline="Law, psychology, design, policy." accent="ai" />
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <CareerCard
                        title="Data Scientist"
                        category="Technology"
                        summary="Translate data into decisions across product, finance and research."
                        salary="₹12–28 LPA"
                        growth="+24%"
                    />
                    <CareerCard
                        title="UX Designer"
                        category="Design"
                        summary="Shape how millions of people experience digital products."
                        salary="₹8–22 LPA"
                        growth="+18%"
                    />
                    <CareerCard
                        title="Clinical Psychologist"
                        category="Healthcare"
                        summary="Help individuals navigate mental health through evidence-based care."
                        salary="₹6–18 LPA"
                        growth="+15%"
                    />
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    <SkillCard name="Python" level="Foundational" hours={60} />
                    <SkillCard name="Public Speaking" level="Core" hours={40} />
                    <SkillCard name="Design Thinking" level="Core" hours={30} />
                    <SkillCard name="SQL & Analytics" level="Foundational" hours={50} />
                </div>
            </section>

            {/* FORMS */}
            <section data-testid={LANDING.formsSection} className="cv-container cv-section">
                <SectionHeading
                    eyebrow="05 · Forms"
                    title="Inputs that respect the reader."
                    description="Rounded, generous, ringed with the AI accent on focus."
                />
                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                    <div className="cv-card p-6">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground" htmlFor="cv-email">
                            Email
                        </label>
                        <input
                            id="cv-email"
                            type="email"
                            placeholder="you@school.edu"
                            data-testid="input-email"
                            className="cv-focus mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground/60"
                        />
                    </div>
                    <div className="cv-card p-6">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground" htmlFor="cv-search">
                            Search careers
                        </label>
                        <div className="relative mt-2">
                            <input
                                id="cv-search"
                                type="search"
                                placeholder="Try 'Data Scientist'"
                                data-testid="input-search"
                                className="cv-focus w-full rounded-xl border border-border bg-card px-4 py-3 pr-10 text-foreground placeholder:text-muted-foreground/60"
                            />
                            <Compass className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                    </div>
                </div>
            </section>

            {/* STATES */}
            <section data-testid={LANDING.statesSection} className="cv-container cv-section">
                <SectionHeading
                    eyebrow="06 · States"
                    title="Empty, loading, error — all designed."
                    description="The product is responsible for every state, not just the happy one."
                />
                <div className="mt-12 grid gap-6 lg:grid-cols-3">
                    <EmptyState
                        icon={Lightbulb}
                        title="No saved careers yet"
                        description="Browse the library and bookmark the ones that pull you in."
                    />
                    <div className="cv-card flex flex-col gap-3 p-6">
                        <LoadingSkeleton className="h-6 w-1/2" />
                        <LoadingSkeleton className="h-4 w-3/4" />
                        <LoadingSkeleton className="h-4 w-2/3" />
                        <LoadingSkeleton className="h-24 w-full" />
                    </div>
                    <ErrorState
                        title="We hit a snag"
                        description="Could not load scholarships. Please retry in a moment."
                    />
                </div>
            </section>

            {/* FAQ */}
            <section data-testid={LANDING.faqSection} className="cv-container cv-section">
                <div className="grid gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <SectionHeading
                            eyebrow="07 · FAQ"
                            title="Foundation, not features."
                            description="This release is the design+architecture foundation. Pages, data and AI flows roll out next."
                        />
                    </div>
                    <div className="lg:col-span-7">
                        <Accordion type="single" collapsible className="cv-card p-2 sm:p-4">
                            {FAQ_ITEMS.map((item, i) => (
                                <AccordionItem
                                    key={item.q}
                                    value={`item-${i}`}
                                    data-testid={`faq-item-${i}`}
                                    className="border-border"
                                >
                                    <AccordionTrigger className="font-display text-base font-semibold hover:no-underline">
                                        {item.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                                        {item.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cv-container cv-section">
                <div className="cv-card relative overflow-hidden p-10 sm:p-16">
                    <div className="relative grid items-center gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-7">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                <Award className="h-3 w-3 text-discovery" /> Next milestone
                            </span>
                            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                                Pages, data, and AI ship next.
                            </h2>
                            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                                Every future screen will inherit this design system. No re-skins,
                                no resets — only forward motion.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    data-testid="cta-primary-bottom"
                                    className="cv-focus inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
                                >
                                    Review architecture <ArrowUpRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="lg:col-span-5">
                            <img
                                src="https://images.unsplash.com/photo-1673861561475-e0415df68554?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMGdsYXNzbW9ycGhpc218ZW58MHx8fHwxNzgyNTIzMDI5fDA&ixlib=rb-4.1.0&q=85"
                                alt="Abstract AI"
                                className="aspect-[4/3] w-full rounded-2xl object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
