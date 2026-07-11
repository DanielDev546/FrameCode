<script>
  import { onMount, onDestroy } from 'svelte'
  import { EditorState }        from '@codemirror/state'
  import { EditorView, keymap, lineNumbers, highlightActiveLine,
           highlightActiveLineGutter, drawSelection,
           dropCursor, rectangularSelection,
           highlightSpecialChars }  from '@codemirror/view'
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
  import { indentOnInput, syntaxHighlighting,
           defaultHighlightStyle, bracketMatching,
           foldGutter, foldKeymap }  from '@codemirror/language'
  import { autocompletion, completionKeymap,
           closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
  import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
  import { oneDark }            from '@codemirror/theme-one-dark'
  import { javascript }         from '@codemirror/lang-javascript'
  import { css }                from '@codemirror/lang-css'
  import { html }               from '@codemirror/lang-html'
  import { json }               from '@codemirror/lang-json'
  import { markdown }           from '@codemirror/lang-markdown'

  // ── Props from server ──────────────────────────
  let { data } = $props()
  let { project, fileTree, githubToken, hasGitHub } = data

  // ── Extract owner/repo ─────────────────────────
  let owner = ''
  let repo  = ''
  if (project.repoUrl) {
    ;[owner, repo] = project.repoUrl.replace('https://github.com/', '').split('/')
  }

  // ── IDE state ──────────────────────────────────
  let sidebarOpen   = $state(true)
  let termOpen      = $state(true)
  let previewMode   = $state('desktop')
  let activeFilePath = $state('')
  let expandedDirs  = $state([])
  let cursorLine    = $state(1)
  let cursorCol     = $state(1)
  let fileLoading   = $state(false)

  // ── File contents cache ────────────────────────
  let fileCache = {}

  // ── Tabs ──────────────────────────────────────
  let openTabs = $state([])

  // ── Terminal ──────────────────────────────────
  let termLines = $state([
    { c: '#5a6478', t: `❯ Opening project: ${project.name}` },
    { c: '#00ff88', t: `  ✓ ${project.framework}` },
    { c: hasGitHub ? '#00ff88' : '#5a6478',
      t: hasGitHub
        ? `  ✓ GitHub linked → ${owner}/${repo}`
        : '  ◆ No GitHub repo linked yet' },
    { c: '#5a6478', t: '  ◆ Ready.' },
  ])
  let termInput = $state('')

  // ── Editor ────────────────────────────────────
  let editorEl   = null
  let editorView = null

  // ── Build folder structure from flat file list ─
  let folderTree = $derived.by(() => {
    const dirs = new Set()
    fileTree.forEach(f => {
      const parts = f.path.split('/')
      for (let i = 1; i < parts.length; i++) {
        dirs.add(parts.slice(0, i).join('/'))
      }
    })
    return dirs
  })

  // ── Language detector ──────────────────────────
  function getLang(path) {
    if (!path) return javascript()
    if (path.endsWith('.svelte'))          return html({ matchClosingTags: true })
    if (path.endsWith('.css') || path.endsWith('.scss')) return css()
    if (path.endsWith('.json'))            return json()
    if (path.endsWith('.md'))              return markdown()
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return javascript({ typescript: true, jsx: true })
    if (path.endsWith('.jsx'))             return javascript({ jsx: true })
    return javascript()
  }

  function langDot(path) {
    if (!path) return '#3a4154'
    if (path.endsWith('.svelte')) return '#ff3e00'
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return '#3178c6'
    if (path.endsWith('.js') || path.endsWith('.jsx')) return '#ffb340'
    if (path.endsWith('.css')) return '#00d4ff'
    if (path.endsWith('.json')) return '#5a6478'
    if (path.endsWith('.md')) return '#e8edf5'
    return '#3a4154'
  }

  // ── Create CodeMirror instance ─────────────────
  function createEditor(content, path) {
    if (editorView) { editorView.destroy(); editorView = null }
    if (!editorEl)  return

    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        fileCache[path] = update.state.doc.toString()
        openTabs = openTabs.map(t =>
          t.path === path ? { ...t, dirty: true } : t
        )
      }
      const head = update.state.selection.main.head
      const line = update.state.doc.lineAt(head)
      cursorLine = line.number
      cursorCol  = head - line.from + 1
    })

    editorView = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          foldGutter(),
          drawSelection(),
          dropCursor(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          rectangularSelection(),
          highlightActiveLine(),
          highlightSelectionMatches(),
          keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...completionKeymap,
          ]),
          getLang(path),
          oneDark,
          updateListener,
          EditorView.theme({
            '&': {
              height: '100%',
              fontSize: '12px',
              fontFamily: '"Space Mono", monospace',
              background: '#070b12',
            },
            '.cm-scroller': { overflow: 'auto', background: '#070b12' },
            '.cm-content':  { padding: '16px 0', caretColor: '#00ff88' },
            '.cm-cursor':   { borderLeftColor: '#00ff88' },
            '.cm-gutters':  {
              background: '#070b12',
              borderRight: '1px solid rgba(255,255,255,0.04)',
              color: '#3a4154',
            },
            '.cm-activeLineGutter': { background: 'rgba(255,255,255,0.03)' },
            '.cm-activeLine':       { background: 'rgba(255,255,255,0.03)' },
            '.cm-selectionBackground, ::selection': {
              background: 'rgba(0,255,136,0.15) !important',
            },
          }),
        ],
      }),
      parent: editorEl,
    })
  }

  // ── Open a file ────────────────────────────────
  async function openFile(path) {
    if (activeFilePath === path) return

    // Check cache first
    if (fileCache[path]) {
      activeFilePath = path
      addTab(path)
      createEditor(fileCache[path], path)
      return
    }

    fileLoading = true

    try {
      if (hasGitHub) {
        // Fetch from GitHub
        const res = await fetch(
          `/api/ide/file?owner=${owner}&repo=${repo}&path=${encodeURIComponent(path)}`
        )
        if (res.ok) {
          const { content } = await res.json()
          fileCache[path] = content
          activeFilePath  = path
          addTab(path)
          createEditor(content, path)
          termLines = [...termLines, { c: '#5a6478', t: `  ◆ Opened ${path}` }]
        }
      } else {
        // FC-only project — empty file
        const content   = `// ${path}\n`
        fileCache[path] = content
        activeFilePath  = path
        addTab(path)
        createEditor(content, path)
      }
    } catch (e) {
      termLines = [...termLines, { c: '#ff4f4f', t: `  ✕ Failed to load ${path}` }]
    } finally {
      fileLoading = false
    }
  }

  // ── Tab management ─────────────────────────────
  function addTab(path) {
    if (!openTabs.find(t => t.path === path)) {
      openTabs = [...openTabs, {
        name:  path.split('/').pop(),
        path,
        dirty: false,
      }]
    }
  }

  function closeTab(path, e) {
    e.stopPropagation()
    openTabs = openTabs.filter(t => t.path !== path)
    if (activeFilePath === path) {
      const next = openTabs[openTabs.length - 1]
      if (next) openFile(next.path)
      else {
        activeFilePath = ''
        if (editorView) { editorView.destroy(); editorView = null }
      }
    }
  }

  // ── Terminal input ─────────────────────────────
  function handleTermInput(e) {
    if (e.key !== 'Enter') return
    const cmd = termInput.trim()
    if (!cmd) return
    termLines = [...termLines, { c: '#e8edf5', t: `❯ ${cmd}` }]
    if (cmd === 'clear') {
      termLines = []
    } else if (cmd.startsWith('bun add')) {
      termLines = [...termLines,
        { c: '#00d4ff', t: '  ◆ Resolving packages...' },
        { c: '#00ff88', t: '  ✓ Installed in 340ms' },
      ]
    } else {
      termLines = [...termLines,
        { c: '#ff4f4f', t: `  command not found: ${cmd}` },
      ]
    }
    termInput = ''
  }

  // ── Dir toggle ─────────────────────────────────
  function toggleDir(dir) {
    expandedDirs = expandedDirs.includes(dir)
      ? expandedDirs.filter(d => d !== dir)
      : [...expandedDirs, dir]
  }

  function isDirVisible(dir) {
    if (!dir.includes('/')) return true
    const parent = dir.split('/').slice(0, -1).join('/')
    return expandedDirs.includes(parent) && isDirVisible(parent)
  }

  function isFileVisible(path) {
    const parts = path.split('/')
    if (parts.length === 1) return true
    const parent = parts.slice(0, -1).join('/')
    return expandedDirs.includes(parent) && isDirVisible(parent)
  }

  // ── Lifecycle ──────────────────────────────────
  onMount(() => {
    // Auto-open first file if available
    if (fileTree.length > 0) {
      openFile(fileTree[0].path)
    } else {
      createEditor('// Start coding here\n', 'index.js')
    }
  })

  onDestroy(() => {
    if (editorView) editorView.destroy()
  })
