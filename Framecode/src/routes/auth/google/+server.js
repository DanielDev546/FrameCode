import { redirect } from "@sveltejs/kit";
import { GOOGLE_CLIENT_ID } from "$env/static/private";

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.set(
    "redirect_uri",
    "http://localhost:5173/auth/google/callback",
  );
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("access_type", "offline");

  redirect(302, authUrl.toString());
}
