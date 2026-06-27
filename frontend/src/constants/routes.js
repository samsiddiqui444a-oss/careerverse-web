// Central route registry for CareerVerse.
// Pages are intentionally NOT built yet (foundation-only stage).
// Future routes are listed here so navigation, breadcrumbs, and link
// components can reference a single source of truth.

export const ROUTES = {
    home: "/",

    // Discovery
    classes: "/classes",
    classDetail: (classId = ":classId") => `/classes/${classId}`,
    streams: "/streams",
    streamDetail: (slug = ":slug") => `/streams/${slug}`,
    careers: "/careers",
    careerDetail: (slug = ":slug") => `/careers/${slug}`,
    careerCompare: "/careers/compare",
    skills: "/skills",
    skillDetail: (slug = ":slug") => `/skills/${slug}`,
    roadmaps: "/roadmaps",

    // AI & Tests
    aiMentor: "/ai-mentor",
    careerDna: "/career-dna",

    // Funding
    scholarships: "/scholarships",
    scholarshipDetail: (slug = ":slug") => `/scholarships/${slug}`,

    // Account
    login: "/login",
    register: "/register",
    dashboard: "/dashboard",
    savedCareers: "/dashboard/saved",
    settings: "/dashboard/settings",

    // Admin
    admin: "/admin",

    // Misc
    notFound: "*",
};
