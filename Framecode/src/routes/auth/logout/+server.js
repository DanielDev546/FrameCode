import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies }) {
  cookies.delete("fc_token", { path: "/" });
  redirect(302, "/auth/login");
}
