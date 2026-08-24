import { redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users, projects } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function load({ locals }) {
  if (!locals.user) {
    redirect(302, "/auth/login");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, locals.user.id),
  });

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, locals.user.id));

  return {
    user,
    projects: userProjects,
  };
}
