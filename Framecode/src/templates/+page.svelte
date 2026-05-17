<script>
  // Mock data for the templates
  const templates = [
    {
      id: 1,
      title: "Nova SaaS",
      tags: ["SaaS"],
      isPremium: true,
      description: "A high-performance dashboard template with advanced analytics and team management features built-in.",
      image: "/path-to-nova.jpg"
    },
    {
      id: 2,
      title: "Atlas Portfolio",
      tags: ["Portfolio"],
      isPremium: false,
      description: "Showcase your creative work with this minimalist, typography-driven portfolio designed for visual impact.",
      image: "/path-to-atlas.jpg"
    },
    {
      id: 3,
      title: "Market Master",
      tags: ["E-commerce"],
      isPremium: false,
      description: "Comprehensive storefront solution with optimized checkout flows and product variation management.",
      image: "/path-to-market.jpg"
    }
    // Add more objects here for the rest of the grid...
  ];

  let activeFilter = "All Templates";
  const filters = ["All Templates", "SaaS", "Marketing", "E-commerce", "Portfolio"];
</script>

<nav class="bg-white border-b border-slate-100 sticky top-0 z-50">
  <div class="max-w-[1240px] mx-auto px-6 h-20 flex items-center justify-between">
    <div class="flex items-center space-x-10">
      <a href="/" class="text-xl font-extrabold tracking-tight">FrameCode</a>
      <div class="hidden md:flex space-x-8 text-sm font-medium text-slate-500">
        <a href="/templates" class="text-indigo-600 relative after:content-[''] after:absolute after:-bottom-[29px] after:left-0 after:w-full after:h-0.5 after:bg-indigo-600">Templates</a>
        <a href="#features" class="hover:text-slate-900 transition-colors">Features</a>
        <a href="#pricing" class="hover:text-slate-900 transition-colors">Pricing</a>
        <a href="#docs" class="hover:text-slate-900 transition-colors">Docs</a>
      </div>
    </div>
    <div class="flex items-center space-x-6">
      <button class="text-sm font-semibold text-slate-600 hover:text-slate-900">Log In</button>
      <button class="bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">Get Started</button>
    </div>
  </div>
</nav>

<header class="py-20 text-center bg-[#F9FAFB]">
  <div class="max-w-[1240px] mx-auto px-6">
    <h1 class="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">Template Library</h1>
    <p class="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
      Choose from our curated collection of production-ready templates. Architected for performance and designed for the modern web.
    </p>
  </div>
</header>

<section class="bg-[#F9FAFB] pb-12">
  <div class="max-w-[1240px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
    <div class="flex flex-wrap gap-2">
      {#each filters as filter}
        <button 
          on:click={() => activeFilter = filter}
          class="px-5 py-2 text-sm font-bold rounded-lg border transition-all 
          {activeFilter === filter ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}"
        >
          {filter}
        </button>
      {/each}
    </div>
    <div class="relative w-full md:w-80">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </span>
      <input type="text" placeholder="Search templates..." class="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
    </div>
  </div>
</section>

<main class="bg-[#F9FAFB] pb-32">
  <div class="max-w-[1240px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each templates as template}
      <div class="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        <div class="aspect-[4/3] bg-slate-900 relative">
          <img src={template.image} alt={template.title} class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>
        <div class="p-6">
          <div class="flex items-center space-x-2 mb-3">
            {#each template.tags as tag}
              <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded">{tag}</span>
            {/each}
            {#if template.isPremium}
              <span class="px-2 py-0.5 bg-sky-50 text-sky-600 text-[10px] font-bold uppercase rounded">Premium</span>
            {/if}
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-2">{template.title}</h3>
          <p class="text-slate-500 text-sm mb-6 leading-relaxed">{template.description}</p>
          <div class="flex gap-3">
            <button class="flex-1 py-2.5 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors">Preview</button>
            <button class="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">Use Template</button>
          </div>
        </div>
      </div>
    {/each}
  </div>
</main>

<section class="max-w-[1240px] mx-auto px-6 pb-20">
  <div class="bg-[#020617] rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
    <div class="relative z-10 max-w-xl">
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Need a custom blueprint?</h2>
      <p class="text-slate-400 text-lg mb-8 leading-relaxed">Our architects can help you build a bespoke system tailored to your specific technical requirements.</p>
      <button class="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">Contact our Design Team</button>
    </div>
    
    <div class="relative z-10 w-full md:w-96 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 font-mono text-[10px] text-indigo-400">
      <div class="flex space-x-1.5 mb-4">
        <div class="w-2 h-2 rounded-full bg-slate-700" />
        <div class="w-2 h-2 rounded-full bg-slate-700" />
        <div class="w-2 h-2 rounded-full bg-slate-700" />
      </div>
      <pre><code>{`{
  "project": "Custom Architecture",
  "status": "ready_for_deploy",
  "team": ["Designers", "Architects"],
  "velocity": "ultra-high"
}`}</code></pre>
    </div>
  </div>
</section>