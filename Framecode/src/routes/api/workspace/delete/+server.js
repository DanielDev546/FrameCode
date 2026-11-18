import { json, error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db/index.js";
import { projectFiles } from "$lib/server/db/schema.js";

import { initializeWorkspace, normalizePath } from "$lib/server/workspace.js";

async function deleteEntry({ request, locals }) {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }

  const body = await request.json();

  const projectId =
    body.projectId ?? new URL(request.url).searchParams.get("projectId");

  const path = body.path ?? new URL(request.url).searchParams.get("path");

  if (!projectId || !path) {
    throw error(400, "projectId and path are required");
  }

  const project = await initializeWorkspace(projectId, locals.user.id);

  const normalizedPath = normalizePath(path);

  const allFiles = await db
    .select()
    .from(projectFiles)
    .where(eq(projectFiles.projectId, project.id));

  const affected = allFiles.filter(
    (entry) =>
      entry.path === normalizedPath ||
      entry.path.startsWith(`${normalizedPath}/`),
  );

  if (!affected.length) {
    throw error(404, "Entry not found");
  }

  for (const entry of affected) {
    await db.delete(projectFiles).where(eq(projectFiles.id, entry.id));
  }

  return json({
    success: true,
    deleted: normalizedPath,
    count: affected.length,
  });
}

export async function DELETE(event) {
  return deleteEntry(event);
}

export async function POST(event) {
  return deleteEntry(event);
}
