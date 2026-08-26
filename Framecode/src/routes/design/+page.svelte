<script lang="ts">
  import { 
    Search, Plus, Sparkles, Folder, AppWindow, Globe, 
    ChevronRight, Code, Compass, Wand2 
  } from '@lucide/svelte';

  let activeTab: 'my' | 'shared' = 'my';
  let projectSearch = '';
  let promptText = '';
  let selectedPlatform: 'App' | 'Web' = 'App';

  let projects = [
    { title: 'Cinema Ticket Manager', date: 'Jun 2, 2026', type: 'Web' },
    { title: 'DevJournal UI Builder', date: 'May 12, 2026', type: 'App' },
    { title: 'FrameCode Landing Page', date: 'Apr 23, 2026', type: 'Web' },
    { title: 'Code Snippet Marketplace', date: 'Apr 21, 2026', type: 'Web' },
    { title: 'Fullstack Developer Portfolio', date: 'Apr 19, 2026', type: 'Web' },
    { title: 'AI Mastery Course Detail', date: 'Apr 11, 2026', type: 'App' }
  ];

  const suggestions = [
    "A trip packing checklist app that suggests items based on weather...",
    "Make me an app for people who love skiing",
    "A mobile leaderboard and stats page for dev metrics"
  ];

  const inspirationCards = [
    { title: "SaaS Hero Component", category: "Web Design", tag: "Tailwind" },
    { title: "Mobile Dev Dashboard", category: "Native UI", tag: "SvelteNative" },
    { title: "Terminal Analytics Grid", category: "Data Vis", tag: "Canvas" }
  ];

  function applySuggestion(text: string) {
    promptText = text;
  }
</script>

