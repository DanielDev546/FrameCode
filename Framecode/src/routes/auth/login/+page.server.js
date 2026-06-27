import { fail, redirect } from "@sveltejs/kit";
import {
  findUserByEmail,
  verifyPassword,
  createJWT,
} from "$lib/server/services/auth.js";

/** @type {import('./$types').Actions} */
export const actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get("email")?.trim().toLowerCase();
    const password = data.get("password");

    if (!email || !password) {
      return fail(400, { error: "Email and password are required." });
    }

    const user = await findUserByEmail(email);

    if (!user || !user.passwordHash) {
      await verifyPassword(
        "dummy",
        "$2b$12$dummyhashfortimingpreventiondummydummy00",
      );
      return fail(401, { error: "Invalid email or password." });
    }
    //Google Sign-in___________________
    if (user && user.passwordHash === null) {
      throw new Error("This account uses Google Sign-In.");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return fail(401, { error: "Invalid email or password." });
    }

    const token = await createJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
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
