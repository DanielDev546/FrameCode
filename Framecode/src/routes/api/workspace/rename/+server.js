import { json, error } from "@sveltejs/kit";
import { and, eq, like } from "drizzle-orm";
import { db } from "$lib/server/db/index.js";
import { projectFiles } from "$lib/server/db/schema.js";

import {
  initializeWorkspace,
  normalizePath,
  ensureParentFolders,
} from "$lib/server/workspace.js";

export async function POST({ request, locals }) {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }

  const { projectId, path, newPath } = await request.json();

  if (!projectId || !path || !newPath) {
    throw error(400, "projectId, path and newPath are required");
  }

  const project = await initializeWorkspace(projectId, locals.user.id);

  const oldPath = normalizePath(path);
  const destination = normalizePath(newPath);

  if (oldPath === destination) {
    return json({ success: true, unchanged: true });
  }

  if (destination.startsWith(`${oldPath}/`)) {
    throw error(400, "Cannot move a folder inside itself");
  }

  const sourceResult = await db
    .select()
    .from(projectFiles)
    .where(
      and(
        eq(projectFiles.projectId, project.id),
        eq(projectFiles.path, oldPath),
      ),
    )
    .limit(1);

  const source = sourceResult[0];

  if (!source) {
    throw error(404, "Source not found");
  }

  const isFolder = source.type === "folder";

  const entries = isFolder
    ? await db
        .select()
        .from(projectFiles)
        .where(eq(projectFiles.projectId, project.id))
    : [source];

  const affected = entries.filter(
    (entry) => entry.path === oldPath || entry.path.startsWith(`${oldPath}/`),
  );

  const destinations = affected.map((entry) =>
    entry.path === oldPath
      ? destination
      : `${destination}${entry.path.slice(oldPath.length)}`,
  );

  // Check that destination paths are not occupied
  // by entries outside the source being renamed.
  for (const targetPath of destinations) {
    const conflict = await db
      .select()
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, project.id),
          eq(projectFiles.path, targetPath),
        ),
      )
      .limit(1);

    if (conflict[0] && !affected.some((entry) => entry.id === conflict[0].id)) {
      throw error(409, `Destination already exists: ${targetPath}`);
    }
  }

  // Create destination parent folders.
  await ensureParentFolders(project.id, destination);

  // Rename descendants before the parent.
  affected.sort((a, b) => b.path.length - a.path.length);

  for (const entry of affected) {
    const targetPath =
      entry.path === oldPath
        ? destination
        : `${destination}${entry.path.slice(oldPath.length)}`;

    await db
      .update(projectFiles)
      .set({
        path: targetPath,
        updatedAt: new Date(),
      })
      .where(eq(projectFiles.id, entry.id));
  }

  return json({
    success: true,
    oldPath,
    newPath: destination,
    renamed: affected.length,
  });
}
