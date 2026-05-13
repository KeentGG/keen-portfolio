// ─── Interfaces ──────────────────────────────────────────────

export interface Hero {
  headline: string;
  subheadline: string;
  tagline: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
}

export interface ProofStat {
  label: string;
  value: string;
  source: string;
}

export interface LeveragePillar {
  title: string;
  description: string;
  evidence: string[];
  tags: string[];
}

export interface FlowStep {
  from: string;
  to: string;
}

export interface EngineeringHighlight {
  title: string;
  summary: string;
  flow: FlowStep[];
  evidence: string[];
  tags: string[];
  signal: string;
}

export interface HowIWorkPillar {
  title: string;
  description: string;
}

export interface CapabilityGroup {
  title: string;
  skills: string[];
  evidence: string;
}

export interface CurrentlyBuilding {
  title: string;
  subtitle: string;
  description: string;
  status: "active-rnd" | "production" | "exploration";
}

export interface VisualArchive {
  sectionTitle: string;
  description: string;
}

export interface Contact {
  headline: string;
  subheadline: string;
  email: string;
  linkedin: string;
  github: string;
  location: string;
  locationNote: string;
}

export interface ResumeCta {
  label: string;
  href: string;
  variant: string;
}

// ─── Hero ────────────────────────────────────────────────────

export const hero: Hero = {
  headline:
    "Senior frontend engineer building AI-powered product workflows, design systems, and modernized product interfaces.",
  subheadline:
    "8+ years across React, TypeScript, Node.js, UI/UX design, RAG pipelines, and production web systems — shipping practical AI workflows and frontend systems that hold up under real constraints.",
  tagline:
    "I modernize legacy products, build practical AI workflows, and turn rough ideas into production interfaces.",
  ctaPrimary: { label: "Engineering Highlights", href: "#engineering-highlights" },
  ctaSecondary: { label: "Contact", href: "#contact" },
};

// ─── Proof Stats ─────────────────────────────────────────────

export const proofStats: ProofStat[] = [
  { label: "Years engineering", value: "8+", source: "Total career from internship through present (2018–present)" },
  { label: "TypeScript", value: "5+ years", source: "Modern React/Next.js frontend work (profile.json)" },
  { label: "React", value: "4+ years", source: "Tau Express through Valhalla (profile.json)" },
  { label: "Node.js", value: "7+ years", source: "Express, NestJS, AdonisJS, full-stack JS (profile.json)" },
  { label: "Remote since", value: "2021", source: "Remote-first since Suzerin (context.json)" },
  { label: "React components", value: "20+", source: "Tau Express component library, 5+ legacy app migrations (resume)" },
  { label: "Python crawlers", value: "30+", source: "Tau Express AI/ML data pipelines (resume)" },
  { label: "Load-time improvement", value: "~4s → ~1s", source: "Valhalla legacy jQuery-to-React migration (resume)" },
];

// ─── Leverage Pillars ────────────────────────────────────────

