import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function load({ locals }) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, locals.user.id),
  });

  return {
    user,
  };
}
