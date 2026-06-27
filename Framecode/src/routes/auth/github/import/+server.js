import { json, error } from "@sveltejs/kit";
import { importRepoAsProject } from "$lib/server/services/github.js";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
  if (!locals.user) error(401, "Unauthorized");

  const repo = await request.json();
  if (!repo.name || !repo.url) error(400, "Missing repo data");

  const project = await importRepoAsProject(locals.user.id, repo);
  return json(project);
}
