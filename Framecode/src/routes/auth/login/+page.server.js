import { fail, redirect } from "@sveltejs/kit";

import {
  findUserByEmail,
  verifyPassword,
  createJWT,
} from "$lib/server/services/auth.js";

export const actions = {
  login: async ({ request, cookies, url }) => {
    const data = await request.formData();

    const emailValue = data.get("email");
    const passwordValue = data.get("password");

    const email =
      typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";

    const password = typeof passwordValue === "string" ? passwordValue : "";

    // ─────────────────────────────────────────
    // VALIDATION
    // ─────────────────────────────────────────

    if (!email || !password) {
      return fail(400, {
        error: "Please enter your email and password.",
      });
    }

    // ─────────────────────────────────────────
    // FIND USER
    // ─────────────────────────────────────────

    const user = await findUserByEmail(email);

    if (!user || !user.passwordHash) {
      return fail(401, {
        error: "Invalid email or password.",
      });
    }

    // ─────────────────────────────────────────
    // VERIFY PASSWORD
    // ─────────────────────────────────────────

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      return fail(401, {
        error: "Invalid email or password.",
      });
    }

    // ─────────────────────────────────────────
    // CREATE JWT
    // ─────────────────────────────────────────

    const token = await createJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan ?? "free",
    });

    // ─────────────────────────────────────────
    // COOKIE
    // ─────────────────────────────────────────

    cookies.set("fc_token", token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // ─────────────────────────────────────────
    // REDIRECT
    // ─────────────────────────────────────────

    const redirectParam = url.searchParams.get("redirect");

    if (redirectParam && redirectParam.startsWith("/")) {
      throw redirect(302, redirectParam);
    }

    throw redirect(302, "/dashboard");
  },
};