export const leveragePillars: LeveragePillar[] = [
  {
    title: "AI Product Workflows",
    description:
      "Building practical AI-powered systems — not just using AI tools, but designing pipelines, APIs, and UIs that ship production value.",
    evidence: [
      "Internal AI chatbot with RAG pipelines, OpenAI/Gemini embeddings, and Qdrant vector search",
      "Express.js API orchestration with chat thread history and auto-generated summaries",
      "Led company's first AI coding skill-sharing session on agentic workflows",
      "Spec-agent R&D for brownfield codebase exploration",
    ],
    tags: ["RAG", "Qdrant", "OpenAI", "Gemini", "Express.js", "AI Agentic Coding"],
  },
  {
    title: "Frontend Systems & Design Systems",
    description:
      "Reusable component architecture, design systems, and UI engineering that scales across teams and legacy codebases.",
    evidence: [
      "React component library with 20+ reusable components, powering migration of 5+ legacy React apps",
      "Flutter component library with 30+ UI components for cross-project reusability",
      "Figma-to-production workflow — designed and shipped modern visual themes",
      "Accessibility-focused component API design across React and Flutter",
    ],
    tags: ["React", "Flutter", "Component Libraries", "Design Systems", "Accessibility"],
  },
  {
    title: "Legacy Modernization",
    description:
      "Incremental, production-safe migration of aging codebases — improving performance without breaking what works.",
    evidence: [
      "Migrated legacy jQuery pages to React, improving load time from ~4s to ~1s",
      "Parallelized script loading and removed dead code for measurable performance gains",
      "Designed modern visual theme for legacy dashboard pages",
      "Cross-framework experience: Vue, React, Angular, Flutter",
    ],
    tags: ["jQuery to React", "Performance", "Dead Code Removal", "Visual Refresh"],
  },
  {
    title: "Complex Product Logic",
    description:
      "Handling the messy, state-heavy, calculation-heavy frontend work that separates senior engineers from interface-only developers.",
    evidence: [
      "Spreadsheet-like financial table with dynamic calculation logic and Xero/QuickBooks integrations",
      "LMS grading, enrollment, and quiz assignment features",
      "Cross-framework work across React, Vue, Angular, and Flutter",
      "Objective-C iOS SDK maintenance for EloTouch POS systems at scale",
    ],
    tags: ["Vue", "Financial UI", "Fintech", "LMS", "Cross-Framework"],
  },
  {
    title: "Data & Automation Pipelines",
    description:
      "Backend automation and data infrastructure that supports AI/ML training and production monitoring.",
    evidence: [
      "30+ Python crawlers for news and political websites",
      "Backend monitoring/tracking system for crawler health and data quality",
      "AI/ML training data pipeline support for LLM workflows",
      "Self-hosted infrastructure on VPS with Docker and Tailscale",
    ],
    tags: ["Python", "Crawlers", "Docker", "Monitoring", "Infrastructure"],
  },
  {
    title: "End-to-End Ownership",
    description:
      "Proposing architecture, aligning with stakeholders, and shipping the first production version — not waiting for tickets.",
    evidence: [
      "Wrote and proposed AI chatbot architecture, got CTO approval, built full stack end-to-end",
      "Initiated company's first skill-sharing session unprompted",
      "Comfortable across frontend, backend, design, data, and infrastructure",
      "Prefers owning projects — finding gaps, raising them, proposing solutions",
    ],
    tags: ["Architecture", "CTO Alignment", "Stakeholder Management", "Shipping"],
  },
];

// ─── Engineering Highlights ──────────────────────────────────

