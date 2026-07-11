// @ts-nocheck
import { error } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { db } from "$lib/server/db/index.js";
import { users, projects } from "$lib/server/db/schema.js";

export async function load({ params, locals }) {
  if (!locals.user) error(401, "Unauthorized");

  // Load project from DB
  const result = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, params.projectId),
        eq(projects.userId, locals.user.id),
      ),
    )
    .limit(1);

  if (!result[0]) error(404, "Project not found");
  const project = result[0];

  // Get GitHub token
  const userResult = await db
    .select({ githubToken: users.githubToken })
    .from(users)
    .where(eq(users.id, locals.user.id))
    .limit(1);

  const githubToken = userResult[0]?.githubToken ?? null;

  // If GitHub-linked, fetch file tree
  let fileTree = [];

  if (project.repoUrl && githubToken) {
    try {
      const [owner, repo] = project.repoUrl
        .replace("https://github.com/", "")
        .split("/");

      // Get default branch
      const repoRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/json",
          },
        },
      );
      const repoData = await repoRes.json();
      const branch = repoData.default_branch ?? "main";

      // Get full file tree
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/json",
          },
        },
      );
      const treeData = await treeRes.json();

      fileTree = (treeData.tree ?? [])
        .filter((f) => f.type === "blob")
        .map((f) => ({ path: f.path, sha: f.sha, size: f.size }))
        .slice(0, 100);
    } catch (e) {
      console.error("[IDE] GitHub tree fetch failed:", e.message);
    }
  }

  return {
    project,
    fileTree,
    githubToken,
    hasGitHub: !!project.repoUrl && !!githubToken,
  };
}
