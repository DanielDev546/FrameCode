<script>
  import CreateProjectModal from '$lib/components/CreateProjectModal.svelte';

    let showCreateModal = $state(false);


  import { onMount } from 'svelte'

  let { data } = $props()

  let activeNav = $state('dashboard')

  // ── Real data from DB ──────────────────────────
  let projects = $state(data.projects ?? [])
  let activity = $state(data.activity ?? [])

  // ── GitHub repos ───────────────────────────────
  let repos        = $state([])
  let reposLoading = $state(false)

  onMount(() => {
    loadRepos()
  })

 async function loadRepos() {
  reposLoading = true
  try {
    const res = await fetch('/api/github/repos')
    console.log('repos status:', res.status)
    if (res.ok) {
      const data = await res.json()
      console.log('repos data:', data)
      repos = data
      console.log('repos state after set:', repos)
    }
  } catch (e) {
    console.error('repos failed', e)
  } finally {
    reposLoading = false
  }
}

//delete projects function
async function deleteProject(id) {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
  })
  if (res.ok) {
    projects = projects.filter(p => p.id !== id)
  }
}

  async function importRepo(repo) {
    const res = await fetch('/api/github/import', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(repo),
    })
    if (res.ok) {
      const project = await res.json()
      projects = [project, ...projects]
    }
  }

  const nav = [
    { id: 'dashboard', label: 'Dashboard'  },
    { id: 'templates', label: 'Templates'  },
    { id: 'ide',       label: 'IDE'        },
    { id: 'meter',     label: 'AI Meter'   },
    { id: 'fork',      label: 'ForkTools'  },
    { id: 'design',    label: 'Design Hub' },
  ]

  // ── Stat cards computed from real data ─────────
  let stats = $derived([
    { label: 'Projects',  val: String(projects.length),                                                                    sub: `${projects.filter(p => p.status === 'live').length} live`   },
    { label: 'Forked',    val: String(projects.filter(p => p.templateId).length),                                         sub: 'templates'                                                   },
    { label: 'Avg Score', val: projects.length ? String(Math.round(projects.reduce((a, p) => a + (p.meterScore ?? 0), 0) / projects.length)) : '0', sub: 'AI meter'              },
    { label: 'Repos',     val: String(projects.filter(p => p.repoUrl).length),                                            sub: 'linked'                                                      },
  ])

  function sc(score) {
    if (score >= 80) return '#00ff88'
    if (score >= 60) return '#e8edf5'
    return '#5a6478'
  }

  function lc(item) {
    if (item.ok === true)  return '#00ff88'
    if (item.ok === false) return '#ff4f4f'
    return '#5a6478'
  }

  function li(item) {
    if (item.ok === true)  return '✓'
    if (item.ok === false) return '✕'
    return '◆'
  }
</script>

