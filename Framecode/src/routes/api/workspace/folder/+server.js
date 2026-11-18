import { json, error } from "@sveltejs/kit";

import {
  initializeWorkspace,
  normalizePath,
  ensureFolder,
} from "$lib/server/workspace.js";

export async function POST({ request, locals }) {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }

  const { projectId, path } = await request.json();

  if (!projectId || !path) {
    throw error(400, "projectId and path are required");
  }

  const project = await initializeWorkspace(projectId, locals.user.id);

  const normalizedPath = normalizePath(path);

  const folder = await ensureFolder(project.id, normalizedPath);

  return json({
    success: true,
    folder,
  });
}
