<script lang="ts">
  // Svelte 5 runes — no imports needed for $state/$derived

  // ── AI Meter bars ──────────────────────────────────────────────
  const meterBars = [
    { label: 'CTA Visibility',    value: 94, color: 'green' },
    { label: 'Copy Clarity',      value: 87, color: 'green' },
    { label: 'Load Performance',  value: 71, color: 'amber' },
    { label: 'Mobile UX',         value: 58, color: 'amber' },
    { label: 'Trust Signals',     value: 32, color: 'red'   },
  ]

  // ── Features ───────────────────────────────────────────────────
  const features = [
    { num: '01', tag: 'TEMPLATES',  name: 'Landing Page Library',  badge: 'LIVE PREVIEW',  desc: '300+ production-ready layouts. SaaS, portfolio, agency, e-commerce. Tailwind + Next.js by default.' },
    { num: '02', tag: 'DASHBOARDS', name: 'User Dashboard Hub',    badge: 'PLUG & PLAY',   desc: 'Fully wired admin panels, user portals, and analytics views. Auth-ready with role-based access patterns.' },
    { num: '03', tag: 'AI',         name: 'Conversion Meter',      badge: 'GPT-POWERED',   desc: 'AI-powered CRO scoring on any template. Real-time suggestions, A/B variant generation, heatmap preview.' },
    { num: '04', tag: 'FORK',       name: 'ForkTooling Suite',     badge: 'GITHUB NATIVE', desc: 'One-click GitHub fork, automatic PR templates, CI/CD wiring, branch strategy presets.' },
    { num: '05', tag: 'DESIGN',     name: 'Design Hub',            badge: 'FIGMA SYNC',    desc: 'Token system editor, component explorer, Figma sync, and design-to-code diffing in real time.' },
    { num: '06', tag: 'IDE',        name: 'Integrated IDE',        badge: 'BROWSER-NATIVE', desc: 'Browser-based editor with LSP support, terminal, GitHub integration, and zero-install deployment pipeline.' },
  ]

  // ── Templates ──────────────────────────────────────────────────
  const templates = [
    { name: 'SaaS Hero',       stack: 'NEXT.JS · TAILWIND', accentClass: 'bg-[rgba(0,255,136,0.35)]' },
    { name: 'Admin Dashboard', stack: 'REACT · SHADCN',     accentClass: 'bg-[rgba(0,212,255,0.3)]' },
    { name: 'Portfolio Grid',  stack: 'ASTRO · CSS',         accentClass: 'bg-[rgba(255,179,64,0.35)]' },
    { name: 'Blog Starter',    stack: 'REMIX · MDX',         accentClass: 'bg-[rgba(0,255,136,0.25)]' },
    { name: 'API Boilerplate', stack: 'NODE · EXPRESS',      accentClass: 'bg-[rgba(255,179,64,0.2)]' },
    { name: 'Auth Flow',       stack: 'NEXT.JS · CLERK',     accentClass: 'bg-[rgba(0,212,255,0.2)]' },
  ]

  // ── ForkTools ──────────────────────────────────────────────────
  const forkTools = [
    { id: '01', name: 'FORK.INIT',   desc: 'One-click GitHub fork with automatic upstream tracking, branch protection rules, and issue label presets configured from your template.' },
    { id: '02', name: 'FORK.CI',     desc: 'Auto-generated GitHub Actions workflows for lint, test, and deploy. Supports Vercel, Netlify, Railway, and Fly.io out of the box.' },
    { id: '03', name: 'FORK.DIFF',   desc: 'Visual diff tool that tracks upstream template changes. Pull updates selectively without overwriting your custom code.' },
    { id: '04', name: 'FORK.COLLAB', desc: 'Shared workspaces, PR review templates, and co-authoring sessions. Built for teams shipping together in real time.' },
  ]

  // ── AI meter color helper ──────────────────────────────────────
  function barColor(color: string) {
    if (color === 'green') return 'bg-[#00ff88]'
    if (color === 'amber') return 'bg-[#ffb340]'
    return 'bg-[#ff4f4f]'
  }
