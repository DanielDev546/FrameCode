import { json, error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

import { db } from "$lib/server/db/index.js";
import { projectFiles } from "$lib/server/db/schema.js";

import {
  initializeWorkspace,
  normalizePath,
  ensureParentFolders,
} from "$lib/server/workspace.js";

export async function GET({ url, locals }) {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }

  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
    throw error(400, "projectId is required");
  }

  const project = await initializeWorkspace(projectId, locals.user.id);

  const requestedPath = url.searchParams.get("path");

  // No path means return the entire workspace tree.
  if (!requestedPath) {
    const files = await db
      .select()
      .from(projectFiles)
      .where(eq(projectFiles.projectId, project.id));

    return json({
      success: true,
      files,
    });
  }

  // A path means retrieve one specific file.
  const path = normalizePath(requestedPath);

  const result = await db
    .select()
    .from(projectFiles)
    .where(
      and(eq(projectFiles.projectId, project.id), eq(projectFiles.path, path)),
    )
    .limit(1);

  if (!result[0]) {
    throw error(404, "File not found");
  }

  if (result[0].type !== "file") {
    throw error(400, "The requested path is a folder");
  }

  return json({
    success: true,
    file: result[0],
  });
}

// Create a new file.
export async function POST({ request, locals }) {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }

  const { projectId, path, content = "" } = await request.json();

  if (!projectId || !path) {
    throw error(400, "projectId and path are required");
  }

  if (typeof content !== "string") {
    throw error(400, "File content must be a string");
  }

  const project = await initializeWorkspace(projectId, locals.user.id);

  const normalizedPath = normalizePath(path);

  await ensureParentFolders(project.id, normalizedPath);

  const existing = await db
    .select()
    .from(projectFiles)
    .where(
      and(
        eq(projectFiles.projectId, project.id),
        eq(projectFiles.path, normalizedPath),
      ),
    )
    .limit(1);

  if (existing[0]) {
    throw error(409, "A file or folder already exists at this path");
  }

  const [file] = await db
    .insert(projectFiles)
    .values({
      projectId: project.id,
      path: normalizedPath,
      type: "file",
      content,
    })
    .returning();

  return json(
    {
      success: true,
      file,
    },
    { status: 201 },
  );
}

// Save or update file content.
export async function PUT({ request, locals }) {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }

  const { projectId, path, content } = await request.json();

  if (!projectId || !path || content === undefined) {
    throw error(400, "projectId, path and content are required");
  }

  if (typeof content !== "string") {
    throw error(400, "File content must be a string");
  }

  const project = await initializeWorkspace(projectId, locals.user.id);

  const normalizedPath = normalizePath(path);

  await ensureParentFolders(project.id, normalizedPath);

  const existing = await db
    .select()
    .from(projectFiles)
    .where(
      and(
        eq(projectFiles.projectId, project.id),
        eq(projectFiles.path, normalizedPath),
      ),
    )
    .limit(1);

  if (existing[0] && existing[0].type !== "file") {
    throw error(400, "Cannot save content to a folder");
  }

  if (existing[0]) {
    await db
      .update(projectFiles)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectFiles.projectId, project.id),
          eq(projectFiles.path, normalizedPath),
        ),
      );
  } else {
    await db.insert(projectFiles).values({
      projectId: project.id,
      path: normalizedPath,
      type: "file",
      content,
    });
  }

  return json({
    success: true,
    saved: true,
    projectId,
    path: normalizedPath,
  });
}
