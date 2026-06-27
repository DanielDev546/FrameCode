import { fail, redirect } from "@sveltejs/kit";
import {
  findUserByEmail,
  hashPassword,
  createEmailUser,
  createJWT,
} from "$lib/server/services/auth.js";

/** @type {import('./$types').Actions} */
export const actions = {
  signup: async ({ request, cookies }) => {
    const data = await request.formData();
    const name = data.get("name")?.trim();
    const email = data.get("email")?.trim().toLowerCase();
    const password = data.get("password");

    // ── Validation ────────────────────────────────
    if (!name || name.length < 2) {
      return fail(400, { error: "Please enter your full name." });
    }
    if (!email || !email.includes("@")) {
      return fail(400, { error: "Please enter a valid email address." });
    }
    if (!password || password.length < 8) {
      return fail(400, { error: "Password must be at least 8 characters." });
    }

    // ── Check duplicate ───────────────────────────
    const existing = await findUserByEmail(email);
    if (existing) {
      return fail(409, { error: "An account with that email already exists." });
    }

    // ── Create user ───────────────────────────────
    const passwordHash = await hashPassword(password);
    const user = await createEmailUser({ name, email, passwordHash });

    // ── Issue JWT ─────────────────────────────────
    const token = await createJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan ?? "free",
    });

    cookies.set("fc_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    redirect(302, "/dashboard");
  },
};
