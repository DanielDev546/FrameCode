import { eq } from "drizzle-orm";
import { db } from "../src/lib/server/db/index.js";
import { templates } from "../src/lib/server/db/schema.js";

// GitHub auto-generates a social preview image for every public repo —
// no API key, no hosting needed.
const updates = [
  {
    slug: "saas-starter",
    thumbnailUrl:
      "https://opengraph.githubassets.com/1/CriticalMoments/CMSaasStarter",
  },
  {
    slug: "minimal-starter",
    thumbnailUrl:
      "https://opengraph.githubassets.com/1/buhodev/sveltekit-tailwind-starter",
  },
];

for (const u of updates) {
  await db
    .update(templates)
    .set({ thumbnailUrl: u.thumbnailUrl })
    .where(eq(templates.slug, u.slug));
  console.log(`Updated: ${u.slug}`);
}
console.log("Done.");
