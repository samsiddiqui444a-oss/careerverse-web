// data-testid registry for the Design System Showcase landing page.
export const LANDING = {
    page: "landing-showcase-page",
    hero: "landing-hero",
    heroCta: "landing-hero-primary-cta",
    heroSecondaryCta: "landing-hero-secondary-cta",
    colorSection: "showcase-color-palette",
    typographySection: "showcase-typography",
    buttonsSection: "showcase-buttons",
    cardsSection: "showcase-cards",
    formsSection: "showcase-forms",
    statesSection: "showcase-states",
    faqSection: "showcase-faq",
};

export const NAV = {
    bar: "app-navbar",
    logo: "navbar-logo",
    themeToggle: "navbar-theme-toggle",
    mobileMenuToggle: "navbar-mobile-menu-toggle",
    mobileMenu: "navbar-mobile-menu",
    primaryItem: (id) => `nav-item-${id}`,
    ctaLogin: "navbar-login-cta",
    ctaRegister: "navbar-register-cta",
};

export const FOOTER = {
    root: "app-footer",
    group: (id) => `footer-group-${id}`,
    link: (id) => `footer-link-${id}`,
};
