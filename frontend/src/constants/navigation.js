import { ROUTES } from "./routes";

// Primary navbar items. Each item maps to a future page that is not yet built.
// `enabled: false` items render as disabled with a "Coming soon" badge.
export const PRIMARY_NAV = [
    { id: "explore", label: "Classes", href: ROUTES.classes, enabled: true },
    { id: "streams", label: "Streams", href: ROUTES.streams, enabled: true },
    { id: "careers", label: "Careers", href: ROUTES.careers, enabled: true },
    { id: "dna", label: "Career DNA", href: ROUTES.careerDna, enabled: true },
    { id: "mentor", label: "AI Mentor", href: ROUTES.aiMentor, enabled: false },
    { id: "scholarships", label: "Scholarships", href: ROUTES.scholarships, enabled: true },
];

// Grouped footer link map.
export const FOOTER_GROUPS = [
    {
        id: "product",
        title: "Product",
        links: [
            { label: "Class Explorer", href: ROUTES.classes },
            { label: "Stream Explorer", href: ROUTES.streams },
            { label: "Career Library", href: ROUTES.careers },
            { label: "Career DNA Test", href: ROUTES.careerDna },
            { label: "AI Mentor", href: ROUTES.aiMentor },
        ],
    },
    {
        id: "resources",
        title: "Resources",
        links: [
            { label: "Roadmaps", href: ROUTES.roadmaps },
            { label: "Skill Library", href: ROUTES.skills },
            { label: "Scholarships", href: ROUTES.scholarships },
            { label: "Career Comparison", href: ROUTES.careerCompare },
        ],
    },
    {
        id: "account",
        title: "Account",
        links: [
            { label: "Sign in", href: ROUTES.login },
            { label: "Create account", href: ROUTES.register },
            { label: "Dashboard", href: ROUTES.dashboard },
            { label: "Saved Careers", href: ROUTES.savedCareers },
        ],
    },
    {
        id: "company",
        title: "Company",
        links: [
            { label: "About", href: "/about" },
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Contact", href: "/contact" },
        ],
    },
];
