import { redirect, error } from "@sveltejs/kit";
import { verifyEmailChangeToken } from "$lib/server/services/auth.js";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET({ url }) {
  const token = url.searchParams.get("token");

  if (!token) {
    error(400, "Missing token");
  }

  const payload = verifyEmailChangeToken(token);

  if (!payload) {
    redirect(302, "/settings?emailChange=invalid");
  }

  await db
    .update(users)
    .set({ email: payload.newEmail, updatedAt: new Date() })
    .where(eq(users.id, payload.userId));

  redirect(302, "/settings?emailChange=success");
}
