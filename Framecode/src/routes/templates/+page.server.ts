import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const templates = [
    {
      id: "saas-hero-v2",
      name: "SaaS Hero v2",
      description:
        "Production-ready SaaS landing page with authentication and dashboard.",
      category: "SaaS",
      framework: "SvelteKit",
      language: "TypeScript",
      score: 94,
      forks: 132,
      stars: 96,
      difficulty: "Intermediate",
      tags: ["SaaS", "Auth", "Dashboard", "Responsive", "SEO"],
      image: "/templates/saas-hero-v2.png",
      previewUrl: "/preview/saas-hero-v2",
      githubUrl: "https://github.com/framecode/saas-hero-v2",
    },
    {
      id: "auth-starter",
      name: "Authentication Starter",
      description:
        "Lucia authentication starter with OAuth and protected routes.",
      category: "Authentication",
      framework: "SvelteKit",
      language: "TypeScript",
      score: 91,
      forks: 74,
      stars: 90,
      difficulty: "Beginner",
      tags: ["Lucia", "OAuth", "Auth", "Drizzle"],
      image: "/templates/auth-starter.png",
      previewUrl: "/preview/auth-starter",
      githubUrl: "https://github.com/framecode/auth-starter",
    },
    {
      id: "ai-chat-ui",
      name: "AI Chat UI",
      description: "Modern AI chatbot interface with streaming responses.",
      category: "AI",
      framework: "SvelteKit",
      language: "TypeScript",
      score: 97,
      forks: 215,
      stars: 99,
      difficulty: "Advanced",
      tags: ["AI", "Chat", "Streaming", "OpenAI"],
      image: "/templates/ai-chat-ui.png",
      previewUrl: "/preview/ai-chat-ui",
      githubUrl: "https://github.com/framecode/ai-chat-ui",
    },
  ];

  const categories = [
    "All",
    "SaaS",
    "Authentication",
    "Dashboard",
    "Portfolio",
    "AI",
    "Landing Page",
    "E-commerce",
    "Blog",
  ];

  const frameworks = ["SvelteKit", "React", "Next.js", "Vue", "Astro"];

  return {
    templates,
    categories,
    frameworks,
  };
};