</script>

<div class="flex h-screen bg-[#070b12] text-[#e8edf5] overflow-hidden font-sans select-none">

  <!-- grid bg -->
  <div class="fixed inset-0 pointer-events-none z-0"
    style="background-image:linear-gradient(rgba(0,255,136,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.015) 1px,transparent 1px);background-size:40px 40px;">
  </div>

  <!-- ── SIDEBAR ── -->
  {#if sidebarOpen}
  <aside class="relative z-10 w-[220px] shrink-0 border-r border-white/[0.05] flex flex-col bg-[#070b12] overflow-hidden">

    <!-- project header -->
    <div class="px-4 py-3 border-b border-white/[0.05]">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-mono text-[11px] text-[#e8edf5] font-bold truncate">{project.name}</p>
          <p class="font-mono text-[9px] text-[#3a4154] mt-[1px]">{project.framework}</p>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <span class="w-[5px] h-[5px] rounded-full {hasGitHub ? 'bg-[#00ff88]' : 'bg-[#3a4154]'}"></span>
          <span class="font-mono text-[9px] text-[#3a4154]">{hasGitHub ? 'github' : 'local'}</span>
        </div>
      </div>
    </div>

    <!-- explorer header -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-white/[0.04]">
      <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.2em]">Explorer</p>
      <span class="font-mono text-[9px] text-[#3a4154]">{fileTree.length} files</span>
    </div>

    <!-- file tree -->
    <div class="flex-1 overflow-y-auto py-2 [scrollbar-width:none]">
      {#if fileTree.length === 0}
        <div class="px-4 py-3 font-mono text-[10px] text-[#3a4154]">
          {hasGitHub ? 'Loading files...' : 'Empty project'}
        </div>
      {:else}
        <!-- Render dirs first -->
        {#each [...folderTree].sort() as dir}
          {#if isDirVisible(dir)}
            <button
              onclick={() => toggleDir(dir)}
              class="w-full text-left flex items-center gap-[6px] py-[5px]
                     text-[#5a6478] hover:text-[#e8edf5] hover:bg-white/[0.02] transition-colors"
              style="padding-left: {12 + (dir.split('/').length - 1) * 14}px"
            >
              <span class="font-mono text-[9px] text-[#3a4154] w-[10px]">
                {expandedDirs.includes(dir) ? '▾' : '▸'}
              </span>
              <span class="font-mono text-[11px]">{dir.split('/').pop()}</span>
            </button>
          {/if}
        {/each}

        <!-- Render files -->
        {#each fileTree as file}
          {#if isFileVisible(file.path)}
            <button
              onclick={() => openFile(file.path)}
              class="w-full text-left flex items-center gap-[6px] py-[5px] transition-colors
                     {activeFilePath === file.path
                       ? 'bg-white/[0.05] text-[#e8edf5]'
                       : 'text-[#5a6478] hover:text-[#e8edf5] hover:bg-white/[0.02]'}"
              style="padding-left: {12 + (file.path.split('/').length - 1) * 14}px"
            >
              <span class="w-[5px] h-[5px] rounded-full shrink-0"
                    style="background:{langDot(file.path)}; opacity:0.6;"></span>
              <span class="font-mono text-[11px] truncate">{file.path.split('/').pop()}</span>
            </button>
          {/if}
        {/each}
      {/if}
    </div>

    <!-- back to dashboard -->
    <div class="border-t border-white/[0.05] p-3">
      <a href="/dashboard"
         class="flex items-center gap-2 font-mono text-[10px] text-[#3a4154]
                hover:text-[#5a6478] transition-colors no-underline">
        ← Dashboard
      </a>
    </div>
  </aside>
  {/if}

  <!-- ── MAIN ── -->
  <div class="relative z-10 flex-1 flex flex-col overflow-hidden">

    <!-- top bar -->
    <header class="shrink-0 border-b border-white/[0.05] flex flex-col bg-[#070b12]">
      <div class="flex items-center h-[40px] border-b border-white/[0.04]">

        <!-- sidebar toggle -->
        <div class="flex items-center gap-3 px-4 border-r border-white/[0.05] h-full shrink-0">
          <button
            onclick={() => sidebarOpen = !sidebarOpen}
            class="font-mono text-[12px] text-[#3a4154] hover:text-[#5a6478] transition-colors"
          >☰</button>
          <span class="font-mono text-[11px] font-bold">
            <span class="text-[#3a4154]">[</span><span class="text-[#00ff88]">FC</span><span class="text-[#3a4154]">]</span>
          </span>
        </div>

        <!-- tabs -->
        <div class="flex items-center flex-1 overflow-x-auto [scrollbar-width:none] h-full">
          {#each openTabs as tab}
            <button
              onclick={() => openFile(tab.path)}
              class="flex items-center gap-2 px-4 h-full border-r border-white/[0.04] shrink-0 transition-colors group
                     {activeFilePath === tab.path
                       ? 'bg-[#0d1420] text-[#e8edf5] border-t-2 border-t-[#00ff88]'
                       : 'text-[#3a4154] hover:text-[#5a6478] border-t-2 border-t-transparent'}"
            >
              <span class="w-[5px] h-[5px] rounded-full shrink-0"
                    style="background:{langDot(tab.path)}; opacity:0.7;"></span>
              <span class="font-mono text-[11px]">{tab.name}</span>
              {#if tab.dirty}
                <span class="w-[4px] h-[4px] rounded-full bg-[#ffb340]"></span>
              {/if}
              <span
                onclick={(e) => closeTab(tab.path, e)}
                class="font-mono text-[10px] text-[#3a4154] hover:text-[#ff4f4f]
                       opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >✕</span>
            </button>
          {/each}

          {#if fileLoading}
            <div class="px-4 font-mono text-[10px] text-[#3a4154] animate-pulse">
              Loading...
            </div>
          {/if}
        </div>

        <!-- actions -->
        <div class="flex items-center gap-2 px-4 h-full border-l border-white/[0.04] shrink-0">
          <button class="font-mono text-[10px] uppercase tracking-[0.08em] px-3 py-[5px] border border-white/[0.08] text-[#5a6478] hover:text-[#00ff88] hover:border-[#00ff88]/30 transition-all">
            ▶ Run
          </button>
          <button class="font-mono text-[10px] uppercase tracking-[0.08em] px-3 py-[5px] bg-[#00ff88] text-black hover:brightness-110 transition-all font-bold">
            Deploy
          </button>
        </div>
      </div>

      <!-- breadcrumb -->
      <div class="flex items-center justify-between px-4 h-[26px]">
        <div class="flex items-center gap-1 font-mono text-[9px] text-[#3a4154]">
          {#if activeFilePath}
            {#each activeFilePath.split('/') as part, i}
              <span class="{i === activeFilePath.split('/').length - 1 ? 'text-[#5a6478]' : ''}">{part}</span>
              {#if i < activeFilePath.split('/').length - 1}
                <span class="mx-[2px]">/</span>
              {/if}
            {/each}
          {:else}
            <span>No file open</span>
          {/if}
        </div>
        <div class="flex items-center gap-4 font-mono text-[9px] text-[#3a4154]">
          <span>Ln {cursorLine}, Col {cursorCol}</span>
          <span>{activeFilePath.split('.').pop()?.toUpperCase() || '—'}</span>
          <span>UTF-8</span>
          <span class="text-[#00ff88]">● Prettier</span>
        </div>
      </div>
    </header>

    <!-- editor + preview -->
    <div class="flex-1 flex overflow-hidden">

      <!-- CodeMirror -->
      <div bind:this={editorEl} class="flex-1 overflow-hidden"></div>

      <!-- divider -->
      <div class="w-[1px] bg-white/[0.05] shrink-0"></div>

      <!-- preview -->
      <div class="w-[360px] shrink-0 flex flex-col">
        <div class="shrink-0 h-[36px] border-b border-white/[0.05] flex items-center justify-between px-4">
          <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.15em]">Preview</p>
          <div class="flex items-center gap-1">
            {#each [['desktop','⬜'],['tablet','▭'],['mobile','▯']] as [mode, icon]}
              <button
                onclick={() => previewMode = mode}
                class="font-mono text-[11px] w-[24px] h-[24px] flex items-center justify-center
                       {previewMode === mode ? 'text-[#00ff88]' : 'text-[#3a4154] hover:text-[#5a6478]'}"
              >{icon}</button>
            {/each}
          </div>
        </div>
        <div class="flex-1 bg-[#050810] flex items-center justify-center p-3">
          <div class="border border-white/[0.08] h-full flex items-center justify-center
                      transition-all duration-300"
               style="width:{previewMode==='mobile'?'375px':previewMode==='tablet'?'600px':'100%'};max-width:100%;">
            <p class="font-mono text-[10px] text-[#3a4154] text-center">
              Preview available for<br/>HTML/CSS/JS files
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- terminal -->
    <div class="shrink-0 border-t border-white/[0.05] bg-[#050810] flex flex-col"
         style="height: {termOpen ? 200 : 32}px;">
      <div class="shrink-0 h-[32px] flex items-center justify-between px-4 border-b border-white/[0.04]">
        <div class="flex items-center gap-4">
          <button
            onclick={() => termOpen = !termOpen}
            class="font-mono text-[9px] text-[#3a4154] hover:text-[#5a6478] transition-colors uppercase tracking-[0.15em] flex items-center gap-2"
          >
            <span>{termOpen ? '▾' : '▸'}</span>Terminal
          </button>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-mono text-[9px] text-[#00ff88]">● {project.name}</span>
          <button onclick={() => termLines = []}
                  class="font-mono text-[9px] text-[#3a4154] hover:text-[#5a6478] transition-colors">
            clear
          </button>
        </div>
      </div>

      {#if termOpen}
        <div class="flex-1 overflow-y-auto px-4 py-3 [scrollbar-width:thin] [scrollbar-color:#1a2030_transparent] font-mono text-[11px]">
          {#each termLines as line}
            <div class="leading-[1.8]" style="color:{line.c}">{line.t}</div>
          {/each}
          <div class="flex items-center gap-2 mt-1">
            <span class="text-[#00ff88]">❯</span>
            <input
              bind:value={termInput}
              onkeydown={handleTermInput}
              placeholder="type a command..."
              class="flex-1 bg-transparent outline-none text-[#e8edf5] font-mono text-[11px]
                     placeholder:text-[#3a4154] caret-[#00ff88]"
            />
          </div>
        </div>
      {/if}
    </div>

  </div>
</div>