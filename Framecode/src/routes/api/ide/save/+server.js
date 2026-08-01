// @ts-nocheck
import { json, error } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { db } from "$lib/server/db/index.js";
import { users, projects } from "$lib/server/db/schema.js";

export async function POST({ request, locals }) {
  if (!locals.user) error(401, "Unauthorized");

  const { projectId, path, content } = await request.json();

  if (!projectId || !path || content === undefined) {
    error(400, "Missing projectId, path or content");
  }

  // Get project + verify ownership
  const projectResult = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, locals.user.id)))
    .limit(1);

  if (!projectResult[0]) error(404, "Project not found");
  const project = projectResult[0];

  // ── GitHub-linked project ─────────────────────
  if (project.repoUrl) {
    const userResult = await db
      .select({ githubToken: users.githubToken })
      .from(users)
      .where(eq(users.id, locals.user.id))
      .limit(1);

    const token = userResult[0]?.githubToken;
    if (!token) error(400, "No GitHub token found");

    const [owner, repo] = project.repoUrl
      .replace("https://github.com/", "")
      .split("/");

    // Get current file SHA (needed for updates)
    const getRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );

    let sha = null;
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }

    // Write file to GitHub
    const putRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Update ${path}`,
          content: btoa(unescape(encodeURIComponent(content))),
          ...(sha ? { sha } : {}),
        }),
      },
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      error(500, err.message ?? "GitHub write failed");
    }

    return json({ saved: true, target: "github" });
  }

  // ── FC-only project — save to DB ──────────────
  let currentMeta = {};
  if (project.meterData) {
    try {
      currentMeta = JSON.parse(project.meterData);
    } catch {
      /* empty */
    }
  }

  const scaffold = currentMeta.scaffold ?? {};
  scaffold[path] = content;

  await db
    .update(projects)
    .set({
      meterData: JSON.stringify({ ...currentMeta, scaffold }),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));

  return json({ saved: true, target: "db" });
}
