import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import bcrypt from "bcryptjs";

import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { users } from "../db/schema.js";

import { JWT_SECRET } from "$env/static/private";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type AuthJWTPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
  plan: string;
};

// ─────────────────────────────────────────────
// JWT
// ─────────────────────────────────────────────

export function createJWT(payload: AuthJWTPayload) {
  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyJWT(token: string): AuthJWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded !== "object" || decoded === null) {
      return null;
    }

    const payload = decoded as JwtPayload & Partial<AuthJWTPayload>;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      plan: typeof payload.plan === "string" ? payload.plan : "free",
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// PASSWORDS
// ─────────────────────────────────────────────

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// ─────────────────────────────────────────────
// USER QUERIES
// ─────────────────────────────────────────────

export async function findUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] ?? null;
}

// ─────────────────────────────────────────────
// EMAIL USER
// ─────────────────────────────────────────────

export async function createEmailUser({
  name,
  email,
  passwordHash,
}: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const result = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      provider: "email",
      role: "user",
    })
    .returning();

  return result[0];
}

// ─────────────────────────────────────────────
// OAUTH USER
// ─────────────────────────────────────────────
export async function upsertOAuthUser({
  email,
  name,
  avatar,
  provider,
  providerId,
  githubUsername,
  githubToken = null,
}: {
  email: string;
  name: string;
  avatar?: string | null;
  provider: "github" | "google";
  providerId: string;
  githubUsername?: string | null;
  githubToken?: string | null;
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
        githubUsername,
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
      githubUsername,
      githubToken,
      role: "user",
    })
    .returning();

  return created[0];
}

// ─────────────────────────────────────────────
// EMAIL CHANGE TOKEN
// ─────────────────────────────────────────────

export function createEmailChangeToken(payload: {
  userId: string;
  newEmail: string;
}) {
  const options: SignOptions = {
    expiresIn: "1h",
  };

  return jwt.sign({ type: "email_change", ...payload }, JWT_SECRET, options);
}

export function verifyEmailChangeToken(
  token: string,
): { userId: string; newEmail: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded !== "object" || decoded === null) {
      return null;
    }

    const payload = decoded as JwtPayload & {
      type?: string;
      userId?: string;
      newEmail?: string;
    };

    if (
      payload.type !== "email_change" ||
      typeof payload.userId !== "string" ||
      typeof payload.newEmail !== "string"
    ) {
      return null;
    }

    return { userId: payload.userId, newEmail: payload.newEmail };
  } catch {
    return null;
  }
}
