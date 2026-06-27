import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { JWT_SECRET } from "$env/static/private";

console.log("JWT_SECRET:", JWT_SECRET);

// ── JWT ───────────────────────────────────────────
export async function createJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ── Passwords ─────────────────────────────────────
export async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ── User queries ──────────────────────────────────
export async function findUserByEmail(email) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0] ?? null;
}

export async function createEmailUser({ name, email, passwordHash }) {
  const result = await db
    .insert(users)
    .values({ name, email, passwordHash, provider: "email", role: "user" })
    .returning();
  return result[0];
}

export async function upsertOAuthUser({
  email,
  name,
  avatar,
  provider,
  providerId,
  githubToken = null,
}) {
  const existing = await findUserByEmail(email);

  if (existing) {
    const updated = await db
      .update(users)
      .set({
        name,
        avatar,
        provider,
        providerId,
        githubToken,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email))
      .returning();
    return updated[0];
  }

  const created = await db
    .insert(users)
    .values({
      email,
      name,
      avatar,
      provider,
      providerId,
      githubToken,
      role: "user",
    })
    .returning();
  return created[0];
}
