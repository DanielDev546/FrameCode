import { redirect, error, isRedirect } from "@sveltejs/kit";
import { createJWT, upsertOAuthUser } from "$lib/server/services/auth.js";

import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "$env/static/private";

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
  const code = url.searchParams.get("code");
  if (!code) error(400, "Missing OAuth code");
  console.log("STEP 1 - code:", code);

  try {
    // Exchange code for access token
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: "http://localhost:5173/auth/github/callback",
        }),
      },
    );
    const { access_token } = await tokenRes.json();
    if (!access_token) throw new Error("Token exchange failed");
    console.log("STEP 2 - access_token:", access_token ? "YES" : "NO");

    // Fetch profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    });
    const profile = await profileRes.json();
    console.log("STEP 3 - profile:", profile.login, profile.message);

    // Fetch primary email
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    });
    const emails = await emailsRes.json();
    const primary = emails.find((e) => e.primary && e.verified);

    // Upsert user in DB
    const user = await upsertOAuthUser({
      email: primary?.email ?? profile.email,
      name: profile.name ?? profile.login,
      avatar: profile.avatar_url,
      provider: "github",
      providerId: String(profile.id),
      githubToken: access_token, // ← add this
    });
    console.log("STEP 4 - user:", user.id);

    // Issue JWT
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
  } catch (err) {
    if (isRedirect(err)) throw err; // ← add this line first

    console.error("[GitHub OAuth] FAILED AT:", err.message, err.stack);
    redirect(302, "/auth/login?error=oauth_failed");
  }
}
