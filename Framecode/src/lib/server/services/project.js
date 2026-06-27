import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { projects, activityLog } from "../db/schema.js";

export async function getUserProjects(userId) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.updatedAt));
}

export async function getUserActivity(userId, limit = 10) {
  return db
    .select()
    .from(activityLog)
    .where(eq(activityLog.userId, userId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}
