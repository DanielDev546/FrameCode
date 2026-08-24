import { redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users, templates } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function load({ locals }) {
  if (!locals.user) {
    redirect(302, "/auth/login");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, locals.user.id),
  });

  const templateList = await db.select().from(templates);

  return {
    user,
    templates: templateList,
  };
}
