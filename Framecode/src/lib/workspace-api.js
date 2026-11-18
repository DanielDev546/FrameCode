async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message ?? result.error ?? "Workspace request failed",
    );
  }

  return result;
}

export const workspaceAPI = {
  list(projectId) {
    return request(
      `/api/workspace/files?projectId=${encodeURIComponent(projectId)}`,
    );
  },

  read(projectId, path) {
    return request(
      `/api/workspace/file?projectId=${encodeURIComponent(projectId)}&path=${encodeURIComponent(path)}`,
    );
  },

  create(projectId, path, type = "file", content = "") {
    return request("/api/workspace/files", {
      method: "POST",
      body: JSON.stringify({
        projectId,
        path,
        type,
        content,
      }),
    });
  },

  createFolder(projectId, path) {
    return request("/api/workspace/folder", {
      method: "POST",
      body: JSON.stringify({ projectId, path }),
    });
  },

  save(projectId, path, content) {
    return request("/api/workspace/file", {
      method: "PUT",
      body: JSON.stringify({
        projectId,
        path,
        content,
      }),
    });
  },

  rename(projectId, path, newPath) {
    return request("/api/workspace/rename", {
      method: "POST",
      body: JSON.stringify({
        projectId,
        path,
        newPath,
      }),
    });
  },

  delete(projectId, path) {
    return request("/api/workspace/delete", {
      method: "DELETE",
      body: JSON.stringify({
        projectId,
        path,
      }),
    });
  },
};
