<script>
  // ── State ──────────────────────────────────────────────────
  let activeFile    = $state('index.svelte')
  let termOpen      = $state(true)
  let termHeight    = $state(180)
  let previewMode   = $state('desktop')
  let sidebarOpen   = $state(true)
  let expandedDirs  = $state(['src', 'src/routes', 'src/lib'])

  const openTabs = $state([
    { name: '+page.svelte',  path: 'src/routes/+page.svelte',  dirty: true  },
    { name: '+layout.svelte',path: 'src/routes/+layout.svelte', dirty: false },
    { name: 'app.css',       path: 'src/app.css',              dirty: false },
  ])

  let activeTab = $state('src/routes/+page.svelte')

  // ── File tree ─────────────────────────────────────────────
  const tree = [
    { type: 'dir',  path: 'src',               label: 'src',             depth: 0 },
    { type: 'dir',  path: 'src/routes',         label: 'routes',          depth: 1 },
    { type: 'file', path: 'src/routes/+page.svelte',   label: '+page.svelte',   depth: 2, lang: 'svelte' },
    { type: 'file', path: 'src/routes/+layout.svelte',  label: '+layout.svelte', depth: 2, lang: 'svelte' },
    { type: 'dir',  path: 'src/lib',            label: 'lib',             depth: 1 },
    { type: 'dir',  path: 'src/lib/server',     label: 'server',          depth: 2 },
    { type: 'file', path: 'src/lib/server/auth.js',     label: 'auth.js',        depth: 3, lang: 'js' },
    { type: 'dir',  path: 'src/lib/server/db',  label: 'db',              depth: 3 },
    { type: 'file', path: 'src/lib/server/db/schema.js',label: 'schema.js',      depth: 4, lang: 'js' },
    { type: 'file', path: 'src/lib/server/db/index.js', label: 'index.js',       depth: 4, lang: 'js' },
    { type: 'file', path: 'src/app.css',         label: 'app.css',        depth: 1, lang: 'css' },
    { type: 'file', path: 'tailwind.config.js',  label: 'tailwind.config.js', depth: 0, lang: 'js' },
    { type: 'file', path: 'package.json',        label: 'package.json',   depth: 0, lang: 'json' },
    { type: 'file', path: '.env',                label: '.env',           depth: 0, lang: 'env' },
  ]

  // ── Fake code content ─────────────────────────────────────
  const codeLines = [
    { n: 1,  tokens: [{ t: 'dim', v: '<' }, { t: 'tag', v: 'script' }, { t: 'dim', v: '>' }] },
    { n: 2,  tokens: [{ t: 'kw', v: '  let' }, { t: 'plain', v: ' showPass ' }, { t: 'dim', v: '=' }, { t: 'fn', v: ' $state' }, { t: 'dim', v: '(' }, { t: 'bool', v: 'false' }, { t: 'dim', v: ')' }] },
    { n: 3,  tokens: [{ t: 'kw', v: '  let' }, { t: 'plain', v: ' email    ' }, { t: 'dim', v: '=' }, { t: 'fn', v: ' $state' }, { t: 'dim', v: '(' }, { t: 'str', v: "''" }, { t: 'dim', v: ')' }] },
    { n: 4,  tokens: [{ t: 'kw', v: '  let' }, { t: 'plain', v: ' password ' }, { t: 'dim', v: '=' }, { t: 'fn', v: ' $state' }, { t: 'dim', v: '(' }, { t: 'str', v: "''" }, { t: 'dim', v: ')' }] },
    { n: 5,  tokens: [{ t: 'plain', v: '' }] },
    { n: 6,  tokens: [{ t: 'kw', v: '  let' }, { t: 'plain', v: ' canSubmit ' }, { t: 'dim', v: '=' }, { t: 'fn', v: ' $derived' }, { t: 'dim', v: '(' }] },
    { n: 7,  tokens: [{ t: 'plain', v: '    email' }, { t: 'dim', v: '.' }, { t: 'fn', v: 'length' }, { t: 'dim', v: ' > ' }, { t: 'num', v: '3' }, { t: 'dim', v: ' && ' }, { t: 'plain', v: 'password' }, { t: 'dim', v: '.' }, { t: 'fn', v: 'length' }, { t: 'dim', v: ' >= ' }, { t: 'num', v: '6' }] },
    { n: 8,  tokens: [{ t: 'dim', v: '  )' }] },
    { n: 9,  tokens: [{ t: 'dim', v: '</' }, { t: 'tag', v: 'script' }, { t: 'dim', v: '>' }] },
    { n: 10, tokens: [{ t: 'plain', v: '' }] },
    { n: 11, tokens: [{ t: 'dim', v: '<' }, { t: 'tag', v: 'div' }, { t: 'attr', v: ' class' }, { t: 'dim', v: '="' }, { t: 'str', v: 'flex min-h-screen' }, { t: 'dim', v: '">' }] },
    { n: 12, tokens: [{ t: 'comment', v: '  <!-- LEFT PANEL -->' }] },
    { n: 13, tokens: [{ t: 'dim', v: '  <' }, { t: 'tag', v: 'div' }, { t: 'attr', v: ' class' }, { t: 'dim', v: '="' }, { t: 'str', v: 'flex-1 flex items-center' }, { t: 'dim', v: '">' }] },
    { n: 14, tokens: [{ t: 'dim', v: '    <' }, { t: 'tag', v: 'h1' }, { t: 'attr', v: ' class' }, { t: 'dim', v: '="' }, { t: 'str', v: 'font-display text-[36px]' }, { t: 'dim', v: '">' }] },
    { n: 15, tokens: [{ t: 'plain', v: '      Welcome back, ' }, { t: 'dim', v: '<' }, { t: 'tag', v: 'span' }, { t: 'dim', v: '>' }, { t: 'plain', v: 'engineer.' }, { t: 'dim', v: '</' }, { t: 'tag', v: 'span' }, { t: 'dim', v: '>' }] },
    { n: 16, tokens: [{ t: 'dim', v: '    </' }, { t: 'tag', v: 'h1' }, { t: 'dim', v: '>' }] },
    { n: 17, tokens: [{ t: 'plain', v: '' }] },
    { n: 18, tokens: [{ t: 'comment', v: '    <!-- OAuth buttons -->' }] },
    { n: 19, tokens: [{ t: 'dim', v: '    <' }, { t: 'tag', v: 'button' }] },
    { n: 20, tokens: [{ t: 'attr', v: '      onclick' }, { t: 'dim', v: '={() => ' }, { t: 'fn', v: 'handleOAuth' }, { t: 'dim', v: "('github')" }, { t: 'dim', v: '}' }] },
    { n: 21, tokens: [{ t: 'attr', v: '      class' }, { t: 'dim', v: '="' }, { t: 'str', v: 'w-full flex items-center gap-3' }, { t: 'dim', v: '"' }] },
    { n: 22, tokens: [{ t: 'dim', v: '    >' }] },
    { n: 23, tokens: [{ t: 'dim', v: '    </' }, { t: 'tag', v: 'button' }, { t: 'dim', v: '>' }] },
    { n: 24, tokens: [{ t: 'plain', v: '' }] },
    { n: 25, tokens: [{ t: 'dim', v: '</' }, { t: 'tag', v: 'div' }, { t: 'dim', v: '>' }] },
  ]

  function tokenColor(t) {
    if (t === 'kw')      return '#00d4ff'
    if (t === 'fn')      return '#00ff88'
    if (t === 'str')     return '#ffb340'
    if (t === 'num')     return '#ff8c69'
    if (t === 'bool')    return '#ff8c69'
    if (t === 'tag')     return '#00d4ff'
    if (t === 'attr')    return '#00ff88'
    if (t === 'comment') return '#3a4154'
    if (t === 'dim')     return '#5a6478'
    return '#e8edf5'
  }

  function langColor(lang) {
    if (lang === 'svelte') return '#ff3e00'
    if (lang === 'js')     return '#ffb340'
    if (lang === 'css')    return '#00d4ff'
    if (lang === 'json')   return '#5a6478'
    return '#3a4154'
  }

  function toggleDir(path) {
    if (expandedDirs.includes(path)) {
      expandedDirs = expandedDirs.filter(d => d !== path)
    } else {
      expandedDirs = [...expandedDirs, path]
    }
  }

  function isVisible(node) {
    if (node.depth === 0) return true
    const parts = node.path.split('/')
    parts.pop()
    const parent = parts.join('/')
    if (!expandedDirs.includes(parent)) return false
    if (node.depth === 1) return expandedDirs.includes('src') || !node.path.startsWith('src/')
    return isVisible({ path: parent, depth: node.depth - 1 }) 
  }

  const termLines = [
    { c: '#5a6478',  t: '❯ vite dev' },
    { c: '#00ff88',  t: '  ✓  ready in 312ms' },
    { c: '#00d4ff',  t: '  ◆  Local:   http://localhost:5173/' },
    { c: '#5a6478',  t: '  ◆  Network: use --host to expose' },
    { c: '#00ff88',  t: '  ✓  +page.svelte compiled (44ms)' },
    { c: '#5a6478',  t: '  ◆  watching for file changes...' },
  ]

  // cursor line for active file tab
  let cursorLine = $state(14)
  let cursorCol  = $state(28)
