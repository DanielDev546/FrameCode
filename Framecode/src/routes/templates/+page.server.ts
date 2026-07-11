import { desc } from "drizzle-orm";
import { db } from "$lib/server/db/index.js";
import { templates } from "$lib/server/db/schema.js";

export async function load() {
  const rows = await db
    .select()
    .from(templates)
    .orderBy(desc(templates.featured), desc(templates.downloads));

  return {
    templates: rows.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      category: t.category,
      framework: t.framework,
      repoUrl: t.repoUrl,
      previewUrl: t.previewUrl,
      thumbnailUrl: t.thumbnailUrl,
      tags: parseTags(t.tags),
      downloads: t.downloads,
      featured: Boolean(t.featured),
    })),
  };
}

// `tags` is a plain TEXT column — this assumes it's stored as a JSON
// array string (e.g. '["auth","landing"]'). If you're instead storing
// it as a plain comma-separated string, the catch branch below handles
// that automatically.
function parseTags(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
