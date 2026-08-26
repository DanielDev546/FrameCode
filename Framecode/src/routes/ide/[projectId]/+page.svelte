<script lang="ts">

    import DashboardLayout from '$lib/layout/DashboardLayout.svelte'

    import { onMount, onDestroy } from 'svelte'

    import { EditorState } from '@codemirror/state'

    import {

        EditorView,

        keymap,

        lineNumbers,

        highlightActiveLine,

        highlightActiveLineGutter,

        drawSelection,

        dropCursor,

        rectangularSelection,

        highlightSpecialChars

    } from '@codemirror/view'

    import {

        defaultKeymap,

        history,

        historyKeymap

    } from '@codemirror/commands'

    import {

        indentOnInput,

        syntaxHighlighting,

        defaultHighlightStyle,

        bracketMatching,

        foldGutter,

        foldKeymap

    } from '@codemirror/language'

    import {

        autocompletion,

        completionKeymap,

        closeBrackets,

        closeBracketsKeymap

    } from '@codemirror/autocomplete'

    import {

        searchKeymap,

        highlightSelectionMatches

    } from '@codemirror/search'

    import { oneDark } from '@codemirror/theme-one-dark'

    import { javascript } from '@codemirror/lang-javascript'

    import { css } from '@codemirror/lang-css'

    import { html } from '@codemirror/lang-html'

    import { json } from '@codemirror/lang-json'

    import { markdown } from '@codemirror/lang-markdown'

    type FileNode = {

        path: string

        sha?: string | null

        size?: number

    }

    type OpenTab = {

        name: string

        path: string

        dirty: boolean

    }

    type TerminalLine = {

        c: string

        t: string

    }

    let { data } = $props()

    let project = $derived(data.project)

    let fileTree = $state<FileNode[]>(

        data.fileTree ?? []

    )

    let hasGitHub = $derived(

        data.hasGitHub ?? false

    )

    let scaffoldFiles: Record<string, string> =

        (data.scaffoldFiles as Record<string, string> | undefined) ?? {}

    let fileCache = $state<Record<string, string>>({})

    let expandedDirs = $state<string[]>([])

    let sidebarOpen = $state(true)
    let mobileSidebarOpen = $state(false)
    let mobilePane = $state<'editor' | 'preview'>('editor')

    let termOpen = $state(true)

    let previewMode = $state<

        'desktop' | 'tablet' | 'mobile'

    >('desktop')

    let previewHtml = $state('')

    let previewKey = $state(0)

    let activeFilePath = $state('')

    let cursorLine = $state(1)

    let cursorCol = $state(1)

    let fileLoading = $state(false)

    let openTabs = $state<OpenTab[]>([])

    let saveStatus = $state<

        'idle' | 'saving' | 'saved' | 'error'

    >('idle')

    let autoSaveTimer:

        | ReturnType<typeof setTimeout>

        | null = null

    let editorEl =

        $state<HTMLElement | null>(null)

    let editorView =

        $state<EditorView | null>(null)

    let termInput = $state('')

    let termLines =

        $state<TerminalLine[]>([])

    let owner = ''

    let repo = ''

    if (project?.repoUrl) {

        const parts = project.repoUrl

            .replace('https://github.com/', '')

            .split('/')

        owner = parts[0] ?? ''

        repo = parts[1] ?? ''

    }

    // ─────────────────────────────────────────────

    // SCAFFOLD

    // ─────────────────────────────────────────────

    if (Object.keys(scaffoldFiles).length > 0) {

        Object.entries(scaffoldFiles).forEach(

            ([path, content]) => {

                fileCache[path] = content

            }

        )

        fileTree = Object.keys(

            scaffoldFiles

        ).map((path) => ({

            path,

            sha: null,

            size: 0

        }))

        const dirs = new Set<string>()

        fileTree.forEach((file) => {

            const parts = file.path.split('/')

            for (

                let i = 1;

                i < parts.length;

                i++

            ) {

                dirs.add(

                    parts.slice(0, i).join('/')

                )

            }

        })

        expandedDirs = [...dirs]

    }

    // ─────────────────────────────────────────────

    // DIRECTORY TREE

    // ─────────────────────────────────────────────

    let folderTree = $derived.by(() => {

        const dirs = new Set<string>()

        fileTree.forEach((file) => {

            const parts = file.path.split('/')

            for (

                let i = 1;

                i < parts.length;

                i++

            ) {

                dirs.add(

                    parts.slice(0, i).join('/')

                )

            }

        })

        return dirs

    })

    function toggleDir(dir: string) {

        expandedDirs = expandedDirs.includes(dir)

            ? expandedDirs.filter(

                    (d) => d !== dir

                )

            : [...expandedDirs, dir]

    }

    function isDirVisible(dir: string): boolean {

        if (!dir.includes('/')) {

            return true

        }

        const parent = dir

            .split('/')

            .slice(0, -1)

            .join('/')

        return (

            expandedDirs.includes(parent) &&

            isDirVisible(parent)

        )

    }

    function isFileVisible(path: string): boolean {

        const parts = path.split('/')

        if (parts.length === 1) {

            return true

        }

        const parent = parts

            .slice(0, -1)

            .join('/')

        return (

            expandedDirs.includes(parent) &&

            isDirVisible(parent)

        )

    }

    // ─────────────────────────────────────────────

    // LANGUAGE

    // ─────────────────────────────────────────────

    function getLang(path: string) {

        if (!path) {

            return javascript()

        }

        if (path.endsWith('.svelte')) {

            return html({

                matchClosingTags: true

            })

        }

        if (

            path.endsWith('.css') ||

            path.endsWith('.scss')

        ) {

            return css()

        }

        if (path.endsWith('.json')) {

            return json()

        }

        if (path.endsWith('.md')) {

            return markdown()

        }

        if (

            path.endsWith('.ts') ||

            path.endsWith('.tsx')

        ) {

            return javascript({

                typescript: true,

                jsx: true

            })

        }

        if (path.endsWith('.jsx')) {

            return javascript({

                jsx: true

            })

        }

        return javascript()

    }

    function langDot(path: string) {

        if (!path) return '#3a4154'

        if (path.endsWith('.svelte')) {

            return '#ff3e00'

        }

        if (

            path.endsWith('.ts') ||

            path.endsWith('.tsx')

        ) {

            return '#3178c6'

        }

        if (

            path.endsWith('.js') ||

            path.endsWith('.jsx')

        ) {

            return '#ffb340'

        }

        if (path.endsWith('.css')) {

            return '#00d4ff'

        }

        if (path.endsWith('.json')) {

            return '#5a6478'

        }

        if (path.endsWith('.md')) {

            return '#e8edf5'

        }

        return '#3a4154'

    }

    // ─────────────────────────────────────────────

    // TABS

    // ─────────────────────────────────────────────

    function addTab(path: string) {

        if (

            openTabs.some(

                (tab) => tab.path === path

            )

        ) {

            return

        }

        openTabs = [

            ...openTabs,

            {

                name:

                    path.split('/').pop() ??

                    path,

                path,

                dirty: false

            }

        ]

    }

    async function closeTab(

        path: string,

        event: MouseEvent

    ) {

        event.stopPropagation()

        const remaining = openTabs.filter(

            (tab) => tab.path !== path

        )

        openTabs = remaining

        if (activeFilePath !== path) {

            return

        }

        const next =

            remaining[remaining.length - 1]

        if (next) {

            await openFile(next.path)

            return

        }

        activeFilePath = ''

        if (editorView) {

            editorView.destroy()

            editorView = null

        }

    }

    // ─────────────────────────────────────────────

    // PREVIEW

    // ─────────────────────────────────────────────

    function previewFiles() {
        return Object.entries(fileCache)
            .filter(([path, content]) => typeof content === 'string')
            .map(([path, content]) => ({ path, content }))
    }

    function findPreviewFile(...names: string[]) {
        const files = previewFiles()
        for (const name of names) {
            const exact = files.find((file) => file.path === name)
            if (exact) return exact
        }
        for (const name of names) {
            const found = files.find((file) => file.path.endsWith(name))
            if (found) return found
        }
        return null
    }

    function collectCss() {
        return previewFiles()
            .filter(({ path }) => /\.(css|scss)$/.test(path))
            .map(({ content }) => content)
            .join('\n')
    }

    function stripModuleSyntax(source: string) {
        return source
            .replace(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
            .replace(/^\s*import\s+['"][^'"]+['"];?\s*$/gm, '')
            .replace(/^\s*export\s+default\s+/gm, '')
            .replace(/^\s*export\s+(?=(const|let|var|function|class)\b)/gm, '')
    }

    function makeVanillaPreview() {
        const htmlFile = findPreviewFile('index.html', 'app.html')
        let htmlContent = htmlFile?.content ?? ''
        if (!htmlContent) return ''

        const cssContent = collectCss()
        if (cssContent) {
            const style = `<style>${cssContent}</style>`
            htmlContent = htmlContent.includes('</head>')
                ? htmlContent.replace('</head>', `${style}</head>`)
                : style + htmlContent
        }

        const jsContent = previewFiles()
            .filter(({ path }) => /\.(js|ts)$/.test(path) && !/\.(jsx|tsx)$/.test(path))
            .map(({ content }) => content)
            .join('\n')

        if (jsContent) {
            const script = `<script type="module">${jsContent}<\/script>`
            htmlContent = htmlContent.includes('</body>')
                ? htmlContent.replace('</body>', `${script}</body>`)
                : htmlContent + script
        }

        return htmlContent
    }

    function makeReactPreview() {
        const files = previewFiles().filter(({ path }) => /\.(jsx|tsx|js|ts)$/.test(path))
        if (!files.length) return ''

        const source = files
            .map(({ path, content }) => `\n// --- ${path} ---\n${stripModuleSyntax(content)}`)
            .join('\n')

        const css = collectCss()
        const candidates = [...new Set(
            files.flatMap(({ content }) => [
                ...[...content.matchAll(/export\s+default\s+function\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]),
                ...[...content.matchAll(/(?:const|let|var)\s+([A-Z][A-Za-z0-9_$]*)\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)?\s*=>/g)].map((m) => m[1]),
                ...[...content.matchAll(/(?:function|class)\s+([A-Z][A-Za-z0-9_$]*)/g)].map((m) => m[1])
            ])
        )]
        const preferred = ['App', 'Page', 'Home', 'Index', 'Main']
        const rootCandidates = [...preferred, ...candidates.filter((name) => !preferred.includes(name))]
        const rootExpression = rootCandidates.length
            ? rootCandidates.map((name) => `typeof ${name} !== 'undefined' ? ${name}`).join(' : ') + ' : null'
            : 'null'

        return `<!doctype html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>${css}</style></head><body><div id="root"></div>
<script type="text/babel" data-presets="env,react,typescript">
const { useState, useEffect, useMemo, useRef, useCallback, Fragment } = React;
${source}
const __FrameCodeRoot = ${rootExpression};
if (__FrameCodeRoot) ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(__FrameCodeRoot));
else document.getElementById('root').innerHTML = '<div style="padding:24px;font-family:monospace">React preview could not find an App component.</div>';
<\/script></body></html>`
    }

    function makeVuePreview() {
        const vueFile = previewFiles().find(({ path }) => path.endsWith('.vue'))
        if (!vueFile) return ''

        const source = vueFile.content
        const templateMatch = source.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
        const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
        const styleMatches = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
        const template = templateMatch?.[1]?.trim() ?? '<div>Vue preview</div>'
        let script = scriptMatch?.[1] ?? ''
        script = script
            .replace(/import\s+\{([^}]+)\}\s+from\s+['"]vue['"];?/g, '')
            .replace(/import\s+[^;]+\s+from\s+['"]vue['"];?/g, '')
            .replace(/interface\s+\w+\s*{[\s\S]*?}/g, '')
            .replace(/type\s+\w+\s*=.*?;/g, '')

        const declarations = [...script.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1])
        const functions = [...script.matchAll(/function\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1])
        const bindings = [...new Set([...declarations, ...functions])]
        const styles = styleMatches.map((m) => m[1]).join('\n') + '\n' + collectCss()

        return `<!doctype html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
<script src="https://unpkg.com/@vue/compiler-dom@3/dist/compiler-dom.global.js"><\/script>
<style>${styles}</style></head><body><div id="app"></div>
<script>
const { createApp, ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } = Vue;
const __template = ${JSON.stringify(template)};
const __render = Vue.compile(__template);
const __setup = function(){
${script}
return { ${bindings.join(', ')} };
};
const __component = { setup: __setup, render: __render };
createApp(__component).mount('#app');
<\/script></body></html>`
    }

    function makeSveltePreview() {
        const svelteFile = previewFiles().find(({ path }) => path.endsWith('.svelte'))
        if (!svelteFile) return ''

        const source = svelteFile.content
        const template = source
            .replace(/<script[\s\S]*?<\/script>/i, '')
            .replace(/<style[\s\S]*?<\/style>/i, '')
            .trim()
            .replace(/\{#if[\s\S]*?\}([\s\S]*?)\{\/if\}/g, '$1')
            .replace(/\{#each[\s\S]*?\}([\s\S]*?)\{\/each\}/g, '$1')
            .replace(/\{:[^}]+\}/g, '')
            .replace(/\{[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\}/g, '')

        const styleMatch = source.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
        const styles = (styleMatch?.[1] ?? '') + '\n' + collectCss()
        const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
        const script = scriptMatch?.[1] ?? ''

        return `<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles}</style></head><body><div id="app">${template}</div><script>${stripModuleSyntax(script)}<\/script></body></html>`
    }

    function makeAstroPreview() {
        const astro = previewFiles().find(({ path }) => path.endsWith('.astro'))
        if (!astro) return ''
        let html = astro.content
            .replace(/^---[\s\S]*?---/m, '')
            .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '<style>$1</style>')
            .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '<script>$1<\/script>')
        const css = collectCss()
        if (css) html = `<style>${css}</style>${html}`
        return `<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${html}</body></html>`
    }

    async function updatePreview() {
        const framework = String(project?.framework ?? '').toLowerCase()
        let html = ''
        let previewLabel = 'Preview started'

        if (framework.includes('react') || framework.includes('next')) {
            html = makeReactPreview()
            previewLabel = framework.includes('next') ? '✓ Next.js client preview started' : '✓ React preview started'
        } else if (framework.includes('vue') || framework.includes('nuxt')) {
            html = makeVuePreview()
            previewLabel = framework.includes('nuxt') ? '✓ Nuxt client preview started' : '✓ Vue preview started'
        } else if (framework.includes('svelte')) {
            html = makeSveltePreview()
            previewLabel = '✓ Svelte component preview started'
        } else if (framework.includes('astro')) {
            html = makeAstroPreview()
            previewLabel = '✓ Astro static preview started'
        } else {
            html = makeVanillaPreview()
            previewLabel = '✓ HTML/CSS/JS preview started'
        }

        if (framework.includes('tailwind') && html) {
            const tailwind = '<script src="https://cdn.tailwindcss.com"><\/script>'
            html = html.includes('</head>')
                ? html.replace('</head>', `${tailwind}</head>`)
                : tailwind + html
            previewLabel = '✓ Tailwind preview started'
        }

        if (!html) {
            previewHtml = `<!doctype html><html><body style="margin:0;background:#050810;color:#5a6478;font-family:monospace;display:grid;place-items:center;height:100vh"><div style="text-align:center">No runnable entry file found.<br><small>Open a project entry file and click Run.</small></div></body></html>`
        } else {
            previewHtml = html
        }

        previewKey++
        termLines = [...termLines, { c: '#00ff88', t: `  ${previewLabel}` }]
    }

    function runPreview() {
        void updatePreview()
    }

    // ─────────────────────────────────────────────

    // AUTOSAVE

    // ─────────────────────────────────────────────

    function triggerAutoSave(path: string) {

        if (autoSaveTimer) {

            clearTimeout(autoSaveTimer)

        }

        autoSaveTimer = setTimeout(

            () => saveFile(path),

            2000

        )

    }

    async function saveFile(path: string) {

        if (!path) return

        const content = fileCache[path]

        if (content === undefined) {

            return

        }

        saveStatus = 'saving'

        try {

            const res = await fetch(

                '/api/ide/save',

                {

                    method: 'POST',

                    headers: {

                        'Content-Type':

                            'application/json'

                    },

                    body: JSON.stringify({

                        projectId:

                            project.id,

                        path,

                        content

                    })

                }

            )

            if (!res.ok) {

                throw new Error(

                    await res.text()

                )

            }

            saveStatus = 'saved'

            openTabs = openTabs.map(

                (tab) =>

                    tab.path === path

                        ? {

                                ...tab,

                                dirty: false

                            }

                        : tab

            )

            setTimeout(() => {

                if (

                    saveStatus ===

                    'saved'

                ) {

                    saveStatus = 'idle'

                }

            }, 2000)

        } catch (error) {

            console.error(

                '[IDE] Autosave failed:',

                error

            )

            saveStatus = 'error'

        }

    }

    // ─────────────────────────────────────────────

    // EDITOR

    // ─────────────────────────────────────────────

    function createEditor(

        content: string,

        path: string

    ) {

        if (editorView) {

            editorView.destroy()

            editorView = null

        }

        if (!editorEl) {

            return

        }

        const updateListener =

            EditorView.updateListener.of(

                (update) => {

                    if (

                        update.docChanged

                    ) {

                        const newContent =

                            update.state.doc.toString()

                        fileCache[path] =

                            newContent

                        openTabs =

                            openTabs.map(

                                (tab) =>

                                    tab.path ===

                                        path

                                        ? {

                                                ...tab,

                                                dirty: true

                                            }

                                        : tab

                            )

                        triggerAutoSave(

                            path

                        )

                    }

                    const head =

                        update.state

                            .selection

                            .main.head

                    const line =

                        update.state.doc.lineAt(

                            head

                        )

                    cursorLine =

                        line.number

                    cursorCol =

                        head -

                        line.from +

                        1

                }

            )

        editorView = new EditorView({

            state:

                EditorState.create({

                    doc: content,

                    extensions: [

                        lineNumbers(),

                        highlightActiveLineGutter(),

                        highlightSpecialChars(),

                        history(),

                        foldGutter(),

                        drawSelection(),

                        dropCursor(),

                        EditorState.allowMultipleSelections.of(

                            true

                        ),

                        indentOnInput(),

                        syntaxHighlighting(

                            defaultHighlightStyle,

                            {

                                fallback:

                                    true

                            }

                        ),

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

                            ...completionKeymap

                        ]),

                        getLang(path),

                        oneDark,

                        updateListener,

                        EditorView.theme({

                            '&': {

                                height: '100%',

                                fontSize:

                                    '12px',

                                fontFamily:

                                    '"Space Mono", monospace',

                                background:

                                    '#070b12'

                            },

                            '.cm-scroller': {

                                overflow:

                                    'auto',

                                background:

                                    '#070b12'

                            },

                            '.cm-content': {

                                padding:

                                    '16px 0',

                                caretColor:

                                    '#00ff88'

                            },

                            '.cm-cursor': {

                                borderLeftColor:

                                    '#00ff88'

                            },

                            '.cm-gutters': {

                                background:

                                    '#070b12',

                                borderRight:

                                    '1px solid rgba(255,255,255,0.04)',

                                color:

                                    '#3a4154'

                            },

                            '.cm-activeLineGutter': {

                                background:

                                    'rgba(255,255,255,0.03)'

                            },

                            '.cm-activeLine': {

                                background:

                                    'rgba(255,255,255,0.03)'

                            },

                            '.cm-selectionBackground, ::selection': {

                                background:

                                    'rgba(0,255,136,0.15) !important'

                            }

                        })

                    ]

                }),

            parent: editorEl

        })

    }

    // ─────────────────────────────────────────────

    // OPEN FILE

    // ─────────────────────────────────────────────

    async function openFile(path: string) {
        mobileSidebarOpen = false

        if (

            activeFilePath === path &&

            editorView

        ) {

            return

        }

        if (

            fileCache[path] !== undefined

        ) {

            activeFilePath = path

            addTab(path)

            createEditor(

                fileCache[path],

                path

            )

            return

        }

        fileLoading = true

        try {

            if (hasGitHub) {

                const res = await fetch(

                    `/api/ide/file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(path)}`

                )

                if (!res.ok) {

                    throw new Error(

                        await res.text()

                    )

                }

                const result =

                    await res.json()

                const content =

                    typeof result.content ===

                    'string'

                        ? result.content

                        : ''

                fileCache[path] =

                    content

                activeFilePath = path

                addTab(path)

                createEditor(

                    content,

                    path

                )

                termLines = [

                    ...termLines,

                    {

                        c: '#5a6478',

                        t: `  ◆ Opened ${path}`

                    }

                ]

            } else {

                const content =

                    `// ${path}\n`

                fileCache[path] =

                    content

                activeFilePath = path

                addTab(path)

                createEditor(

                    content,

                    path

                )

            }

        } catch (error) {

            console.error(

                '[IDE] Failed to load file:',

                error

            )

            termLines = [

                ...termLines,

                {

                    c: '#ff4f4f',

                    t: `  ✕ Failed to load ${path}`

                }

            ]

        } finally {

            fileLoading = false

        }

    }

    // ─────────────────────────────────────────────

    // TERMINAL

    // ─────────────────────────────────────────────

    function handleTermInput(

        event: KeyboardEvent

    ) {

        if (event.key !== 'Enter') {

            return

        }

        const cmd = termInput.trim()

        if (!cmd) {

            return

        }

        termLines = [

            ...termLines,

            {

                c: '#e8edf5',

                t: `❯ ${cmd}`

            }

        ]

        if (cmd === 'clear') {

            termLines = []

        } else if (

            cmd.startsWith('bun add')

        ) {

            termLines = [

                ...termLines,

                {

                    c: '#00d4ff',

                    t: '  ◆ Resolving packages...'

                },

                {

                    c: '#00ff88',

                    t: '  ✓ Installed'

                }

            ]

        } else {

            termLines = [

                ...termLines,

                {

                    c: '#ff4f4f',

                    t: `  command not found: ${cmd}`

                }

            ]

        }

        termInput = ''

    }

    // ─────────────────────────────────────────────

    // LIFECYCLE

    // ─────────────────────────────────────────────

    onMount(() => {

        localStorage.setItem(

            'framecode:lastProjectId',

            project.id

        )

        termLines = [

            {

                c: '#5a6478',

                t: `❯ Opening project: ${project.name}`

            },

            {

                c: '#00ff88',

                t: `  ✓ ${project.framework}`

            },

            {

                c: hasGitHub

                    ? '#00ff88'

                    : '#5a6478',

                t: hasGitHub

                    ? `  ✓ GitHub linked → ${owner}/${repo}`

                    : '  ◆ No GitHub repo linked yet'

            },

            {

                c: '#5a6478',

                t: '  ◆ Ready.'

            }

        ]

        if (fileTree.length > 0) {

            const entryFile =

                fileTree.find(

                    (file) =>

                        file.path.includes(

                            '+page.svelte'

                        ) ||

                        file.path.includes(

                            'App.jsx'

                        ) ||

                        file.path.includes(

                            'App.tsx'

                        ) ||

                        file.path.includes(

                            'App.vue'

                        ) ||

                        file.path.includes(

                            'index.astro'

                        ) ||

                        file.path.includes(

                            'src/index.ts'

                        ) ||

                        file.path.includes(

                            'index.js'

                        )

                ) ?? fileTree[0]

            openFile(entryFile.path)

        } else {

            const starter =

                '// Start coding here\n'

            fileCache['index.js'] =

                starter

            activeFilePath =

                'index.js'

            addTab('index.js')

            createEditor(

                starter,

                'index.js'

            )

        }

    })

    onDestroy(() => {

        if (autoSaveTimer) {

            clearTimeout(

                autoSaveTimer

            )

        }

        if (editorView) {

            editorView.destroy()

        }

    })

</script>

<DashboardLayout

    active="ide"

    {data}

>

    <div class="ide-root flex h-screen bg-[#070b12] text-[#e8edf5] overflow-hidden font-sans select-none">

        <!-- GRID BACKGROUND -->

        <div

            class="fixed inset-0 pointer-events-none z-0"

            style="background-image:linear-gradient(rgba(0,255,136,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.015) 1px,transparent 1px);background-size:40px 40px;"

        ></div>



        <!-- SIDEBAR -->

        {#if sidebarOpen || mobileSidebarOpen}
            {#if mobileSidebarOpen}
                <button type="button" class="ide-mobile-backdrop" aria-label="Close file explorer" onclick={() => (mobileSidebarOpen = false)}></button>
            {/if}
            <aside class="ide-sidebar relative z-10 w-[220px] shrink-0 border-r border-white/[0.05] flex flex-col bg-[#070b12] overflow-hidden" class:mobile-open={mobileSidebarOpen}>

                <!-- PROJECT HEADER -->

                <div class="px-4 py-3 border-b border-white/[0.05]">

                    <div class="flex items-center justify-between">

                        <div>

                            <p class="font-mono text-[11px] text-[#e8edf5] font-bold truncate">

                                {project.name}

                            </p>

                            <p class="font-mono text-[9px] text-[#3a4154] mt-[1px]">

                                {project.framework}

                            </p>

                        </div>

                        <div class="flex items-center gap-1 shrink-0">

                            <span

                                class="w-[5px] h-[5px] rounded-full {hasGitHub

                                    ? 'bg-[#00ff88]'

                                    : 'bg-[#3a4154]'}"

                            ></span>

                            <span class="font-mono text-[9px] text-[#3a4154]">

                                {hasGitHub ? 'github' : 'local'}

                            </span>

                        </div>

                    </div>

                </div>



                <!-- EXPLORER HEADER -->

                <div class="flex items-center justify-between px-3 py-2 border-b border-white/[0.04]">

                    <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.2em]">

                        Explorer

                    </p>

                    <span class="font-mono text-[9px] text-[#3a4154]">

                        {fileTree.length} files

                    </span>

                </div>



                <!-- FILE TREE -->

                <div class="flex-1 overflow-y-auto py-2 [scrollbar-width:none]">

                    {#if fileTree.length === 0}

                        <div class="px-4 py-3 font-mono text-[10px] text-[#3a4154]">

                            {hasGitHub ? 'Loading files...' : 'Empty project'}

                        </div>

                    {:else}

                        <!-- DIRECTORIES -->

                        {#each [...folderTree].sort() as dir}

                            {#if isDirVisible(dir)}

                                <button

                                    type="button"

                                    onclick={() => toggleDir(dir)}

                                    class="w-full text-left flex items-center gap-[6px] py-[5px] text-[#5a6478] hover:text-[#e8edf5] hover:bg-white/[0.02] transition-colors"

                                    style="padding-left: {12 + (dir.split('/').length - 1) * 14}px"

                                >

                                    <span class="font-mono text-[9px] text-[#3a4154] w-[10px]">

                                        {expandedDirs.includes(dir) ? '▾' : '▸'}

                                    </span>

                                    <span class="font-mono text-[11px]">

                                        {dir.split('/').pop()}

                                    </span>

                                </button>

                            {/if}

                        {/each}



                        <!-- FILES -->

                        {#each fileTree as file}

                            {#if isFileVisible(file.path)}

                                <button

                                    type="button"

                                    onclick={() => openFile(file.path)}

                                    class="w-full text-left flex items-center gap-[6px] py-[5px] transition-colors {activeFilePath ===

                                    file.path

                                        ? 'bg-white/[0.05] text-[#e8edf5]'

                                        : 'text-[#5a6478] hover:text-[#e8edf5] hover:bg-white/[0.02]'}"

                                    style="padding-left: {12 + (file.path.split('/').length - 1) * 14}px"

                                >

                                    <span

                                        class="w-[5px] h-[5px] rounded-full shrink-0"

                                        style="background:{langDot(file.path)}; opacity:0.6;"

                                    ></span>

                                    <span class="font-mono text-[11px] truncate">

                                        {file.path.split('/').pop()}

                                    </span>

                                </button>

                            {/if}

                        {/each}

                    {/if}

                </div>



                <!-- DASHBOARD -->

                <div class="border-t border-white/[0.05] p-3">

                    <a

                        href="/dashboard"

                        class="flex items-center gap-2 font-mono text-[10px] text-[#3a4154] hover:text-[#5a6478] transition-colors no-underline"

                    >

                        ← Dashboard

                    </a>

                </div>

            </aside>

        {/if}



        <!-- MAIN -->

        <div class="relative z-10 flex-1 flex flex-col overflow-hidden">

            <!-- TOP BAR -->

            <div class="ide-mobile-header">
                <button type="button" class="ide-mobile-icon" aria-label="Open file explorer" onclick={() => (mobileSidebarOpen = true)}>☰</button>
                <div class="ide-mobile-title">{#if activeFilePath}<span class="ide-mobile-file">{activeFilePath.split('/').pop()}</span>{:else}<span>FrameCode IDE</span>{/if}</div>
                <button type="button" class="ide-mobile-run" onclick={runPreview}>▶ Run</button>
            </div>
            <div class="ide-mobile-switcher">
                <button type="button" class:active={mobilePane === 'editor'} onclick={() => (mobilePane = 'editor')}>Editor</button>
                <button type="button" class:active={mobilePane === 'preview'} onclick={() => (mobilePane = 'preview')}>Preview</button>
            </div>
            <header class="ide-desktop-header shrink-0 border-b border-white/[0.05] flex flex-col bg-[#070b12]">

                <div class="flex items-center h-[40px] border-b border-white/[0.04]">

                    <!-- SIDEBAR TOGGLE -->

                    <div class="flex items-center gap-3 px-4 border-r border-white/[0.05] h-full shrink-0">

                        <button

                            type="button"

                            onclick={() => (sidebarOpen = !sidebarOpen)}

                            aria-label="Toggle sidebar"

                            class="font-mono text-[12px] text-[#3a4154] hover:text-[#5a6478] transition-colors"

                        >

                            ☰

                        </button>

                        <span class="font-mono text-[11px] font-bold">

                            <span class="text-[#3a4154]">[</span>

                            <span class="text-[#00ff88]">FC</span>

                            <span class="text-[#3a4154]">]</span>

                        </span>

                    </div>



                    <!-- TABS -->

                    <div class="flex items-center flex-1 overflow-x-auto [scrollbar-width:none] h-full">

                        {#each openTabs as tab}

                            <button

                                type="button"

                                onclick={() => openFile(tab.path)}

                                class="flex items-center gap-2 px-4 h-full border-r border-white/[0.04] shrink-0 transition-colors group {activeFilePath ===

                                tab.path

                                    ? 'bg-[#0d1420] text-[#e8edf5] border-t-2 border-t-[#00ff88]'

                                    : 'text-[#3a4154] hover:text-[#5a6478] border-t-2 border-t-transparent'}"

                            >

                                <span

                                    class="w-[5px] h-[5px] rounded-full shrink-0"

                                    style="background:{langDot(tab.path)}; opacity:0.7;"

                                ></span>

                                <span class="font-mono text-[11px]">

                                    {tab.name}

                                </span>

                                {#if tab.dirty}

                                    <span class="w-[4px] h-[4px] rounded-full bg-[#ffb340]"></span>

                                {/if}

                                <span

                                    role="button"

                                    tabindex="0"

                                    aria-label={`Close ${tab.name}`}

                                    onclick={(event) => closeTab(tab.path, event)}

                                    onkeydown={(event) => {

                                        if (event.key === 'Enter' || event.key === ' ') {

                                            closeTab(tab.path, event as unknown as MouseEvent)

                                        }

                                    }}

                                    class="font-mono text-[10px] text-[#3a4154] hover:text-[#ff4f4f] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"

                                >

                                    ✕

                                </span>

                            </button>

                        {/each}



                        {#if fileLoading}

                            <div class="px-4 font-mono text-[10px] text-[#3a4154] animate-pulse">

                                Loading...

                            </div>

                        {/if}

                    </div>



                    <!-- RUN -->

                    <button

                        type="button"

                        onclick={runPreview}

                        class="font-mono text-[10px] uppercase tracking-[0.08em] px-3 py-[5px] border border-white/[0.08] text-[#5a6478] hover:text-[#00ff88] hover:border-[#00ff88]/30 transition-all mr-2"

                    >

                        ▶ Run

                    </button>

                </div>



                <!-- BREADCRUMB -->

                <div class="flex items-center justify-between px-4 h-[26px]">

                    <div class="flex items-center gap-1 font-mono text-[9px] text-[#3a4154]">

                        {#if activeFilePath}

                            {#each activeFilePath.split('/') as part, i}

                                <span

                                    class={i === activeFilePath.split('/').length - 1

                                        ? 'text-[#5a6478]'

                                        : ''}

                                >

                                    {part}

                                </span>

                                {#if i < activeFilePath.split('/').length - 1}

                                    <span class="mx-[2px]">/</span>

                                {/if}

                            {/each}

                        {:else}

                            <span>No file open</span>

                        {/if}

                    </div>



                    <div class="flex items-center gap-4 font-mono text-[9px] text-[#3a4154]">

                        <span>

                            Ln {cursorLine}, Col {cursorCol}

                        </span>

                        <span>

                            {activeFilePath.split('.').pop()?.toUpperCase() || '—'}

                        </span>

                        <span>UTF-8</span>

                        <span class="text-[#00ff88]">

                            ● Prettier

                        </span>

                    </div>

                </div>

            </header>



            <!-- EDITOR + PREVIEW -->

            <div class="ide-workspace flex-1 flex overflow-hidden">

                <!-- CODEMIRROR -->

                <div

                    bind:this={editorEl}

                    class="ide-editor flex-1 overflow-hidden"
                    class:mobile-hidden={mobilePane !== 'editor'}

                ></div>



                <!-- DIVIDER -->

                <div class="ide-divider w-[1px] bg-white/[0.05] shrink-0"></div>



                <!-- PREVIEW -->

                <div class="ide-preview flex-1 bg-[#050810] flex items-center justify-center p-3 overflow-hidden" class:mobile-hidden={mobilePane !== 'preview'}>

                    <div

                        class="h-full border border-white/[0.08] overflow-hidden bg-white transition-all duration-300"

                        style="width:{previewMode === 'mobile'

                            ? '375px'

                            : previewMode === 'tablet'

                                ? '600px'

                                : '100%'};max-width:100%;"

                    >

                        {#key previewKey}

                            {#if previewHtml}

                                <iframe

                                    srcdoc={previewHtml}

                                    title="FrameCode Preview"

                                    class="w-full h-full border-0 bg-white"

                                    sandbox="allow-scripts"

                                ></iframe>

                            {:else}

                                <div class="w-full h-full flex items-center justify-center bg-[#050810]">

                                    <p class="font-mono text-[10px] text-[#3a4154] text-center">

                                        No preview available

                                        <br />

                                        <span class="text-[#252b38]">

                                            Open an HTML file and click Run

                                        </span>

                                    </p>

                                </div>

                            {/if}

                        {/key}

                    </div>

                </div>

            </div>



            <!-- TERMINAL -->

            <div

                class="shrink-0 border-t border-white/[0.05] bg-[#050810] flex flex-col"

                style="height: {termOpen ? 200 : 32}px;"

            >

                <div class="shrink-0 h-[32px] flex items-center justify-between px-4 border-b border-white/[0.04]">

                    <div class="flex items-center gap-4">

                        <button

                            type="button"

                            onclick={() => (termOpen = !termOpen)}

                            class="font-mono text-[9px] text-[#3a4154] hover:text-[#5a6478] transition-colors uppercase tracking-[0.15em] flex items-center gap-2"

                        >

                            <span>{termOpen ? '▾' : '▸'}</span>

                            Terminal

                        </button>

                    </div>



                    <div class="flex items-center gap-3">

                        <span class="font-mono text-[9px] text-[#00ff88]">

                            ● {project.name}

                        </span>

                        <button

                            type="button"

                            onclick={() => (termLines = [])}

                            class="font-mono text-[9px] text-[#3a4154] hover:text-[#5a6478] transition-colors"

                        >

                            clear

                        </button>

                    </div>

                </div>



                {#if termOpen}

                    <div class="flex-1 overflow-y-auto px-4 py-3 [scrollbar-width:thin] [scrollbar-color:#1a2030_transparent] font-mono text-[11px]">

                        {#each termLines as line}

                            <div

                                class="leading-[1.8]"

                                style="color:{line.c}"

                            >

                                {line.t}

                            </div>

                        {/each}



                        <div class="flex items-center gap-2 mt-1">

                            <span class="text-[#00ff88]">

                                ❯

                            </span>

                            <input

                                bind:value={termInput}

                                onkeydown={handleTermInput}

                                placeholder="type a command..."

                                class="flex-1 bg-transparent outline-none text-[#e8edf5] font-mono text-[11px] placeholder:text-[#3a4154] caret-[#00ff88]"

                            />

                        </div>

                    </div>

                {/if}

            </div>

        </div>

    </div>

<style>
.ide-mobile-header,.ide-mobile-switcher{display:none}.ide-mobile-backdrop{display:none}
@media(max-width:768px){
:global(body){overflow:hidden}.ide-mobile-header{display:flex;align-items:center;gap:8px;height:46px;min-height:46px;padding:0 9px;border-bottom:1px solid rgba(255,255,255,.05);background:#070b12;position:relative;z-index:40}.ide-mobile-icon{width:34px;height:32px;border:1px solid rgba(255,255,255,.08);background:#0d1420;color:#8b95a8;font:15px monospace}.ide-mobile-title{min-width:0;flex:1;overflow:hidden;color:#e8edf5;font:600 11px monospace;white-space:nowrap;text-overflow:ellipsis}.ide-mobile-run{height:30px;padding:0 10px;border:1px solid rgba(0,255,136,.25);background:rgba(0,255,136,.07);color:#00ff88;font:600 10px monospace}.ide-mobile-switcher{display:flex;height:34px;min-height:34px;border-bottom:1px solid rgba(255,255,255,.05);background:#050810}.ide-mobile-switcher button{flex:1;border:0;border-bottom:2px solid transparent;background:transparent;color:#3a4154;font:10px monospace}.ide-mobile-switcher button.active{color:#00ff88;border-bottom-color:#00ff88}.ide-desktop-header{display:none!important}.ide-sidebar{position:fixed!important;top:0;left:0;bottom:0;width:min(280px,82vw)!important;height:100dvh;z-index:100!important;transform:translateX(-105%);transition:transform .22s ease}.ide-sidebar.mobile-open{transform:translateX(0)}.ide-mobile-backdrop{display:block;position:fixed;inset:0;z-index:90;border:0;background:rgba(0,0,0,.62)}.ide-workspace{min-width:0;min-height:0}.ide-editor,.ide-preview{width:100%;min-width:0;min-height:0}.ide-editor.mobile-hidden,.ide-preview.mobile-hidden{display:none!important}.ide-divider{display:none}.ide-editor :global(.cm-scroller){overflow:auto!important;-webkit-overflow-scrolling:touch}.ide-editor :global(.cm-content){min-width:max-content}.ide-preview{padding:6px!important;align-items:stretch!important;justify-content:stretch!important}.ide-preview>div{width:100%!important;max-width:100%!important;height:100%!important}.ide-root [style*="height: 200px"]{height:145px!important}
}
@media(max-width:480px){.ide-editor :global(.cm-editor){font-size:11px!important}.ide-root [style*="height: 200px"]{height:120px!important}}
</style>
</DashboardLayout>