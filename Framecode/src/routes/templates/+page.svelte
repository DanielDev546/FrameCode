<script>
  // This page assumes your root/authenticated +layout.svelte already
  // renders the top nav and left MENU sidebar (same as your dashboard
  // and IDE pages) — this file is just the main content area.

  let { data } = $props();

  let search = $state('');
  let activeCategory = $state('all');

  let categories = $derived(['all', ...new Set(data.templates.map((t) => t.category))]);

  let filtered = $derived(
    data.templates.filter((t) => {
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || t.name.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    })
  );

  function frameworkColor(framework) {
    const key = (framework ?? '').toLowerCase();
    if (key.includes('svelte')) return { bg: '#ff3e00', text: '#3a0e00' };
    if (key.includes('react') || key === 'javascript' || key === 'js')
      return { bg: '#ffb340', text: '#3a2400' };
    if (key.includes('vue') || key.includes('html')) return { bg: '#00d4ff', text: '#00232e' };
    return { bg: '#5a6478', text: '#0a0f18' };
  }

  async function useTemplate(t) {
    // Wire this to your actual "create project from template" flow, e.g.:
    //   const res = await fetch('/api/projects/from-template', {
    //     method: 'POST',
    //     body: JSON.stringify({ templateId: t.id })
    //   });
    //   const { projectId } = await res.json();
    //   goto(`/ide/${projectId}`);
    console.log('use template', t.slug);
  }
</script>

<div class="p-6">
  <p class="font-mono text-[10px] tracking-[0.2em] text-[#3a4154] mb-1">// TEMPLATE LIBRARY</p>
  <h1 class="font-mono text-[22px] font-bold tracking-tight mb-5">Start from something real.</h1>

  <div class="flex gap-3 mb-4">
    <input
      bind:value={search}
      placeholder="Search templates..."
      class="flex-1 bg-[#0d1420] border border-white/[0.08] text-[#e8edf5] placeholder-[#3a4154] font-mono text-[12px] px-3 py-2 rounded-md focus:outline-none focus:border-[#00ff88]/40"
    />
  </div>

  <div class="flex gap-2 flex-wrap mb-6">
    {#each categories as cat}
      <button
        onclick={() => (activeCategory = cat)}
        class="font-mono text-[10px] uppercase px-3 py-[5px] rounded-full border transition-colors
               {activeCategory === cat
                 ? 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30'
                 : 'text-[#5a6478] border-white/[0.08] hover:text-[#e8edf5] hover:border-white/20'}"
      >
        {cat}
      </button>
    {/each}
  </div>

  {#if filtered.length === 0}
    <div class="border border-dashed border-white/[0.08] rounded-xl py-16 text-center">
      <p class="font-mono text-[13px] text-[#5a6478] mb-1">No templates yet.</p>
      <p class="font-mono text-[11px] text-[#3a4154]">Templates you publish or fork will show up here.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {#each filtered as t (t.id)}
        <div class="border border-white/[0.06] rounded-xl overflow-hidden bg-[#0a0f18]">
          <div class="h-[90px] relative bg-gradient-to-br from-[#0d1420] to-[#070b12]">
            {#if t.thumbnailUrl}
              <img src={t.thumbnailUrl} alt={t.name} class="w-full h-full object-cover" />
            {/if}
            <span
              class="absolute top-2 right-2 font-mono text-[9px] px-[6px] py-[2px] rounded"
              style="background:{frameworkColor(t.framework).bg}; color:{frameworkColor(t.framework).text}"
            >
              {t.framework.toUpperCase()}
            </span>
            {#if t.featured}
              <span
                class="absolute top-2 left-2 font-mono text-[9px] px-[6px] py-[2px] rounded bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30"
              >
                FEATURED
              </span>
            {/if}
          </div>
          <div class="p-3">
            <p class="font-mono text-[12px] font-bold mb-[2px]">{t.name}</p>
            <p class="font-mono text-[10px] text-[#5a6478] mb-2 line-clamp-1">
              {t.description ?? t.category}
            </p>
            <div class="flex items-center justify-between">
              <span class="font-mono text-[10px] text-[#00d4ff]">↓ {t.downloads}</span>
              <button
                onclick={() => useTemplate(t)}
                class="font-mono text-[9px] uppercase border border-white/[0.1] text-[#5a6478] hover:text-[#e8edf5] hover:border-white/20 px-[10px] py-1 rounded-md transition-colors"
              >
                Use
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>