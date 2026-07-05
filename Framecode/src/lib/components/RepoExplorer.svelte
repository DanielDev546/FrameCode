<script lang="ts">
  import TreeNode, { type Node } from './TreeNode.svelte';

  type Repo = { name: string; owner: string; defaultBranch: string };
  type FlatEntry = { path: string; type: string; sha: string };

  // Pass this in from your dashboard — you already have repos loaded,
  // just map them to { name, owner, defaultBranch } shape.
  export let repos: Repo[] = [];

  // Fired when a file is clicked, so your IDE page/store can load it into the editor.
  export let onOpenFile: (payload: {
    owner: string;
    repo: string;
    path: string;
    ref: string;
  }) => void = () => {};

  let selectedRepo: Repo | null = null;
  let flatTree: FlatEntry[] = [];
  let loading = false;
  let errorMsg = '';
  let expanded = new Set<string>();

  function buildTree(flat: FlatEntry[]): Node[] {
    const root: Node[] = [];
    const map = new Map<string, Node>();

    for (const item of flat) {
      const parts = item.path.split('/');
      let currentPath = '';
      let siblings = root;

      parts.forEach((part, i) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLeaf = i === parts.length - 1;
        let node = map.get(currentPath);

        if (!node) {
          node = {
            name: part,
            path: currentPath,
            type: isLeaf ? (item.type as 'blob' | 'tree') : 'tree',
            children: []
          };
          map.set(currentPath, node);
          siblings.push(node);
        }
        siblings = node.children;
      });
    }
    return root;
  }

  $: nodes = buildTree(flatTree);

  async function selectRepo(name: string) {
    const repo = repos.find((r) => r.name === name) ?? null;
    selectedRepo = repo;
    flatTree = [];
    errorMsg = '';
    expanded = new Set();
    if (!repo) return;

    loading = true;
    try {
      const res = await fetch(
        `/api/github/tree?owner=${repo.owner}&repo=${repo.name}&branch=${repo.defaultBranch}`
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      flatTree = data.tree.filter((t: FlatEntry) => t.type === 'blob' || t.type === 'tree');
      if (data.truncated) {
        errorMsg = 'Repo is large — some deeply nested files may be missing.';
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Failed to load repo contents';
    } finally {
      loading = false;
    }
  }

  function toggle(path: string) {
    if (expanded.has(path)) expanded.delete(path);
    else expanded.add(path);
    expanded = new Set(expanded);
  }

  function handleOpenFile(node: Node) {
    if (!selectedRepo) return;
    onOpenFile({
      owner: selectedRepo.owner,
      repo: selectedRepo.name,
      path: node.path,
      ref: selectedRepo.defaultBranch
    });
  }
</script>

<div class="explorer">
  <select
    class="repo-select"
    on:change={(e) => selectRepo(e.currentTarget.value)}
  >
    <option value="">Select a repo…</option>
    {#each repos as repo}
      <option value={repo.name}>{repo.name}</option>
    {/each}
  </select>

  {#if loading}
    <p class="status">Loading files…</p>
  {:else if errorMsg}
    <p class="status error">{errorMsg}</p>
  {/if}

  {#if selectedRepo && !loading && nodes.length > 0}
    <ul class="tree">
      {#each nodes as node (node.path)}
        <TreeNode {node} {expanded} onOpenFile={handleOpenFile} onToggle={toggle} />
      {/each}
    </ul>
  {/if}
</div>

<style>
  .explorer {
    font-family: 'JetBrains Mono', monospace;
    color: #ccc;
    width: 100%;
  }
  .repo-select {
    width: 100%;
    background: #0d0d0d;
    color: #eee;
    border: 1px solid #222;
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 13px;
    margin-bottom: 10px;
  }
  .status {
    font-size: 12px;
    color: #777;
  }
  .status.error {
    color: #ff6b6b;
  }
  .tree {
    list-style: none;
    padding: 0;
    margin: 0;
  }
</style>