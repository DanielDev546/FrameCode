// @ts-nocheck
import { json, error } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { db } from "$lib/server/db/index.js";
import { projects } from "$lib/server/db/schema.js";

export async function POST({ request, locals }) {
  try {
    console.log("[IDE SAVE] Request received");

    // ─────────────────────────────────────
    // Authentication
    // ─────────────────────────────────────

    if (!locals.user) {
      console.log("[IDE SAVE] No authenticated user");
      return json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("[IDE SAVE] User:", locals.user.id);

    // ─────────────────────────────────────
    // Request body
    // ─────────────────────────────────────

    const { projectId, path, content } = await request.json();

    console.log("[IDE SAVE] projectId:", projectId);
    console.log("[IDE SAVE] path:", path);
    console.log("[IDE SAVE] content length:", content?.length);

    if (!projectId || !path || content === undefined) {
      return json(
        { message: "Missing projectId, path or content" },
        { status: 400 },
      );
    }

    // ─────────────────────────────────────
    // Find project
    // ─────────────────────────────────────

    const projectResult = await db
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.userId, locals.user.id)),
      )
      .limit(1);

    console.log("[IDE SAVE] Project found:", !!projectResult[0]);

    if (!projectResult[0]) {
      return json({ message: "Project not found" }, { status: 404 });
    }

    const project = projectResult[0];

    // ─────────────────────────────────────
    // Read existing meterData
    // ─────────────────────────────────────

    let currentMeta = {};

    if (project.meterData) {
      try {
        currentMeta = JSON.parse(project.meterData);
      } catch (parseError) {
        console.error("[IDE SAVE] meterData JSON parse failed:", parseError);

        currentMeta = {};
      }
    }

    // ─────────────────────────────────────
    // Update scaffold
    // ─────────────────────────────────────

    const scaffold = currentMeta.scaffold ?? {};

    scaffold[path] = content;

    console.log("[IDE SAVE] Saving file to FrameCode:", path);

    // ─────────────────────────────────────
    // Update project
    // ─────────────────────────────────────

    await db
      .update(projects)
      .set({
        meterData: JSON.stringify({
          ...currentMeta,
          scaffold,
        }),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    console.log("[IDE SAVE] Save successful");

    return json({
      saved: true,
      target: "framecode",
      path,
    });
  } catch (err) {
    console.error("[IDE SAVE] FAILED:", err);

    return json(
      {
        message: "Failed to save file",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
