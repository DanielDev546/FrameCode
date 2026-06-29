// @ts-nocheck
import { json, error } from "@sveltejs/kit";
import { fetchUserRepos } from "$lib/server/services/github.js";

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals }) {
  if (!locals.user) error(401, "Unauthorized");

  const repos = await fetchUserRepos(locals.user.id);
  return json(repos);
}
