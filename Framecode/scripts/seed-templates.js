import { db } from "../src/lib/server/db/index.js";
import { templates } from "../src/lib/server/db/schema.js";

// Two real, verified, MIT-licensed SvelteKit starters — both confirmed
// working and actively maintained as of this seed.
const seedTemplates = [
  {
    id: crypto.randomUUID(),
    slug: "saas-starter",
    name: "SaaS Starter",
    description:
      "Auth, billing, dashboard, blog, and pricing page — full SvelteKit + Tailwind SaaS boilerplate.",
    category: "SaaS",
    framework: "SvelteKit",
    repoUrl: "https://github.com/CriticalMoments/CMSaasStarter",
    previewUrl: "https://saasstarter.work",
    thumbnailUrl: null,
    tags: JSON.stringify(["auth", "billing", "dashboard", "blog", "tailwind"]),
    downloads: 0,
    featured: true,
  },
  {
    id: crypto.randomUUID(),
    slug: "minimal-starter",
    name: "Minimal Starter",
    description:
      "Clean Svelte 5 + Tailwind v4 + TypeScript starting point — no bloat, just the essentials.",
    category: "Starter",
    framework: "Svelte",
    repoUrl: "https://github.com/buhodev/sveltekit-tailwind-starter",
    previewUrl: null,
    thumbnailUrl: null,
    tags: JSON.stringify(["minimal", "typescript", "tailwind"]),
    downloads: 0,
    featured: false,
  },
];

async function seed() {
  for (const t of seedTemplates) {
    await db.insert(templates).values(t);
    console.log(`Inserted: ${t.name}`);
  }
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
