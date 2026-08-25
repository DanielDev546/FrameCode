import { redirect, error, isRedirect } from "@sveltejs/kit";
import { createJWT, upsertOAuthUser } from "$lib/server/services/auth.js";
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "$env/static/private";

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
  const code = url.searchParams.get("code");

  if (!code) {
    throw error(400, "Missing OAuth code");
  }

  console.log("STEP 1 - code received");

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
          redirect_uri: `${url.origin}/auth/github/callback`,
        }),
      },
    );

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(
        tokenData.error_description ||
          tokenData.error ||
          "GitHub token exchange failed",
      );
    }

    const access_token = tokenData.access_token;

    console.log("STEP 2 - access_token: YES");

    // Fetch GitHub profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!profileRes.ok) {
      throw new Error(`GitHub profile request failed: ${profileRes.status}`);
    }

    const profile = await profileRes.json();

    console.log("STEP 3 - profile:", profile.login);

    // Fetch GitHub emails
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!emailsRes.ok) {
      throw new Error(`GitHub email request failed: ${emailsRes.status}`);
    }

    const emails = await emailsRes.json();

    const primary = emails.find(
      /** @param {{ primary?: boolean; verified?: boolean; email?: string }} e */
      (e) => e.primary && e.verified,
    );

    const email = primary?.email ?? profile.email;

    if (!email) {
      throw new Error("Could not retrieve a verified GitHub email");
    }

    // Upsert user
    const user = await upsertOAuthUser({
      email,
      name: profile.name ?? profile.login,
      avatar: profile.avatar_url,
      provider: "github",
      providerId: String(profile.id),
      githubUsername: profile.login,
      githubToken: access_token,
    });

    if (!user) {
      throw new Error("Failed to create or update GitHub user");
    }

    console.log("STEP 4 - user:", user.id);

    // Create JWT
    const token = await createJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan ?? "free",
    });

    // Set authentication cookie
    cookies.set("fc_token", token, {
      httpOnly: true,
      secure: url.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    redirect(302, "/dashboard");
  } catch (err) {
    if (isRedirect(err)) {
      throw err;
    }

    const message = err instanceof Error ? err.message : String(err);

    console.error("[GitHub OAuth] FAILED:", message);

    throw error(500, `GitHub OAuth failed: ${message}`);
  }
}
