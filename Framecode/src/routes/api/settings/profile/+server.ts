// src/routes/api/settings/profile/+server.ts

import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { eq, and, ne } from "drizzle-orm";

export async function PATCH({ request, locals }) {
  // -----------------------------
  // Authentication
  // -----------------------------

  if (!locals.user) {
    return json({ message: "Unauthorized" }, { status: 401 });
  }

  // -----------------------------
  // Read request body
  // -----------------------------

  const { name, username, bio, website, location } = await request.json();

  // -----------------------------
  // Validation
  // -----------------------------

  if (!name?.trim()) {
    return json({ message: "Display name is required." }, { status: 400 });
  }

  if (!username?.trim()) {
    return json({ message: "Username is required." }, { status: 400 });
  }

  if (username.length < 3) {
    return json(
      { message: "Username must be at least 3 characters." },
      { status: 400 },
    );
  }

  if (bio && bio.length > 200) {
    return json({ message: "Bio is too long." }, { status: 400 });
  }

  // -----------------------------
  // Check username uniqueness
  // -----------------------------

  const existing = await db.query.users.findFirst({
    where: and(eq(users.username, username), ne(users.id, locals.user.id)),
  });

  if (existing) {
    return json({ message: "Username already exists." }, { status: 409 });
  }

  // -----------------------------
  // Update profile
  // -----------------------------

  await db
    .update(users)
    .set({
      name: name.trim(),
      username: username.trim(),
      bio: bio?.trim() ?? "",
      website: website?.trim() ?? "",
      location: location?.trim() ?? "",
      updatedAt: new Date(),
    })
    .where(eq(users.id, locals.user.id));

  // -----------------------------
  // Return updated user
  // -----------------------------

  const updatedUser = await db.query.users.findFirst({
    where: eq(users.id, locals.user.id),
    columns: {
      id: true,
      name: true,
      username: true,
      bio: true,
      website: true,
      location: true,
      avatar: true,
    },
  });

  return json({
    success: true,
    message: "Profile updated successfully.",
    user: updatedUser,
  });
}