export const engineeringHighlights: EngineeringHighlight[] = [
  {
    title: "Internal AI Chatbot / RAG System",
    summary:
      "Architected and shipped an internal AI chatbot for a world-renowned Australian boxing gym brand client. The system helped branch staff retrieve operational answers from company knowledge sources using RAG pipelines, OpenAI/Gemini embeddings, Qdrant vector search, Express.js APIs, chat thread history, and auto-generated summaries.",
    flow: [
      { from: "Knowledge Sources", to: "Embeddings (OpenAI/Gemini)" },
      { from: "Embeddings (OpenAI/Gemini)", to: "Qdrant Vector Search" },
      { from: "Qdrant Vector Search", to: "Express.js API" },
      { from: "Express.js API", to: "Chat UI" },
      { from: "Chat UI", to: "Thread History + Summaries" },
    ],
    evidence: [
      "Proposed architecture and got CTO approval",
      "Built RAG pipeline with OpenAI and Gemini embeddings",
      "Implemented Express.js API orchestration and chat thread history",
      "Added auto-generated summaries and titles for context management",
      "Evaluated Algolia vs in-house and Qdrant vs AWS — made production trade-off decisions",
    ],
    tags: ["RAG", "OpenAI", "Gemini", "Qdrant", "Express.js", "AI Product Engineering"],
    signal: "Practical AI product engineering, frontend ownership, backend fluency, product thinking",
  },
  {
    title: "Legacy Dashboard Modernization",
    summary:
      "Migrated legacy jQuery pages to React, removed dead code, parallelized script loading, improved load time from ~4s to ~1s, and designed a modern visual theme for dashboard pages.",
    flow: [
      { from: "Legacy jQuery Pages", to: "Dead Code Analysis" },
      { from: "Dead Code Analysis", to: "React Migration" },
      { from: "React Migration", to: "Script Parallelization" },
      { from: "Script Parallelization", to: "Modern Visual Theme" },
      { from: "Modern Visual Theme", to: "~4s → ~1s Load Time" },
    ],
    evidence: [
      "Migrated 10+ legacy jQuery pages to React",
      "Improved load time from ~4s to ~1s through parallelization and dead code removal",
      "Designed and shipped modern visual theme for dashboard pages",
      "Incremental migration under production constraints",
    ],
    tags: ["jQuery to React", "Performance", "UI Modernization", "Brownfield"],
    signal: "Senior brownfield engineering skill — improving real production systems under constraints",
  },
  {
    title: "React Component Library",
    summary:
      "Built an accessible React component library with 20+ reusable components that supported migration of 5+ legacy React apps from older versions to newer React versions.",
    flow: [
      { from: "Component API Design", to: "20+ Reusable Components" },
      { from: "20+ Reusable Components", to: "Storybook Documentation" },
      { from: "Storybook Documentation", to: "5+ Legacy App Migrations" },
      { from: "5+ Legacy App Migrations", to: "React v12 → v17 Upgrade" },
    ],
    evidence: [
      "Led development of accessible React component library with 20+ components",
      "Powered migration of 5+ legacy React apps from v12 to v17",
      "Used Storybook for component documentation and visual development",
      "Accessibility-focused API design across all components",
    ],
    tags: ["React", "Component Library", "Storybook", "Accessibility", "Design Systems"],
    signal: "Reusable frontend architecture, migration compatibility, team-scale UI thinking",
  },
  {
    title: "AI/ML Data Collection Infrastructure",
    summary:
      "Created and maintained 30+ Python crawlers for news and political websites, plus a backend monitoring/tracking system to oversee crawler health and data quality.",
    flow: [
      { from: "News/Political Sites", to: "30+ Python Crawlers" },
      { from: "30+ Python Crawlers", to: "Data Collection Pipeline" },
      { from: "Data Collection Pipeline", to: "Monitoring System" },
      { from: "Monitoring System", to: "AI/ML Training Data" },
    ],
    evidence: [
      "Created and maintained 30+ Python crawlers for news and political sites",
      "Built backend monitoring and tracking system for crawler health",
      "Ensured data structure reliability for AI training workflows",
      "Supported Singapore Gov't data synthesis with LLM pipelines",
    ],
    tags: ["Python", "Crawlers", "Monitoring", "Data Quality", "AI/ML Pipelines"],
    signal: "Differentiates from pure UI developers — automation and data pipeline experience",
  },
  {
    title: "Spreadsheet-like Financial Table",
    summary:
      "Engineered a spreadsheet-like financial table with dynamic calculation logic and advanced data interactions for a financial accounting app integrated with Xero and QuickBooks.",
    flow: [
      { from: "Vue.js/TailwindCSS App", to: "Financial Table Component" },
      { from: "Financial Table Component", to: "Dynamic Calculation Engine" },
      { from: "Dynamic Calculation Engine", to: "Xero/QuickBooks Integration" },
      { from: "Xero/QuickBooks Integration", to: "Core App Feature" },
    ],
    evidence: [
      "Implemented sophisticated algorithm for dynamic calculations",
      "Built spreadsheet-like interactions in a Vue.js component",
      "Integrated with Xero and QuickBooks APIs",
      "Core component of the financial accounting app",
    ],
    tags: ["Vue", "Fintech", "Complex UI", "Xero", "QuickBooks"],
    signal: "Ability to handle complex frontend state and business logic",
  },
  {
    title: "Flutter LMS & Component System",
    summary:
      "Led development of a Flutter LMS mobile app serving 1,000+ students and parents, and built a reusable Flutter component library with 30+ UI components.",
    flow: [
      { from: "Flutter App", to: "LMS Mobile App" },
      { from: "LMS Mobile App", to: "1,000+ Users" },
      { from: "Flutter App", to: "Reusable Component Library" },
      { from: "Reusable Component Library", to: "30+ UI Components" },
    ],
    evidence: [
      "Led development of Flutter LMS mobile app serving 1,000+ students and parents",
      "Built reusable Flutter component library with 30+ UI components",
      "Fully digitized school transactions and updates",
      "Early leadership role — cross-platform component thinking",
    ],
    tags: ["Flutter", "Mobile", "Component Library", "Education", "Cross-Platform"],
    signal: "Breadth, early leadership, and cross-platform component thinking",
  },
];

// ─── How I Work ──────────────────────────────────────────────

