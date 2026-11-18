import { json, error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { db } from "$lib/server/db/index.js";
import { projects, projectFiles } from "$lib/server/db/schema.js";

import {
  initializeWorkspace,
  normalizePath,
  ensureParentFolders,
} from "$lib/server/workspace.js";

export async function POST({ request, locals }) {
  if (!locals.user) {
    return json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId, path, content } = await request.json();

    if (!projectId || !path || content === undefined) {
      return json(
        { message: "Missing projectId, path or content" },
        { status: 400 },
      );
    }

    if (typeof content !== "string") {
      return json({ message: "Content must be a string" }, { status: 400 });
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
      return json({ message: "Cannot save a folder" }, { status: 400 });
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

    // Keep legacy scaffold metadata synchronized.
    const metadata = project.meterData ? JSON.parse(project.meterData) : {};

    const scaffold = metadata.scaffold ?? {};
    scaffold[normalizedPath] = content;

    await db
      .update(projects)
      .set({
        meterData: JSON.stringify({
          ...metadata,
          scaffold,
        }),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, project.id));

    return json({
      saved: true,
      target: "framecode",
      path: normalizedPath,
    });
  } catch (err) {
    console.error("[IDE SAVE]", err);

    if (err?.status) throw err;

    return json(
      {
        message: "Failed to save file",
        error: err.message,
      },
      { status: 500 },
    );
  }
}
