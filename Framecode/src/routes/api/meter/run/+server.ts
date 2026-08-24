import { json, error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users, projects, meterRuns } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import {
  fetchRepoFileTree,
  fetchRepoFileContent,
} from "$lib/server/services/github.js";
import { analyzeConversion } from "$lib/server/services/gemini.js";

function findEntryFile(fileTree: { path: string }[]) {
  return (
    fileTree.find(
      (file) =>
        file.path.includes("+page.svelte") ||
        file.path.includes("App.jsx") ||
        file.path.includes("App.tsx") ||
        file.path.includes("App.vue") ||
        file.path.includes("index.astro") ||
        file.path.includes("src/index.ts") ||
        file.path.includes("index.js"),
    ) ?? fileTree[0]
  );
}

export async function POST({ request, locals }) {
  if (!locals.user) error(401, "Unauthorized");

  const { projectId } = await request.json();
  if (!projectId) error(400, "Missing projectId");

  const projectResult = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, locals.user.id)))
    .limit(1);

  const project = projectResult[0];
  if (!project) error(404, "Project not found");
  if (!project.repoUrl) error(400, "Project has no linked GitHub repo");

  const userResult = await db
    .select({ githubToken: users.githubToken })
    .from(users)
    .where(eq(users.id, locals.user.id))
    .limit(1);

  const token = userResult[0]?.githubToken;
  if (!token) error(400, "No GitHub token linked");

  const [owner, repo] = project.repoUrl
    .replace("https://github.com/", "")
    .split("/");

  const fileTree = await fetchRepoFileTree(token, owner, repo);
  if (fileTree.length === 0) error(404, "Could not read repo files");

  const entryFile = findEntryFile(fileTree);
  const content = await fetchRepoFileContent(
    token,
    owner,
    repo,
    entryFile.path,
  );
  if (!content) error(404, "Could not read entry file");

  const analysis = await analyzeConversion(content, entryFile.path);

  await db
    .update(projects)
    .set({
      meterScore: analysis.score,
      meterData: JSON.stringify(analysis),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, project.id));

  await db.insert(meterRuns).values({
    projectId: project.id,
    userId: locals.user.id,
    url: project.repoUrl,
    score: analysis.score,
    data: JSON.stringify(analysis),
  });

  return json({ entryFile: entryFile.path, ...analysis });
}