export const howIWork: HowIWorkPillar[] = [
  {
    title: "I research fast and ramp into unfamiliar systems.",
    description:
      "Every major role has involved learning a new stack or domain — Flutter, Vue, React, RAG pipelines, vector search, legacy modernization. The differentiator is not just the tech already known, but the ability to research, pick things up quickly, and reason through unfamiliar systems.",
  },
  {
    title: "I think in product and design, not just tickets.",
    description:
      "Strong UI/UX design sense — Figma-to-production work, finding product gaps, proposing better flows. I approach engineering through a product-design lens, not just implementation instructions.",
  },
  {
    title: "I modernize without breaking production.",
    description:
      "Legacy jQuery to React migrations, performance improvements, dead code cleanup, incremental refactoring. I work within constraints to improve real systems without disrupting what already works.",
  },
  {
    title: "I use AI as a practical engineering multiplier.",
    description:
      "RAG chatbot shipped to production, AI coding skill-sharing sessions, Blueprint/spec-agent workflow R&D. I use AI tools practically — not as hype, but as genuine engineering leverage with a human-in-the-loop mindset.",
  },
  {
    title: "I prefer ownership over ticket conveyor belts.",
    description:
      "I find gaps, propose architecture, align with stakeholders, and ship iteratively. I am strongest when the problem is not fully shaped yet and needs someone to identify what matters and drive it through.",
  },
];

// ─── Capability Stack ────────────────────────────────────────

export const capabilityStack: CapabilityGroup[] = [
  {
    title: "Frontend Systems",
    skills: [
      "React",
      "TypeScript",
      "Next.js",
      "Vue.js",
      "Angular",
      "TailwindCSS",
      "Design Systems",
      "Component Libraries",
      "Accessibility",
      "Responsive Design",
    ],
    evidence:
      "20+ React components, 5+ app migration, Figma-to-production dashboard theme, Flutter component library with 30+ components.",
  },
  {
    title: "AI Product Engineering",
    skills: [
      "OpenAI",
      "Gemini Embeddings",
      "RAG Pipelines",
      "Qdrant",
      "Vercel AI SDK",
      "Prompt Engineering",
      "Agentic Coding",
    ],
    evidence:
      "Internal chatbot, vector search, threaded UI with chat thread history, summaries, team AI workflow session.",
  },
  {
    title: "Backend & APIs",
    skills: [
      "Node.js",
      "Express.js",
      "NestJS",
      "AdonisJS",
      "REST",
      "GraphQL",
      "PostgreSQL",
      "MongoDB",
      "Firebase",
    ],
    evidence:
      "API orchestration for RAG workflows, financial integrations with Xero/QuickBooks, chatbot backend, app services.",
  },
  {
    title: "Automation & Infrastructure",
    skills: [
      "Python",
      "Crawlers",
      "Docker",
      "Vercel",
      "Self-hosted VPS",
      "Tailscale",
      "Coolify",
    ],
    evidence:
      "30+ crawlers with monitoring system, self-hosted infrastructure for side projects and agents.",
  },
];

// ─── Currently Building ──────────────────────────────────────

export const currentlyBuilding: CurrentlyBuilding = {
  title: "Blueprint / Spec-Agent Workflow",
  subtitle: "AI-assisted codebase exploration for clearer specs, behavior maps, and implementation plans.",
  description:
    "Currently building a Blueprint/spec-agent workflow for brownfield codebases. Early results are positive: it can produce more comprehensive spec suites that capture UI behavior, business logic, function mapping, edge cases, and system flows. It still needs more polish before production use, but the direction is already useful for turning messy codebases into clearer implementation plans.",
  status: "active-rnd",
};

// ─── Visual Archive ──────────────────────────────────────────

export const visualArchive: VisualArchive = {
  sectionTitle: "Earlier Visual Work",
  description:
    "Earlier visual and freelance work across property websites, mobile prototypes, landing pages, and logo design. Kept here as a design archive; my current focus is frontend systems, AI workflows, and product engineering.",
};

// ─── Contact ─────────────────────────────────────────────────

export const contact: Contact = {
  headline: "Let's build something that matters.",
  subheadline:
    "Looking for roles where I can own frontend systems, AI-powered product workflows, or legacy modernization. If you're building AI tools, frontend platforms, or modernizing a production product, I'd like to talk.",
  email: "keanukent.dev@gmail.com",
  linkedin: "https://www.linkedin.com/in/keanukentgargar/",
  github: "https://github.com/KeentGG",
  location: "Bacolod, Philippines",
  locationNote:
    "Based in Bacolod, Philippines. Remote since 2021, with experience working across Australia, the UK, Singapore, and US time zones.",
};

// ─── Resume CTA ──────────────────────────────────────────────

export const resumeCta: ResumeCta = {
  label: "Download Resume",
  href: "/resume/senior-frontend-uiux-ai-resume.pdf",
  variant: "primary",
};
