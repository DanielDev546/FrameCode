<script lang="ts">
  import RepoExplorer from '$lib/components/RepoExplorer.svelte';
  import CodeEditor from '$lib/components/CodeEditor.svelte';

  type Repo = { name: string; owner: string; defaultBranch: string };
  type OpenFile = { owner: string; repo: string; path: string; ref: string };

  let { repos = [] }: { repos?: Repo[] } = $props();

  let activeFile = $state<OpenFile | null>(null);
  let fileContent = $state('');
  let dirty = $state(false);
  let loadingFile = $state(false);
  
  // Toggle state for mobile view
  let sidebarOpen = $state(false);

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
      sidebarOpen = false; // Auto-close drawer on mobile when a file is selected
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
</script>

<!-- Mobile Navigation Header -->
<header class="mobile-bar">
  <button class="toggle-btn" onclick={() => (sidebarOpen = !sidebarOpen)}>
    {sidebarOpen ? '✕ Close' : '📁 Files'}
  </button>
  {#if activeFile}
    <span class="mobile-path">{activeFile.path}</span>
  {/if}
</header>

<div class="ide">
  <!-- Mobile Backdrop -->
  {#if sidebarOpen}
    <div 
      class="backdrop" 
      onclick={() => (sidebarOpen = false)}
      onkeydown={(e) => e.key === 'Escape' && (sidebarOpen = false)}
      role="button"
      tabindex="0"
      aria-label="Close sidebar backdrop"
    ></div>
  {/if}

  <aside class="sidebar" class:open={sidebarOpen}>
    <RepoExplorer {repos} onOpenFile={openFile} />
  </aside>

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
  .mobile-bar {
    display: none;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: #111;
    border-bottom: 1px solid #1a1a1a;
  }

  .toggle-btn {
    background: #1f1f1f;
    border: 1px solid #333;
    color: #ccc;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }

  .mobile-path {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ide {
    display: grid;
    grid-template-columns: 260px 1fr;
    height: 100vh;
    height: 100dvh;
    background: #0a0a0a;
    color: #ccc;
    position: relative;
    overflow: hidden;
  }

  .sidebar {
    border-right: 1px solid #1a1a1a;
    padding: 12px;
    overflow-y: auto;
    background: #0a0a0a;
    transition: transform 0.2s ease;
  }

  .editor-pane {
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    overflow: hidden;
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

  /* Responsive Mobile Breakpoint */
  @media (max-width: 768px) {
    .mobile-bar {
      display: flex;
    }

    .ide {
      display: flex;
      flex-direction: column;
      height: calc(100dvh - 41px);
    }

    .sidebar {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 260px;
      z-index: 30;
      transform: translateX(-100%);
      box-shadow: 4px 0 16px rgba(0, 0, 0, 0.5);
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 20;
    }

    .tab-bar {
      display: none;
    }
  }
</style>