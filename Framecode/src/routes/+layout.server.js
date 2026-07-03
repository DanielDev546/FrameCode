import {
  getUserProjects,
  getUserActivity,
} from "$lib/server/services/project.js";

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
  // Not logged in — return empty data, don't crash
  if (!locals.user) {
    return { user: null, projects: [], activity: [] };
  }

  const [projects, activity] = await Promise.all([
    getUserProjects(locals.user.id),
    getUserActivity(locals.user.id, 10),
  ]);

  return { user: locals.user, projects, activity };
}
