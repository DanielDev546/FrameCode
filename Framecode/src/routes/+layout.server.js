import {
  getUserProjects,
  getUserActivity,
} from "$lib/server/services/project.js";

export async function load({ locals }) {
  const [projects, activity] = await Promise.all([
    getUserProjects(locals.user.id),
    getUserActivity(locals.user.id, 10),
  ]);

  return { user: locals.user, projects, activity };
}