</script>
<textarea ></textarea>
<!-- Root: fixed height, no scroll -->
<div class="flex h-screen bg-[#070b12] text-[#e8edf5] overflow-hidden font-sans select-none">

  <!-- grid -->
  <div class="fixed inset-0 pointer-events-none z-0"
    style="background-image:linear-gradient(rgba(0,255,136,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.015) 1px,transparent 1px);background-size:40px 40px;">
  </div>

  <!-- ── SIDEBAR: file tree ── -->
  {#if sidebarOpen}
  <aside class="relative z-10 w-[210px] shrink-0 border-r border-white/[0.05] flex flex-col bg-[#070b12] overflow-hidden">

    <!-- project header -->
    <div class="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
      <div>
        <p class="font-mono text-[11px] text-[#e8edf5] font-bold tracking-tight">saas-hero-v2</p>
        <p class="font-mono text-[9px] text-[#3a4154] mt-[1px]">SvelteKit · Tailwind</p>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-[5px] h-[5px] rounded-full bg-[#00ff88]"></span>
        <span class="font-mono text-[9px] text-[#3a4154]">dev</span>
      </div>
    </div>

    <!-- tree actions -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-white/[0.04]">
      <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.2em]">Explorer</p>
      <div class="flex gap-2">
        {#each ['＋', '⊞', '↺'] as icon}
          <button class="font-mono text-[11px] text-[#3a4154] hover:text-[#5a6478] transition-colors w-[18px] h-[18px] flex items-center justify-center">
            {icon}
          </button>
        {/each}
      </div>
    </div>

    <!-- file tree -->
    <div class="flex-1 overflow-y-auto py-2 [scrollbar-width:none]">
      {#each tree as node}
        {#if isVisible(node)}
          <button
            onclick={() => node.type === 'dir' ? toggleDir(node.path) : activeTab = node.path}
            class="w-full text-left flex items-center gap-[6px] py-[5px] px-3 transition-colors
                   {activeTab === node.path
                     ? 'bg-white/[0.05] text-[#e8edf5]'
                     : 'text-[#5a6478] hover:text-[#e8edf5] hover:bg-white/[0.02]'}"
            style="padding-left: {12 + node.depth * 14}px"
          >
            {#if node.type === 'dir'}
              <span class="font-mono text-[9px] text-[#3a4154] w-[10px]">
                {expandedDirs.includes(node.path) ? '▾' : '▸'}
              </span>
              <span class="font-mono text-[11px]">{node.label}</span>
            {:else}
              <span class="w-[6px] h-[6px] rounded-full shrink-0" style="background:{langColor(node.lang)}; opacity:0.5;"></span>
              <span class="font-mono text-[11px] truncate">{node.label}</span>
              {#if openTabs.find(t => t.path === node.path)?.dirty}
                <span class="ml-auto w-[5px] h-[5px] rounded-full bg-[#ffb340] shrink-0"></span>
              {/if}
            {/if}
          </button>
        {/if}
      {/each}
    </div>
  </aside>
  {/if}

  <!-- ── CENTER + RIGHT ── -->
  <div class="relative z-10 flex-1 flex flex-col overflow-hidden">

    <!-- ── TOP BAR ── -->
    <header class="shrink-0 border-b border-white/[0.05] flex flex-col bg-[#070b12]">

      <!-- row 1: menu + tabs + actions -->
      <div class="flex items-center h-[40px] border-b border-white/[0.04]">

        <!-- sidebar toggle + logo -->
        <div class="flex items-center gap-3 px-4 border-r border-white/[0.05] h-full shrink-0">
          <button
            onclick={() => sidebarOpen = !sidebarOpen}
            class="font-mono text-[12px] text-[#3a4154] hover:text-[#5a6478] transition-colors"
          >☰</button>
          <span class="font-mono text-[11px] font-bold">
            <span class="text-[#3a4154]">[</span><span class="text-[#00ff88]">FC</span><span class="text-[#3a4154]">]</span>
          </span>
        </div>

        <!-- file tabs -->
        <div class="flex items-center flex-1 overflow-x-auto [scrollbar-width:none] h-full">
          {#each openTabs as tab}
            <button
              onclick={() => activeTab = tab.path}
              class="flex items-center gap-2 px-4 h-full border-r border-white/[0.04] shrink-0 transition-colors
                     {activeTab === tab.path
                       ? 'bg-[#0d1420] text-[#e8edf5] border-t border-t-[#00ff88]'
                       : 'text-[#3a4154] hover:text-[#5a6478] border-t border-t-transparent'}"
            >
              <span class="font-mono text-[11px]">{tab.name}</span>
              {#if tab.dirty}
                <span class="w-[4px] h-[4px] rounded-full bg-[#ffb340]"></span>
              {:else}
                <span class="font-mono text-[10px] text-[#3a4154] opacity-0 hover:opacity-100">✕</span>
              {/if}
            </button>
          {/each}
        </div>

        <!-- right actions -->
        <div class="flex items-center gap-2 px-4 h-full border-l border-white/[0.04] shrink-0">
          <button class="font-mono text-[10px] uppercase tracking-[0.08em] px-3 py-[5px] border border-white/[0.08] text-[#5a6478] hover:text-[#e8edf5] hover:border-white/20 transition-all">
            ▶ Run
          </button>
          <button class="font-mono text-[10px] uppercase tracking-[0.08em] px-3 py-[5px] bg-[#00ff88] text-black hover:brightness-110 transition-all font-bold">
            Deploy
          </button>
        </div>
      </div>

      <!-- row 2: breadcrumb + status -->
      <div class="flex items-center justify-between px-4 h-[28px]">
        <div class="flex items-center gap-1 font-mono text-[9px] text-[#3a4154]">
          <span>src</span><span class="mx-1">/</span>
          <span>routes</span><span class="mx-1">/</span>
          <span class="text-[#5a6478]">+page.svelte</span>
        </div>
        <div class="flex items-center gap-4 font-mono text-[9px] text-[#3a4154]">
          <span>Ln {cursorLine}, Col {cursorCol}</span>
          <span>Svelte</span>
          <span>UTF-8</span>
          <span class="text-[#00ff88]">● Prettier</span>
        </div>
      </div>
    </header>

    <!-- ── EDITOR + PREVIEW ── -->
    <div class="flex-1 flex overflow-hidden" style="height: calc(100% - 68px - {termOpen ? termHeight : 32}px)">

      <!-- CODE EDITOR -->
      <div class="flex-1 overflow-auto bg-[#070b12] [scrollbar-width:thin] [scrollbar-color:#1a2030_transparent] select-text">
        <div class="flex min-h-full">

          <!-- line numbers -->
          <div class="shrink-0 w-[44px] pt-4 pb-4 text-right pr-3 border-r border-white/[0.04] sticky left-0 bg-[#070b12]">
            {#each codeLines as line}
              <div
                class="font-mono text-[12px] leading-[1.7] cursor-pointer transition-colors
                       {cursorLine === line.n ? 'text-[#5a6478]' : 'text-[#3a4154]'}"
                onclick={() => cursorLine = line.n}
              >
                {line.n}
              </div>
            {/each}
          </div>

          <!-- code -->
          <div class="flex-1 pt-4 pb-4 pl-4 font-mono text-[12px] leading-[1.7] overflow-x-auto">
            {#each codeLines as line}
              <div
                class="whitespace-pre flex items-center min-h-[20px] px-1 transition-colors
                       {cursorLine === line.n ? 'bg-white/[0.03]' : ''}"
                onclick={() => cursorLine = line.n}
              >
                {#each line.tokens as token}
                  <span style="color:{tokenColor(token.t)}">{token.v}</span>
                {/each}
                {#if cursorLine === line.n}
                  <span class="inline-block w-[2px] h-[14px] bg-[#00ff88] ml-[1px] animate-[blink_1.1s_step-end_infinite] align-middle"></span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- DIVIDER -->
      <div class="w-[1px] bg-white/[0.05] shrink-0"></div>

      <!-- LIVE PREVIEW -->
      <div class="w-[380px] shrink-0 flex flex-col border-l border-white/[0.05]">

        <!-- preview toolbar -->
        <div class="shrink-0 h-[36px] border-b border-white/[0.05] flex items-center justify-between px-4">
          <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.15em]">Preview</p>
          <div class="flex items-center gap-1">
            {#each [['desktop','⬜'],['tablet','▭'],['mobile','▯']] as [mode, icon]}
              <button
                onclick={() => previewMode = mode}
                class="font-mono text-[11px] w-[24px] h-[24px] flex items-center justify-center transition-colors
                       {previewMode === mode ? 'text-[#00ff88]' : 'text-[#3a4154] hover:text-[#5a6478]'}"
              >{icon}</button>
            {/each}
            <div class="w-[1px] h-[14px] bg-white/[0.06] mx-1"></div>
            <button class="font-mono text-[11px] text-[#3a4154] hover:text-[#5a6478] transition-colors">↺</button>
            <button class="font-mono text-[11px] text-[#3a4154] hover:text-[#5a6478] transition-colors ml-1">↗</button>
          </div>
        </div>

        <!-- iframe shell -->
        <div class="flex-1 bg-[#050810] flex items-center justify-center overflow-hidden p-4">
          <div
            class="bg-[#070b12] border border-white/[0.08] overflow-hidden transition-all duration-300 h-full"
            style="width: {previewMode === 'mobile' ? '375px' : previewMode === 'tablet' ? '768px' : '100%'}; max-width:100%;"
          >
            <!-- mock preview content -->
            <div class="p-6 h-full overflow-hidden">
              <div class="font-mono text-[9px] text-[#3a4154] mb-4 uppercase tracking-[0.2em]">// auth.login</div>
              <div class="font-display text-[18px] font-bold tracking-[-0.5px] mb-1 text-[#e8edf5]">Welcome back,</div>
              <div class="font-display text-[18px] font-bold tracking-[-0.5px] text-[#00ff88] mb-4">engineer.</div>
              <div class="border border-white/[0.08] bg-white/[0.02] px-3 py-2 mb-2 flex items-center gap-2">
                <div class="w-[12px] h-[12px] rounded-full border border-white/[0.2]"></div>
                <div class="font-mono text-[9px] text-[#5a6478]">Continue with GitHub</div>
              </div>
              <div class="border border-white/[0.08] bg-white/[0.02] px-3 py-2 mb-4 flex items-center gap-2">
                <div class="w-[12px] h-[12px] rounded-full border border-white/[0.2]"></div>
                <div class="font-mono text-[9px] text-[#5a6478]">Continue with Google</div>
              </div>
              <div class="h-[1px] bg-white/[0.06] mb-4"></div>
              <div class="border border-white/[0.08] bg-white/[0.02] px-3 py-2 mb-2">
                <div class="font-mono text-[8px] text-[#3a4154] mb-1">EMAIL</div>
                <div class="font-mono text-[9px] text-[#5a6478]">you@example.com</div>
              </div>
              <div class="border border-white/[0.08] bg-white/[0.02] px-3 py-2 mb-3">
                <div class="font-mono text-[8px] text-[#3a4154] mb-1">PASSWORD</div>
                <div class="font-mono text-[9px] text-[#3a4154]">••••••••</div>
              </div>
              <div class="bg-[#00ff88] px-3 py-2 text-center">
                <div class="font-mono text-[9px] text-black font-bold">SIGN IN →</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── TERMINAL ── -->
    <div class="shrink-0 border-t border-white/[0.05] bg-[#050810] flex flex-col"
         style="height: {termOpen ? termHeight : 32}px;">

      <!-- terminal header -->
      <div class="shrink-0 h-[32px] flex items-center justify-between px-4 border-b border-white/[0.04]">
        <div class="flex items-center gap-4">
          <button
            onclick={() => termOpen = !termOpen}
            class="font-mono text-[9px] text-[#3a4154] hover:text-[#5a6478] transition-colors uppercase tracking-[0.15em] flex items-center gap-2"
          >
            <span>{termOpen ? '▾' : '▸'}</span>
            Terminal
          </button>
          <span class="font-mono text-[9px] text-[#3a4154]">bash</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-mono text-[9px] text-[#00ff88]">● dev server running</span>
          <button class="font-mono text-[10px] text-[#3a4154] hover:text-[#ff4f4f] transition-colors">✕</button>
        </div>
      </div>

      <!-- terminal body -->
      {#if termOpen}
        <div class="flex-1 overflow-y-auto px-4 py-3 [scrollbar-width:thin] [scrollbar-color:#1a2030_transparent]">
          {#each termLines as line}
            <div class="font-mono text-[11px] leading-[1.8]" style="color:{line.c}">{line.t}</div>
          {/each}
          <div class="flex items-center gap-2 mt-1">
            <span class="font-mono text-[11px] text-[#00ff88]">❯</span>
            <span class="inline-block w-[6px] h-[12px] bg-[#5a6478] animate-[blink_1.1s_step-end_infinite]"></span>
          </div>
        </div>
      {/if}
    </div>

  </div>
</div>