<div class="flex h-screen bg-[#070b12] text-[#e8edf5] overflow-hidden font-sans">

  <!-- grid -->
  <div class="fixed inset-0 pointer-events-none z-0"
    style="background-image:linear-gradient(rgba(0,255,136,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.02) 1px,transparent 1px);background-size:40px 40px;">
  </div>

  <!-- ── SIDEBAR ── -->
  <aside class="relative z-10 w-[200px] shrink-0 border-r border-white/[0.05] flex flex-col bg-[#070b12]">

    <!-- logo -->
    <div class="px-5 py-5 border-b border-white/[0.05]">
      <span class="font-mono text-[13px] font-bold">
        <span class="text-[#3a4154]">[</span><span class="text-[#00ff88]">FC</span><span class="text-[#3a4154]">]</span>
        <span class="text-[#e8edf5] ml-1">FrameCode</span>
      </span>
    </div>

  <nav class="flex-1 py-6 flex flex-col">
  <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.3em] px-5 mb-4">
    Menu
  </p>

  {#each nav as item}
    {#if item.id === 'ide' || item.id === 'templates' || item.id === 'meter' || item.id === 'fork' || item.id === 'design'}
      <a
        href={`/${item.id}`}
        onclick={() => (activeNav = item.id)}
        class="w-full text-left px-5 py-[9px] font-mono text-[11px] tracking-wide transition-all
               flex items-center justify-between no-underline
               {activeNav === item.id
                 ? 'text-[#e8edf5] bg-white/[0.04] border-l border-[#00ff88]'
                 : 'text-[#3a4154] hover:text-[#5a6478] border-l border-transparent'}"
      >
        {item.label}

        {#if activeNav === item.id}
          <span class="w-[3px] h-[3px] rounded-full bg-[#00ff88]"></span>
        {/if}
      </a>
    {:else}
      <button
        onclick={() => (activeNav = item.id)}
        class="w-full text-left px-5 py-[9px] font-mono text-[11px] tracking-wide transition-all
               flex items-center justify-between
               {activeNav === item.id
                 ? 'text-[#e8edf5] bg-white/[0.04] border-l border-[#00ff88]'
                 : 'text-[#3a4154] hover:text-[#5a6478] border-l border-transparent'}"
      >
        {item.label}

        {#if activeNav === item.id}
          <span class="w-[3px] h-[3px] rounded-full bg-[#00ff88]"></span>
        {/if}
      </button>
    {/if}
  {/each}
</nav>
    <!-- bottom -->
    <div class="border-t border-white/[0.05] py-4">
      <button class="w-full text-left px-5 py-[9px] font-mono text-[11px] text-[#3a4154] hover:text-[#5a6478] transition-colors">
        Settings
      </button>

      <form method="POST" action="/auth/logout">
        <button
         type="submit" 
          class="w-full text-left px-5 py-[9px] font-mono text-[11px] text-[#3a4154] hover:text-[#ff4f4f] transition-colors">
           Sign out
        </button>
      </form>
    
    </div>
  </aside>

  <!-- ── MAIN ── -->
  <div class="relative z-10 flex-1 flex flex-col overflow-hidden">

    <!-- topbar -->
    <header class="shrink-0 h-[52px] border-b border-white/[0.05] flex items-center justify-between px-7">
      <p class="font-mono text-[10px] text-[#3a4154] uppercase tracking-[0.25em]">// {activeNav}</p>
      <div class="flex items-center gap-5">
        <div class="flex items-center gap-2 font-mono text-[10px] text-[#3a4154]">
          <span class="w-[5px] h-[5px] rounded-full bg-[#00ff88]"></span>
          github · connected
        </div>
        <div class="w-[1px] h-[14px] bg-white/[0.06]"></div>
        <div class="w-[28px] h-[28px] border border-white/[0.1] flex items-center justify-center font-mono text-[11px] text-[#5a6478]">
          D
        </div>
      </div>
    </header>

    <!-- content -->
    <main class="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#1a2030_transparent]">
      <div class="p-7">

        <!-- greeting -->
        <div class="flex items-end justify-between mb-8">
          <div>
            <p class="font-mono text-[10px] text-[#3a4154] tracking-[0.2em] mb-2">TUE 27 MAY · 11:52PM</p>
            <h1 class="font-display text-[26px] font-bold tracking-[-0.5px] leading-none">
            Hey Dev<span class="text-[#00ff88]">Lion</span>.
          </div>
        <button onclick={() => showCreateModal = true}
           class="font-mono text-[11px] uppercase tracking-[0.1em] px-4 py-[8px] border border-white/[0.1] text-[#5a6478] hover:border-[#00ff88]/40 hover:text-[#00ff88] transition-all cursor-pointer">
            + New Project
          </button>
        </div>

<div class="grid grid-cols-4 gap-[1px] border border-white/[0.06] mb-8" style="background:rgba(255,255,255,0.06)">
  {#each stats as s}
    <div class="bg-[#070b12] px-5 py-5">
      <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.2em] mb-3">{s.label}</p>
      <p class="font-display text-[32px] font-bold tracking-[-1px] leading-none text-[#e8edf5] mb-1">{s.val}</p>
      <p class="font-mono text-[9px] text-[#3a4154]">{s.sub}</p>
    </div>
  {/each}
</div>
        <!-- two col -->
        <div class="grid grid-cols-[1fr_260px] gap-6">

          <!-- LEFT: projects -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.25em]">// Projects</p>
              <button class="font-mono text-[9px] text-[#3a4154] hover:text-[#5a6478] transition-colors uppercase tracking-[0.15em]">
                View all
              </button>
            </div>

            <!-- table -->
            <div class="border border-white/[0.06]">

              <!-- header -->
              <div class="grid grid-cols-[1fr_80px_60px_60px_80px] px-5 py-2 border-b border-white/[0.05]">
                {#each ['Project', 'Stack', 'Score', 'Status', ''] as h}
                  <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.15em]">{h}</p>
                {/each}
              </div>
{#if projects.length === 0}
  <div class="px-5 py-8 font-mono text-[11px] text-[#3a4154] text-center">
    No projects yet — create one to get started
  </div>
{:else}
  {#each projects as p}
    <div class="grid grid-cols-[1fr_80px_60px_60px_80px] px-5 py-[13px] border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group items-center">
      <div class="flex items-center gap-2">
        {#if p.repoUrl}
          <svg class="w-[8px] h-[8px] shrink-0 text-[#3a4154]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        {:else}
          <span class="font-mono text-[8px] text-[#00ff88]">[FC]</span>
        {/if}
        <p class="font-mono text-[12px] text-[#e8edf5]">{p.name}</p>
      </div>
      <p class="font-mono text-[10px] text-[#3a4154]">{p.framework}</p>
      <p class="font-mono text-[11px]" style="color:{sc(p.meterScore ?? 0)}">{p.meterScore ?? '--'}</p>
      <p class="font-mono text-[9px] uppercase tracking-[0.1em]"
         style="color:{p.status==='live'?'#00ff88':p.status==='paused'?'#3a4154':'#5a6478'}">
        {p.status}
      </p>
   <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
  <a href="/ide"
     class="font-mono text-[9px] px-2 py-1 border border-white/[0.08]
            text-[#5a6478] hover:text-[#00ff88] hover:border-[#00ff88]/20
            transition-all no-underline">
    IDE
  </a>
  {#if p.repoUrl}
    <a href={p.repoUrl} target="_blank"
       class="font-mono text-[9px] px-2 py-1 border border-white/[0.08]
              text-[#5a6478] hover:text-[#e8edf5] transition-all no-underline">
      ↗
    </a>
  {:else}
    <button
      class="font-mono text-[9px] px-2 py-1 border border-white/[0.08]
             text-[#5a6478] hover:text-[#00d4ff] transition-all">
      Push →
    </button>
  {/if}
  <!-- Delete button -->
  <button
    onclick={() => deleteProject(p.id)}
    class="font-mono text-[9px] px-2 py-1 border border-white/[0.08]
           text-[#5a6478] hover:text-[#ff4f4f] hover:border-[#ff4f4f]/20
           transition-all"
  >
    ✕
  </button>
</div>
    </div>
  {/each}
{/if}
            </div>

            <!-- activity -->
           <div class="px-4 py-4 font-mono text-[11px] flex flex-col gap-[6px]">
  {#if activity.length === 0}
    <div class="text-[#3a4154] text-[10px]">No activity yet</div>
  {:else}
    {#each activity as item}
      <div class="flex items-center gap-3">
        <span class="shrink-0 w-[10px] text-[#00ff88]">✓</span>
        <span class="flex-1 text-[#5a6478]">{item.message}</span>
        <span class="text-[#3a4154] text-[9px] shrink-0">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      </div>
    {/each}
  {/if}
  <div class="flex items-center gap-3 mt-1">
    <span class="text-[#00ff88]">❯</span>
    <span class="inline-block w-[6px] h-[11px] bg-[#3a4154] animate-[blink_1.1s_step-end_infinite]"></span>
  </div>
</div>
</div>

          <!-- RIGHT -->
          <div class="flex flex-col gap-5">

            <!-- quick actions -->
            <div>
              <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.25em] mb-3">// Actions</p>
              <div class="flex flex-col border border-white/[0.06]" style="gap:1px;background:rgba(255,255,255,0.06)">
          {#each [
  { label: 'New Project',      action: () => showCreateModal = true },
  { label: 'Browse Templates', action: () => window.location.href = '/templates' },
  { label: 'Run AI Meter',     action: () => window.location.href = '/meter' },
  { label: 'Sync GitHub',      action: () => loadRepos() },
] as item}
  <button
    onclick={item.action}
    class="bg-[#070b12] px-4 py-[10px] text-left font-mono text-[11px] text-[#3a4154] hover:text-[#e8edf5] hover:bg-white/[0.03] transition-all flex items-center gap-3"
  >
    <span class="text-[#00ff88]">❯</span>{item.label}
  </button>
{/each}
              </div>
            </div>

            <!-- AI meter -->
            <div>
              <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.25em] mb-3">// AI Meter</p>
              <div class="border border-white/[0.06] p-4">
                <div class="flex justify-between items-center mb-4">
                  <p class="font-mono text-[10px] text-[#5a6478]">saas-hero-v2</p>
                  <p class="font-mono text-[11px] text-[#00ff88]">94</p>
                </div>
                {#each [
                  ['CTA',      94, '#00ff88'],
                  ['Copy',     87, '#00ff88'],
                  ['Perf',     71, '#5a6478'],
                  ['Mobile',   58, '#5a6478'],
                  ['Trust',    32, '#ff4f4f'],
                ] as [lbl, val, col]}
                  <div class="mb-[10px]">
                    <div class="flex justify-between mb-1">
                      <span class="font-mono text-[9px] text-[#3a4154]">{lbl}</span>
                      <span class="font-mono text-[9px]" style="color:{col}">{val}%</span>
                    </div>
                    <div class="h-[2px] bg-[#1a2030]">
                      <div class="h-[2px] transition-all" style="width:{val}%;background:{col}"></div>
                    </div>
                  </div>
                {/each}
                <button class="w-full mt-2 py-[8px] font-mono text-[9px] uppercase tracking-[0.12em] border border-white/[0.08] text-[#3a4154] hover:text-[#00ff88] hover:border-[#00ff88]/20 transition-all">
                  Full Analysis →
                </button>
              </div>
            </div>

       <div>
  <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.25em] mb-3">// Repos</p>
  <div class="flex flex-col gap-[1px] border border-white/[0.06]" style="background:rgba(255,255,255,0.06)">
    {#if reposLoading}
      <div class="bg-[#070b12] px-4 py-3 font-mono text-[10px] text-[#3a4154]">
        Syncing...
      </div>
    {:else if repos.length === 0}
      <div class="bg-[#070b12] px-4 py-3 font-mono text-[10px] text-[#3a4154]">
        No repos — sign in with GitHub
      </div>
    {:else}
      {#each repos.slice(0, 5) as repo}
        <div class="bg-[#070b12] px-4 py-[10px] flex items-center gap-3 hover:bg-white/[0.02] transition-colors group">
          <svg class="w-[10px] h-[10px] shrink-0 text-[#3a4154]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span class="font-mono text-[10px] text-[#5a6478] flex-1 truncate">{repo.name}</span>
          <span class="font-mono text-[9px] text-[#3a4154]">{repo.language ?? '—'}</span>
          <button
            onclick={() => importRepo(repo)}
            class="font-mono text-[9px] px-2 py-1 border border-white/[0.08]
                   text-[#3a4154] hover:text-[#00ff88] hover:border-[#00ff88]/20
                   transition-all opacity-0 group-hover:opacity-100"
          >
            Import →
          </button>
        </div>
      {/each}
    {/if}
  </div>
</div>

          </div>
        </div>
      </div>
    </main>
  </div>

    <CreateProjectModal
    open={showCreateModal}
    onClose={() => showCreateModal = false}
    onCreated={(project) => {
      projects = [project, ...projects]
      showCreateModal = false
    }}
  />

</div>