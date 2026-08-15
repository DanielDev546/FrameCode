<script lang="ts">
  import RepoExplorer from '$lib/components/RepoExplorer.svelte';
  import CodeEditor from '$lib/components/CodeEditor.svelte';


   import { onMount } from 'svelte'
    import { goto } from '$app/navigation'

    onMount(() => {
        const lastProjectId = localStorage.getItem('framecode:lastProjectId')

        if (lastProjectId) {
            goto(`/ide/${lastProjectId}`)
        }
    })


  type Repo = { name: string; owner: string; defaultBranch: string };
  type OpenFile = { owner: string; repo: string; path: string; ref: string };

  let { repos = [] }: { repos?: Repo[] } = $props();

  let activeFile = $state<OpenFile | null>(null);
  let fileContent = $state('');
  let dirty = $state(false);
  let loadingFile = $state(false);

  async function openFile(payload: OpenFile) {
    loadingFile = true;
    dirty = false;
    try {
      const res = await fetch(
        `/api/github/file?owner=${payload.owner}&repo=${payload.repo}&path=${encodeURIComponent(payload.path)}&ref=${payload.ref}`
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      fileContent = data.content;
      activeFile = payload;
    } catch (e) {
      console.error('Failed to open file', e);
    } finally {
      loadingFile = false;
    }
  }

  function handleChange(newContent: string) {
    fileContent = newContent;
    dirty = true;
  }



// ── Save file ──────────────────────────────────
async function saveFile(path) {
  const content = fileCache[path]
  if (content === undefined || !path) return

  saveStatus = 'saving'

  try {
    const res = await fetch('/api/ide/save', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        path,
        content,
      }),
    })

    if (res.ok) {
      saveStatus = 'saved'
      // Mark tab as clean
      openTabs = openTabs.map(t =>
        t.path === path ? { ...t, dirty: false } : t
      )
      // Reset to idle after 2s
      setTimeout(() => saveStatus = 'idle', 2000)
    } else {
      saveStatus = 'error'
      setTimeout(() => saveStatus = 'idle', 3000)
    }
  } catch {
    saveStatus = 'error'
    setTimeout(() => saveStatus = 'idle', 3000)
  }
}

</script>

<div class="ide">
  <aside class="sidebar">
    <RepoExplorer {repos} onOpenFile={openFile} />
  </aside>

  <div class="ide-loading">
    <span>Opening last project...</span>
</div>

  <main class="editor-pane">
    {#if loadingFile}
      <p class="status">Loading file…</p>
    {:else if activeFile}
      <div class="tab-bar">
        <span>{activeFile.path}</span>
        {#if dirty}<span class="dirty">●</span>{/if}
      </div>
      <CodeEditor value={fileContent} filename={activeFile.path} onChange={handleChange} />
    {:else}
      <p class="status">Select a file from the tree to start editing</p>
    {/if}
  </main>
</div>

<style>
  .ide {
    display: grid;
    grid-template-columns: 260px 1fr;
    height: 100vh;
    background: #0a0a0a;
    color: #ccc;
  }
  .sidebar {
    border-right: 1px solid #1a1a1a;
    padding: 12px;
    overflow-y: auto;
  }
  .editor-pane {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .tab-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-bottom: 1px solid #1a1a1a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #999;
  }
  .dirty {
    color: #00e5a0;
  }
  .status {
    padding: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #666;
  }
</style>