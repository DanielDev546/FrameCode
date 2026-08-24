// @ts-nocheck
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, projects } from "../db/schema.js";

export async function fetchUserRepos(userId) {
  const result = await db
    .select({ githubToken: users.githubToken })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const token = result[0]?.githubToken;
  if (!token) return [];

  const res = await fetch(
    "https://api.github.com/user/repos?sort=updated&per_page=30",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  );

  if (!res.ok) return [];

  const repos = await res.json();

  return repos.map((repo) => ({
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    updatedAt: repo.updated_at,
    isPrivate: repo.private,
    cloneUrl: repo.clone_url,
  }));
}

export async function importRepoAsProject(userId, repo) {
  const existing = await db
    .select()
    .from(projects)
    .where(eq(projects.repoUrl, repo.url))
    .limit(1);

  if (existing[0]) return existing[0];

  const created = await db
    .insert(projects)
    .values({
      userId,
      name: repo.name,
      slug: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      framework: repo.language ?? "unknown",
      repoUrl: repo.url,
      status: "dev",
    })
    .returning();

  return created[0];
}

export async function fetchRepoFileTree(token, owner, repo) {
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!repoRes.ok) return [];
  const repoData = await repoRes.json();
  const branch = repoData.default_branch ?? "main";

  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    },
  );
  if (!treeRes.ok) return [];
  const treeData = await treeRes.json();

  return (treeData.tree ?? [])
    .filter((f) => f.type === "blob")
    .map((f) => ({ path: f.path, sha: f.sha, size: f.size }))
    .slice(0, 100);
}

export async function fetchRepoFileContent(token, owner, repo, path) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return atob(data.content.replace(/\n/g, ""));
}