</script>

<div class="max-w-[1100px] mx-auto px-8">

  <!-- ─────────────────── HERO ─────────────────── -->
  <section class="pt-20 pb-16">

    <!-- Tag -->
    <div class="flex items-center gap-2 font-mono text-[11px] text-[#00ff88] uppercase tracking-[0.2em] mb-6">
      <span class="text-[#5a6478]">&gt; </span>
      <span class="inline-block w-[6px] h-[6px] rounded-full bg-[#00ff88] animate-pulse"></span>
      Full-Stack Engineering Platform — v2.4.1
    </div>

    <!-- Headline -->
    <h1 class="font-display text-[clamp(52px,7vw,88px)] font-extrabold leading-[0.95] tracking-[-3px] mb-7">
      <span class="block text-[#e8edf5]">Build without</span>
      <span class="block" style="-webkit-text-stroke: 1px rgba(255,255,255,0.2); color: transparent;">
        starting from <span class="text-[#00ff88]" style="-webkit-text-stroke: 0;">zero.</span>
      </span>
    </h1>

    <!-- Subheading -->
    <p class="text-[16px] text-[#5a6478] leading-[1.7] max-w-[560px] mb-11 font-light">
      Production-ready landing pages, dashboard templates, AI conversion tools,
      and GitHub-native fork workflows — all in one terminal-grade IDE.
    </p>

    <!-- CTAs + stats -->
    <div class="flex flex-wrap items-center gap-4 mb-12">
    <a href="auth/login" class="content">
      <button
        class="font-mono text-[12px] uppercase tracking-[0.1em] px-7 py-[14px]
               bg-[#00ff88] text-black font-bold hover:brightness-110 transition-all cursor-pointer"
      >
        Launch IDE
      </button>
      </a>
      <button
        class="font-mono text-[12px] uppercase tracking-[0.1em] px-7 py-[13px]
               border border-white/20 text-[#5a6478] hover:border-[#00d4ff] hover:text-[#00d4ff]
               transition-all cursor-pointer"
      >
        Browse Templates
      </button>
      <span class="font-mono text-[11px] text-[#5a6478]">
        <strong class="text-[#e8edf5]">4,200+</strong> templates deployed
      </span>
      <span class="font-mono text-[11px] text-[#5a6478]">
        <strong class="text-[#e8edf5]">98.7%</strong> uptime
      </span>
    </div>

    <!-- Terminal window -->
    <div class="border border-white/[0.08] bg-black/50 backdrop-blur-xl overflow-hidden">
      <!-- Title bar -->
      <div class="flex items-center gap-2 px-4 py-[10px] bg-white/[0.04] border-b border-white/[0.08]">
        <span class="w-[10px] h-[10px] rounded-full bg-[#ff5f57]"></span>
        <span class="w-[10px] h-[10px] rounded-full bg-[#ffbd2e]"></span>
        <span class="w-[10px] h-[10px] rounded-full bg-[#28ca41]"></span>
        <span class="font-mono text-[11px] text-[#5a6478] mx-auto">framecode — bash — 80×24</span>
      </div>
      <!-- Body -->
      <div class="p-6 font-mono text-[12px] leading-[1.9]">
        <div class="flex gap-3">
          <span class="text-[#00ff88] shrink-0">❯</span>
          <span class="text-[#e8edf5]">npx create-framecode@latest my-app --template=saas-dashboard</span>
        </div>
        <div class="flex gap-3 text-[#00d4ff]"><span class="shrink-0 text-transparent">❯</span> ◆ Fetching template registry...</div>
        <div class="flex gap-3 text-[#00ff88]"><span class="shrink-0 text-transparent">❯</span> ✓ Template resolved: saas-dashboard v3.1.2</div>
        <div class="flex gap-3 text-[#00ff88]"><span class="shrink-0 text-transparent">❯</span> ✓ GitHub fork linked → github.com/you/my-app</div>
        <div class="flex gap-3 text-[#00ff88]"><span class="shrink-0 text-transparent">❯</span> ✓ AI conversion meter calibrated (baseline: 2.3%)</div>
        <div class="flex gap-3 text-[#5a6478]"><span class="shrink-0 text-transparent">❯</span>   → Starting dev server on http://localhost:3000</div>
        <div class="flex items-center gap-3 mt-1">
          <span class="text-[#00ff88]">❯</span>
          <span class="inline-block w-[8px] h-[14px] bg-[#5a6478] animate-[blink_1.1s_step-end_infinite]"></span>
        </div>
      </div>
    </div>
  </section>

  <hr class="border-none border-t border-white/[0.08] my-0" />

  <!-- ─────────────────── FEATURES ─────────────────── -->
  <section class="py-20">
    <p class="font-mono text-[10px] text-[#00ff88] uppercase tracking-[0.3em] mb-4">// Core Modules</p>
    <h2 class="font-display text-[clamp(28px,4vw,44px)] font-bold tracking-[-1.5px] leading-[1.1] mb-4">
      Everything you need.<br />Nothing you don't.
    </h2>
    <p class="text-[15px] text-[#5a6478] max-w-[500px] leading-[1.65] mb-12">
      Each module is independently deployable, composable, and built for production from day one.
    </p>

    <!-- Grid — 1px gaps via background color on the grid container -->
    <div
      class="grid grid-cols-1 md:grid-cols-3 border border-white/[0.08]"
      style="background-color: rgba(255,255,255,0.08); gap: 1px;"
    >
      {#each features as feat}
        <div class="bg-[#070b12] p-8 hover:bg-[#0d1420] transition-colors group relative overflow-hidden cursor-default">
          <!-- Green radial on hover -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style="background: radial-gradient(circle at 50% 0%, rgba(0,255,136,0.08) 0%, transparent 70%);"
          ></div>
          <span class="relative font-mono text-[11px] text-[#00ff88] tracking-[0.15em] mb-5 block">
            {feat.num} // {feat.tag}
          </span>
          <h3 class="relative font-display text-[17px] font-bold tracking-[-0.5px] mb-3">{feat.name}</h3>
          <p class="relative text-[13px] text-[#5a6478] leading-[1.65] mb-4">{feat.desc}</p>
          <span class="relative font-mono text-[10px] px-2 py-[3px] border border-[#3a4154] text-[#5a6478] tracking-[0.08em]">
            {feat.badge}
          </span>
        </div>
      {/each}
    </div>
  </section>

  <hr class="border-none border-t border-white/[0.08]" />

  <!-- ─────────────────── AI METER ─────────────────── -->
  <section class="py-20">
    <p class="font-mono text-[10px] text-[#00ff88] uppercase tracking-[0.3em] mb-4">// AI Conversion Meter</p>
    <h2 class="font-display text-[clamp(28px,4vw,44px)] font-bold tracking-[-1.5px] leading-[1.1] mb-4">
      Know exactly<br />what converts.
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mt-12">
      <!-- Left: copy + checklist -->
      <div>
        <p class="text-[15px] text-[#5a6478] leading-[1.65] mb-8">
          Run any URL or template through the AI engine. Get a conversion score, bottleneck
          breakdown, and instant variant suggestions — in under 3 seconds.
        </p>
        <div class="flex flex-col gap-3">
          {#each ['CTA placement scoring', 'Readability & hierarchy audit', 'Mobile experience regression check', 'A/B variant generation'] as item}
            <div class="flex items-center gap-3 font-mono text-[12px] text-[#5a6478]">
              <span class="text-[#00ff88]">✓</span>{item}
            </div>
          {/each}
        </div>
      </div>

      <!-- Right: meter panel -->
      <div class="border border-white/[0.08] bg-black/40 backdrop-blur-xl p-7">
        <p class="font-mono text-[10px] text-[#5a6478] tracking-[0.15em] mb-5">
          CONVERSION ANALYSIS — saas-hero-v2
        </p>

        {#each meterBars as bar}
          <div class="flex justify-between items-center mb-[10px]">
            <span class="font-mono text-[11px] text-[#5a6478]">{bar.label}</span>
            <span class="font-mono text-[11px] text-[#00ff88]">{bar.value}%</span>
          </div>
          <div class="h-[4px] bg-[#3a4154] mb-4 relative">
            <div class="h-[4px] {barColor(bar.color)} transition-all" style="width: {bar.value}%"></div>
          </div>
        {/each}

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/[0.08] text-center">
          <div>
            <p class="font-mono text-[18px] font-bold text-[#e8edf5]">
              76<span class="text-[12px] text-[#00ff88]">/100</span>
            </p>
            <p class="font-mono text-[9px] text-[#5a6478] tracking-[0.12em] mt-1">OVERALL SCORE</p>
          </div>
          <div>
            <p class="font-mono text-[18px] font-bold text-[#ffb340]">3</p>
            <p class="font-mono text-[9px] text-[#5a6478] tracking-[0.12em] mt-1">ISSUES FOUND</p>
          </div>
          <div>
            <p class="font-mono text-[18px] font-bold text-[#00ff88]">+28%</p>
            <p class="font-mono text-[9px] text-[#5a6478] tracking-[0.12em] mt-1">PROJECTED CVR</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <hr class="border-none border-t border-white/[0.08]" />

  <!-- ─────────────────── TEMPLATES ─────────────────── -->
  <section class="py-20">
    <div class="flex justify-between items-end mb-10">
      <div>
        <p class="font-mono text-[10px] text-[#00ff88] uppercase tracking-[0.3em] mb-4">// Template Library</p>
        <h2 class="font-display text-[32px] font-bold tracking-[-1.5px] leading-[1.1]">
          300+ frameworks.<br />One command.
        </h2>
      </div>
      <button
        class="font-mono text-[12px] uppercase tracking-[0.1em] px-6 py-3
               border border-white/20 text-[#5a6478] hover:border-[#00d4ff] hover:text-[#00d4ff]
               transition-all cursor-pointer shrink-0"
      >
        Browse All →
      </button>
    </div>

    <!-- Horizontal scroll row -->
    <div class="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
      {#each templates as tmpl}
        <div
          class="shrink-0 w-[200px] border border-white/[0.08] bg-white/[0.04]
                 hover:border-[#00ff88] transition-colors cursor-pointer overflow-hidden"
        >
          <!-- Preview bar sketch -->
          <div class="h-[110px] bg-black/50 p-[14px] flex flex-col gap-[5px]">
            <div class="h-[2px] rounded-sm {tmpl.accentClass}" style="width: 60%"></div>
            <div class="h-[2px] rounded-sm bg-[#3a4154]" style="width: 40%"></div>
            <div class="h-[2px] rounded-sm bg-[#3a4154]" style="width: 90%"></div>
            <div class="h-[2px] rounded-sm bg-[#3a4154]" style="width: 75%"></div>
            <div class="h-[4px] rounded-sm mt-2 {tmpl.accentClass}" style="width: 30%"></div>
          </div>
          <div class="p-3">
            <p class="font-display text-[12px] font-bold mb-1">{tmpl.name}</p>
            <p class="font-mono text-[10px] text-[#5a6478] tracking-[0.08em]">{tmpl.stack}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <hr class="border-none border-t border-white/[0.08]" />

  <!-- ─────────────────── FORK TOOLS ─────────────────── -->
  <section class="py-20">
    <p class="font-mono text-[10px] text-[#00ff88] uppercase tracking-[0.3em] mb-4">// ForkTooling Suite</p>
    <h2 class="font-display text-[clamp(28px,4vw,44px)] font-bold tracking-[-1.5px] leading-[1.1] mb-4">
      GitHub-native.<br />Zero friction.
    </h2>
    <p class="text-[15px] text-[#5a6478] max-w-[500px] leading-[1.65] mb-12">
      ForkTools wires your fork, CI pipeline, and deployment in one command. Ship on day one.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each forkTools as tool}
        <div
          class="border border-white/[0.08] bg-white/[0.04] p-6
                 hover:border-[#00d4ff] transition-colors cursor-default relative overflow-hidden group"
        >
          <!-- Ghost number -->
          <span
            class="absolute right-5 bottom-2 font-display text-[72px] font-extrabold
                   text-white/[0.02] leading-none pointer-events-none select-none"
          >{tool.id}</span>
          <p class="font-mono text-[11px] text-[#00d4ff] tracking-[0.15em] mb-3">{tool.name}</p>
          <p class="text-[13px] text-[#5a6478] leading-[1.6] relative z-10">{tool.desc}</p>
        </div>
      {/each}
    </div>
  </section>

  <hr class="border-none border-t border-white/[0.08]" />

  <!-- ─────────────────── GITHUB CARD ─────────────────── -->
  <section class="py-16">
    <div class="border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-7
                grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-6">
      <!-- Icon -->
      <div class="w-11 h-11 border border-white/[0.08] bg-white/[0.06] flex items-center justify-center shrink-0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="rgba(255,255,255,0.6)" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35
                   6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0
                   19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65
                   5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5
                   3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
        </svg>
      </div>
      <!-- Info -->
      <div>
        <h3 class="font-display text-[16px] font-bold mb-1">GitHub Collaboration</h3>
        <p class="text-[13px] text-[#5a6478]">
          Every FrameCode project is a real GitHub repo. No lock-in, no proprietary formats.
          Your code, your rules.
        </p>
      </div>
      <!-- Stats -->
      <div class="flex gap-5 font-mono text-[11px] text-[#5a6478]">
        <div class="text-center"><strong class="text-[#e8edf5] block text-[15px]">12.4k</strong>Stars</div>
        <div class="text-center"><strong class="text-[#e8edf5] block text-[15px]">3.1k</strong>Forks</div>
        <div class="text-center"><strong class="text-[#e8edf5] block text-[15px]">218</strong>Contributors</div>
      </div>
    </div>
  </section>

  <!-- ─────────────────── CTA BANNER ─────────────────── -->
  <section class="mb-0">
    <div
      class="border border-white/20 py-14 px-12 text-center relative overflow-hidden"
      style="background: linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,212,255,0.03));"
    >
      <!-- Glow -->
      <div
        class="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
        style="background: radial-gradient(circle, rgba(0,255,136,0.06), transparent 70%);"
      ></div>

      <h2 class="font-display text-[38px] font-extrabold tracking-[-1.5px] mb-3 relative z-10">
        Ready to ship?
      </h2>
      <p class="text-[14px] text-[#5a6478] mb-8 relative z-10">
        Start with a template. Customize in the IDE. Deploy in minutes.
      </p>

      <div class="flex justify-center gap-3 flex-wrap relative z-10">
       <a href="auth/signup" class="content">
        <button
          class="font-mono text-[12px] uppercase tracking-[0.1em] px-7 py-[14px]
                 bg-[#00ff88] text-black font-bold hover:brightness-110 transition-all cursor-pointer"
        >
          Start Free — No card required
        </button>
       </a>
        <button
          class="font-mono text-[12px] uppercase tracking-[0.1em] px-7 py-[13px]
                 border border-white/20 text-[#5a6478] hover:border-[#00d4ff] hover:text-[#00d4ff]
                 transition-all cursor-pointer"
        >
          View Documentation
        </button>
      </div>

      <p class="font-mono text-[10px] text-[#3a4154] tracking-[0.12em] mt-6 relative z-10">
        $ npx create-framecode@latest my-app
      </p>
    </div>
  </section>

</div>