import { redirect, error, isRedirect } from "@sveltejs/kit";
import { createJWT, upsertOAuthUser } from "$lib/server/services/auth.js";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
  const code = url.searchParams.get("code");
  if (!code) error(400, "Missing OAuth code");

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: "http://localhost:5173/auth/google/callback",
        grant_type: "authorization_code",
      }),
    });
    const { access_token } = await tokenRes.json();
    if (!access_token) throw new Error("Token exchange failed");

    // Fetch user info
    const infoRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );
    const info = await infoRes.json();
    if (!info.email) throw new Error("Could not retrieve email from Google");

    // Upsert user in DB
    const user = await upsertOAuthUser({
      email: info.email,
      name: info.name,
      avatar: info.picture,
      provider: "google",
      providerId: info.id,
    });

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
    if (isRedirect(err)) throw err;
    console.error("[Google OAuth]", err.message);
    redirect(302, "/auth/login?error=oauth_failed");
  }
}
