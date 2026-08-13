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

  // 3. Get file path
  const path = url.searchParams.get("path");

  if (!path) {
    throw error(400, "path is required");
  }

  // 4. Verify that the project belongs to the user
  const project = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, locals.user.id)))
    .limit(1);

  if (!project[0]) {
    throw error(404, "Project not found");
  }

  // 5. Get the requested file
  // TODO: query the workspace files table here

  return json({
    success: true,
    projectId,
    path,
  });
}
