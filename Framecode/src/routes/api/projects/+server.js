// @ts-nocheck
import { json, error } from "@sveltejs/kit";
import { db } from "$lib/server/db/index.js";
import { projects, activityLog } from "$lib/server/db/schema.js";

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals }) {
  if (!locals.user) error(401, "Unauthorized");

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, locals.user.id));

  return json(userProjects);
}

export async function POST({ request, locals }) {
  if (!locals.user) error(401, "Unauthorized");

  const body = await request.json();
  const { name, framework, language, visibility } = body;

  if (!name || name.trim().length < 2) {
    error(400, { error: "Project name must be at least 2 characters." });
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  const created = await db
    .insert(projects)
    .values({
      userId: locals.user.id,
      name: name.trim(),
      slug,
      framework: `${language} · ${framework}`,
      status: "draft",
    })
    .returning();

  const project = created[0];

  // Log activity
  await db.insert(activityLog).values({
    userId: locals.user.id,
    projectId: project.id,
    type: "project_created",
    message: `Created project "${project.name}"`,
  });

  return json(project);
}
