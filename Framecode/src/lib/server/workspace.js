import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { db } from "$lib/server/db/index.js";
import { projects, projectFiles } from "$lib/server/db/schema.js";

export function normalizePath(path) {
  if (typeof path !== "string" || !path.trim()) {
    throw error(400, "A file path is required");
  }

  const normalized = path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");

  if (
    !normalized ||
    normalized
      .split("/")
      .some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw error(400, "Invalid file path");
  }

  return normalized;
}

export async function getOwnedProject(projectId, userId) {
  if (!projectId) {
    throw error(400, "projectId is required");
  }

  const result = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);

  if (!result[0]) {
    throw error(404, "Project not found");
  }

  return result[0];
}

export async function ensureFolder(projectId, folderPath) {
  const path = normalizePath(folderPath);

  const existing = await db
    .select()
    .from(projectFiles)
    .where(
      and(eq(projectFiles.projectId, projectId), eq(projectFiles.path, path)),
    )
    .limit(1);

  if (existing[0]) {
    if (existing[0].type !== "folder") {
      throw error(409, `${path} already exists as a file`);
    }

    return existing[0];
  }

  const created = await db
    .insert(projectFiles)
    .values({
      projectId,
      path,
      type: "folder",
      content: "",
    })
    .returning();

  return created[0];
}

export async function ensureParentFolders(projectId, path) {
  const segments = path.split("/");
  segments.pop();

  let current = "";

  for (const segment of segments) {
    current = current ? `${current}/${segment}` : segment;
    await ensureFolder(projectId, current);
  }
}

export async function migrateScaffold(project) {
  let metadata = {};

  try {
    metadata = project.meterData ? JSON.parse(project.meterData) : {};
  } catch {
    metadata = {};
  }

  const scaffold = metadata.scaffold ?? {};

  for (const [rawPath, content] of Object.entries(scaffold)) {
    const path = normalizePath(rawPath);

    await ensureParentFolders(project.id, path);

    const existing = await db
      .select()
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, project.id),
          eq(projectFiles.path, path),
        ),
      )
      .limit(1);

    if (existing[0]) continue;

    await db.insert(projectFiles).values({
      projectId: project.id,
      path,
      type: "file",
      content:
        typeof content === "string"
          ? content
          : JSON.stringify(content, null, 2),
    });
  }

  return scaffold;
}

export async function initializeWorkspace(projectId, userId) {
  const project = await getOwnedProject(projectId, userId);
  await migrateScaffold(project);
  return project;
}

export function buildFileTree(files) {
  const root = [];

  for (const file of files) {
    const segments = file.path.split("/");
    let current = root;

    for (let i = 0; i < segments.length; i++) {
      const name = segments[i];
      const fullPath = segments.slice(0, i + 1).join("/");
      const isLast = i === segments.length - 1;

      let node = current.find((item) => item.path === fullPath);

      if (!node) {
        node = {
          name,
          path: fullPath,
          type: isLast ? file.type : "folder",
          children: [],
        };

        current.push(node);
      }

      if (isLast && file.type === "file") {
        node.content = file.content ?? "";
      }

      current = node.children;
    }
  }

  function sortNodes(nodes) {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });

    for (const node of nodes) {
      sortNodes(node.children);
    }

    return nodes;
  }

  return sortNodes(root);
}