<div class="min-h-screen bg-[#07090e] text-slate-300 font-sans flex flex-col">
  
  <!-- Responsive Main Layout (Stacks vertically on mobile, row on md screens) -->
  <div class="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
    
    <!-- Sidebar (Full width on mobile, 80 width on desktop) -->
    <aside class="w-full md:w-80 border-b md:border-b-0 md:border-r border-emerald-950/40 bg-[#0a0d14] flex flex-col p-4 gap-4 shrink-0">
      
      <!-- Top Toggle Tabs -->
      <div class="flex items-center bg-[#0d111a] p-1 rounded-lg border border-slate-800/60">
        <button 
          class="flex-1 py-1.5 text-xs font-mono rounded-md transition-all flex items-center justify-center gap-2 {activeTab === 'my' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}"
          on:click={() => activeTab = 'my'}
        >
          <Folder size={14} /> My Projects
        </button>
        <button 
          class="flex-1 py-1.5 text-xs font-mono rounded-md transition-all flex items-center justify-center gap-2 {activeTab === 'shared' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}"
          on:click={() => activeTab = 'shared'}
        >
          Shared
        </button>
      </div>

      <!-- Search Box -->
      <div class="relative">
        <Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search projects..." 
          bind:value={projectSearch}
          class="w-full bg-[#0d111a] border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
        />
      </div>

      <div class="text-[10px] uppercase tracking-wider font-mono text-slate-500 font-semibold px-1 mt-1">
        // Recent Builds
      </div>

      <!-- Project List (Max height constraint on mobile to prevent infinite page scroll) -->
      <div class="max-h-48 md:max-h-none md:flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {#each projects.filter(p => p.title.toLowerCase().includes(projectSearch.toLowerCase())) as project}
          <button class="w-full group flex items-center gap-3 p-2 rounded-md hover:bg-slate-900/60 border border-transparent hover:border-slate-800 transition-all text-left">
            <div class="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 shrink-0">
              {#if project.type === 'App'}
                <AppWindow size={16} />
              {:else}
                <Globe size={16} />
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-slate-300 truncate group-hover:text-emerald-400 transition-colors">
                {project.title}
              </p>
              <p class="text-[10px] font-mono text-slate-500">{project.date}</p>
            </div>
          </button>
        {/each}
      </div>
    </aside>

    <!-- Main Workspace -->
    <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-6 md:space-y-8 relative">
      
      <!-- Tech Background Grid -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <!-- Header & Action Buttons (Stacks full-width buttons on mobile) -->
      <div class="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Design Hub <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">v2.4</span>
          </h1>
          <p class="text-xs font-mono text-slate-500 mt-1">// AI-powered UI generation workspace</p>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button class="px-3.5 py-2 sm:py-1.5 text-xs font-mono border border-slate-700 hover:border-slate-500 bg-slate-900 text-slate-200 rounded-md transition flex items-center justify-center gap-1.5">
            <Plus size={14} /> Start with design
          </button>
          <button class="px-3.5 py-2 sm:py-1.5 text-xs font-mono bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-md transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Code size={14} /> Blank project
          </button>
        </div>
      </div>

      <!-- Prompt Sandbox -->
      <div class="relative bg-[#0b0e17] border border-slate-800 focus-within:border-emerald-500/60 rounded-xl p-3 sm:p-4 shadow-xl transition-all">
        <textarea 
          bind:value={promptText}
          placeholder="What native app or responsive UI component shall we design today?"
          class="w-full bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none resize-none h-24 sm:h-28 text-xs sm:text-sm"
        ></textarea>

        <!-- Dynamic Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
          <div class="flex items-center gap-2">
            <div class="bg-slate-900 border border-slate-800 p-0.5 rounded-lg flex items-center w-full sm:w-auto">
              <button 
                class="flex-1 sm:flex-initial px-3 py-1 text-xs font-mono rounded-md transition flex items-center justify-center gap-1.5 {selectedPlatform === 'App' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'}"
                on:click={() => selectedPlatform = 'App'}
              >
                <AppWindow size={13} /> App
              </button>
              <button 
                class="flex-1 sm:flex-initial px-3 py-1 text-xs font-mono rounded-md transition flex items-center justify-center gap-1.5 {selectedPlatform === 'Web' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'}"
                on:click={() => selectedPlatform = 'Web'}
              >
                <Globe size={13} /> Web
              </button>
            </div>

            <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/80 text-xs font-mono text-slate-400">
              <Sparkles size={12} class="text-emerald-400" />
              <span>FrameEngine 3.0</span>
            </div>
          </div>

          <button 
            disabled={!promptText.trim()}
            class="w-full sm:w-auto px-4 py-2 sm:py-1.5 text-xs font-mono bg-emerald-500 disabled:opacity-40 hover:bg-emerald-400 text-black font-semibold rounded-md transition flex items-center justify-center gap-2"
          >
            <Wand2 size={13} /> Generate UI
          </button>
        </div>
      </div>

      <!-- Quick Suggestion Chips -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {#each suggestions as suggestion}
          <button 
            on:click={() => applySuggestion(suggestion)}
            class="px-3 py-1.5 text-xs font-mono bg-[#0d111a] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-400 rounded-full transition whitespace-nowrap shrink-0"
          >
            {suggestion}
          </button>
        {/each}
      </div>

      <!-- Inspiration Grid -->
      <div class="space-y-4 pt-2">
        <div class="flex items-center justify-between">
          <h2 class="text-xs sm:text-sm font-mono tracking-wider text-slate-400 uppercase flex items-center gap-2">
            <Compass size={16} class="text-emerald-400" /> Need Inspiration?
          </h2>
          <button class="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1">
            Browse Template Gallery <ChevronRight size={12} />
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each inspirationCards as card}
            <div class="group relative bg-[#0a0d14] border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between h-36 sm:h-40">
              <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition"></div>
              
              <div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                  {card.tag}
                </span>
                <h3 class="font-semibold text-slate-200 text-xs sm:text-sm mt-2 sm:mt-3 group-hover:text-white transition">
                  {card.title}
                </h3>
                <p class="text-[11px] sm:text-xs text-slate-500 font-mono mt-0.5">{card.category}</p>
              </div>

              <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono text-slate-500 pt-2 border-t border-slate-900 group-hover:text-emerald-400 transition">
                <span>Fork Component</span>
                <ChevronRight size={14} />
              </div>
            </div>
          {/each}
        </div>
      </div>

    </main>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #1e293b;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #10b981;
  }
</style>