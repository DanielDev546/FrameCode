// @ts-nocheck
import { json, error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db/index.js";
import { users } from "$lib/server/db/schema.js";

export async function GET({ url, locals }) {
  if (!locals.user) error(401, "Unauthorized");

  const owner = url.searchParams.get("owner");
  const repo = url.searchParams.get("repo");
  const path = url.searchParams.get("path");

  if (!owner || !repo || !path) error(400, "Missing params");

  // Get GitHub token
  const result = await db
    .select({ githubToken: users.githubToken })
    .from(users)
    .where(eq(users.id, locals.user.id))
    .limit(1);

  const token = result[0]?.githubToken;
  if (!token) error(400, "No GitHub token");

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    },
  );

  if (!res.ok) error(404, "File not found");

  const data = await res.json();
  const content = atob(data.content.replace(/\n/g, "")); // decode base64

  return json({ content, sha: data.sha });
}
