import { json, error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { db } from "$lib/server/db/index.js";
import { projects } from "$lib/server/db/schema.js";

export async function GET({ url, locals }) {
  // 1. Authenticate
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }

  // 2. Get projectId
  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
    throw error(400, "projectId is required");
  }

  // 3. Find project belonging to this user
  const project = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, locals.user.id)))
    .limit(1);

  if (!project[0]) {
    throw error(404, "Project not found");
  }

  // Workspace file retrieval comes next
  return json({
    success: true,
    projectId: project[0].id,
  });
}
