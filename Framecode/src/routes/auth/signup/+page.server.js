import { fail, redirect } from "@sveltejs/kit";

import {
  findUserByEmail,
  hashPassword,
  createEmailUser,
  createJWT,
} from "$lib/server/services/auth.js";

export const actions = {
  signup: async ({ request, cookies }) => {
    const data = await request.formData();

    const nameValue = data.get("name");
    const emailValue = data.get("email");
    const passwordValue = data.get("password");

    const name = typeof nameValue === "string" ? nameValue.trim() : "";

    const email =
      typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";

    const password = typeof passwordValue === "string" ? passwordValue : "";

    // ─────────────────────────────────────────
    // VALIDATION
    // ─────────────────────────────────────────

    if (!name || name.length < 2) {
      return fail(400, {
        error: "Please enter your full name.",
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(400, {
        error: "Please enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return fail(400, {
        error: "Password must be at least 8 characters.",
      });
    }

    // ─────────────────────────────────────────
    // DUPLICATE CHECK
    // ─────────────────────────────────────────

    const existing = await findUserByEmail(email);

    if (existing) {
      return fail(409, {
        error: "An account with that email already exists.",
      });
    }

    // ─────────────────────────────────────────
    // CREATE USER
    // ─────────────────────────────────────────

    const passwordHash = await hashPassword(password);

    const user = await createEmailUser({
      name,
      email,
      passwordHash,
    });

    // ─────────────────────────────────────────
    // JWT
    // ─────────────────────────────────────────

    const token = await createJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan ?? "free",
    });

    // ─────────────────────────────────────────
    // SESSION COOKIE
    // ─────────────────────────────────────────

    cookies.set("fc_token", token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    throw redirect(302, "/dashboard");
  },
};
