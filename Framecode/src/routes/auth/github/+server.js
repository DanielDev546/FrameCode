import { redirect } from "@sveltejs/kit";
import { GITHUB_CLIENT_ID } from "$env/static/private";

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", GITHUB_CLIENT_ID);
  authUrl.searchParams.set(
    "redirect_uri",
    `${url.origin}/auth/github/callback`,
  );
  authUrl.searchParams.set("scope", "read:user user:email");

  redirect(302, authUrl.toString());
}
