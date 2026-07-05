// @ts-nocheck
import { json, error } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { db } from "$lib/server/db/index.js";
import { projects, activityLog } from "$lib/server/db/schema.js";

export async function DELETE({ params, locals }) {
  if (!locals.user) error(401, "Unauthorized");

  const { id } = params;

  // Verify ownership before deleting
  const existing = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, locals.user.id)))
    .limit(1);

  if (!existing[0]) error(404, "Project not found");

  // Delete the project
  await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, locals.user.id)));

  // Log activity
  await db.insert(activityLog).values({
    userId: locals.user.id,
    type: "project_deleted",
    message: `Deleted project "${existing[0].name}"`,
  });

  return json({ success: true });
}
