
<script lang="ts">
    import { onMount, onDestroy } from 'svelte'
    import FileExplorer from '$lib/components/ide/FileExplorer.svelte'
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
    let fileTree = $state<FileNode[]>(data.fileTree ?? [])

    let hasGitHub = $derived(data.hasGitHub ?? false)

    let scaffoldFiles: Record<string, string> =
        (data.scaffoldFiles as Record<string, string> | undefined) ?? {}

    let fileCache = $state<Record<string, string>>({})
    let expandedDirs = $state<string[]>([])

    let sidebarOpen = $state(true)
    let mobileSidebarOpen = $state(false)
    let mobilePane = $state<'editor' | 'preview'>('editor')

    let termOpen = $state(true)

    let previewMode = $state<'desktop' | 'tablet' | 'mobile'>('desktop')
    type LayoutMode = 'code' | 'split' | 'preview'

let layoutMode = $state<LayoutMode>('split')
let splitPercent = $state(62)
let isResizing = $state(false)
let workspaceEl = $state<HTMLElement | null>(null)

    // ─────────────────────────────────────────────
// WORKSPACE RESIZING
// ─────────────────────────────────────────────

function startResize(event: PointerEvent) {
    if (!workspaceEl) return

    isResizing = true
    workspaceEl.setPointerCapture(event.pointerId)
}

function resizeWorkspace(event: PointerEvent) {
    if (!isResizing || !workspaceEl) return

    const bounds = workspaceEl.getBoundingClientRect()

    const position =
        ((event.clientX - bounds.left) / bounds.width) * 100

    splitPercent = Math.min(90, Math.max(10, position))
}

function stopResize(event: PointerEvent) {
    isResizing = false

    if (workspaceEl?.hasPointerCapture(event.pointerId)) {
        workspaceEl.releasePointerCapture(event.pointerId)
    }
}

function handleDividerKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
        event.preventDefault()
        splitPercent = Math.max(10, splitPercent - 2)
    }

    if (event.key === 'ArrowRight') {
        event.preventDefault()
        splitPercent = Math.min(90, splitPercent + 2)
    }
}

    let previewHtml = $state('')
    let previewKey = $state(0)

    let activeFilePath = $state('')
    let cursorLine = $state(1)
    let cursorCol = $state(1)
    let fileLoading = $state(false)

    let openTabs = $state<OpenTab[]>([])

    let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle')

    let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

    let editorEl = $state<HTMLElement | null>(null)
    let editorView = $state<EditorView | null>(null)


    
let termInput = $state('')
let termLines = $state<TerminalLine[]>([])
let terminalHeight = $state(200)
let isTerminalResizing = $state(false)
let mainEl = $state<HTMLElement | null>(null)

// TERMINAL RESIZING

function startTerminalResize(event: PointerEvent) {
    if (!mainEl || !termOpen) return

    event.preventDefault()
    isTerminalResizing = true
    mainEl.setPointerCapture(event.pointerId)
}

function resizeTerminal(event: PointerEvent) {
    if (!isTerminalResizing || !mainEl) return

    const bounds = mainEl.getBoundingClientRect()
    const height = bounds.bottom - event.clientY

    terminalHeight = Math.max(
        90,
        Math.min(bounds.height * 0.65, height)
    )
}

function stopTerminalResize(event: PointerEvent) {
    isTerminalResizing = false

    if (mainEl?.hasPointerCapture(event.pointerId)) {
        mainEl.releasePointerCapture(event.pointerId)
    }
}

function handleTerminalDividerKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
        event.preventDefault()
        terminalHeight = Math.min(
            (mainEl?.clientHeight ?? 800) * 0.65,
            terminalHeight + 20
        )
    }

    if (event.key === 'ArrowDown') {
        event.preventDefault()
        terminalHeight = Math.max(90, terminalHeight - 20)
    }
}


    let owner = ''
    let repo = ''

    if (project?.repoUrl) {
        const parts = project.repoUrl
            .replace('https://github.com/', '')
            .split('/')

        owner = parts[0] ?? ''
        repo = parts[1] ?? ''
    }

    // File 
    async function workspaceRequest(
    url: string,
    method: string,
    body?: Record<string, unknown>
) {
    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    })

    if (!res.ok) {
        const message = await res.text()
        throw new Error(message || `Request failed (${res.status})`)
    }

    return res.status === 204 ? null : res.json()
}

async function refreshWorkspace() {
    const result = await workspaceRequest(
        `/api/workspace/files?projectId=${encodeURIComponent(project.id)}`,
        'GET'
    )

    const files = result?.files ?? result?.fileTree ?? []

    fileTree = files
        .filter((entry: any) => entry.type !== 'folder')
        .map((entry: any) => ({
            path: entry.path,
            sha: null,
            size: entry.size ?? 0
        }))
}

async function createFile(path: string) {
    await workspaceRequest('/api/workspace/files', 'POST', {
        projectId: project.id,
        path,
        type: 'file',
        content: ''
    })

    fileCache[path] = ''
    await refreshWorkspace()

    activeFilePath = path
    addTab(path)
    createEditor('', path)
}

async function createFolder(path: string) {
    await workspaceRequest('/api/workspace/folder', 'POST', {
        projectId: project.id,
        path
    })

    await refreshWorkspace()
}

async function renameEntry(oldPath: string, newPath: string) {
    await workspaceRequest('/api/workspace/rename', 'POST', {
        projectId: project.id,
        oldPath,
        newPath
    })

    // Move cached content if this is a file.
    if (fileCache[oldPath] !== undefined) {
        fileCache[newPath] = fileCache[oldPath]
        delete fileCache[oldPath]
    }

    // Update open tabs.
    openTabs = openTabs.map((tab) => {
        if (tab.path === oldPath || tab.path.startsWith(`${oldPath}/`)) {
            const updatedPath = tab.path.replace(oldPath, newPath)

            return {
                ...tab,
                path: updatedPath,
                name: updatedPath.split('/').pop() ?? updatedPath
            }
        }

        return tab
    })

    if (
        activeFilePath === oldPath ||
        activeFilePath.startsWith(`${oldPath}/`)
    ) {
        activeFilePath = activeFilePath.replace(oldPath, newPath)
    }

    await refreshWorkspace()
}

async function deleteEntry(path: string) {
    await workspaceRequest('/api/workspace/delete', 'DELETE', {
        projectId: project.id,
        path
    })

    // Remove deleted file/folder contents from cache.
    for (const cachedPath of Object.keys(fileCache)) {
        if (cachedPath === path || cachedPath.startsWith(`${path}/`)) {
            delete fileCache[cachedPath]
        }
    }

    openTabs = openTabs.filter(
        (tab) => tab.path !== path && !tab.path.startsWith(`${path}/`)
    )

    if (
        activeFilePath === path ||
        activeFilePath.startsWith(`${path}/`)
    ) {
        activeFilePath = ''

        if (editorView) {
            editorView.destroy()
            editorView = null
        }
    }

    await refreshWorkspace()
}
    // ─────────────────────────────────────────────
    // SCAFFOLD
    // ─────────────────────────────────────────────

    if (Object.keys(scaffoldFiles).length > 0) {
        // Saved content always wins over GitHub's version.
        for (const [path, content] of Object.entries(scaffoldFiles)) {
            fileCache[path] = content
        }

        // Keep the GitHub tree; only add saved files it doesn't have.
        const existing = new Set(fileTree.map((file) => file.path))

        const extra = Object.keys(scaffoldFiles)
            .filter((path) => !existing.has(path))
            .map((path) => ({ path, sha: null, size: 0 }))

        fileTree = [...fileTree, ...extra]

        // Expand folders that contain saved files.
        const dirs = new Set<string>()

        for (const path of Object.keys(scaffoldFiles)) {
            const parts = path.split('/')

            for (let i = 1; i < parts.length; i++) {
                dirs.add(parts.slice(0, i).join('/'))
            }
        }

        expandedDirs = [...dirs]
    }

    // ─────────────────────────────────────────────
    // DIRECTORY TREE
    // ─────────────────────────────────────────────

    let folderTree = $derived.by(() => {
        const dirs = new Set<string>()

        fileTree.forEach((file) => {
            const parts = file.path.split('/')

            for (let i = 1; i < parts.length; i++) {
                dirs.add(parts.slice(0, i).join('/'))
            }
        })

        return dirs
    })

    function toggleDir(dir: string) {
        expandedDirs = expandedDirs.includes(dir)
            ? expandedDirs.filter((d) => d !== dir)
            : [...expandedDirs, dir]
    }

    function isDirVisible(dir: string): boolean {
        if (!dir.includes('/')) return true

        const parent = dir.split('/').slice(0, -1).join('/')

        return expandedDirs.includes(parent) && isDirVisible(parent)
    }

    function isFileVisible(path: string): boolean {
        const parts = path.split('/')

        if (parts.length === 1) return true

        const parent = parts.slice(0, -1).join('/')

        return expandedDirs.includes(parent) && isDirVisible(parent)
    }

    // ─────────────────────────────────────────────
    // LANGUAGE
    // ─────────────────────────────────────────────

    function getLang(path: string) {
        if (!path) return javascript()

        if (path.endsWith('.svelte')) {
            return html({ matchClosingTags: true })
        }

        if (path.endsWith('.css') || path.endsWith('.scss')) {
            return css()
        }

        if (path.endsWith('.json')) {
            return json()
        }

        if (path.endsWith('.md')) {
            return markdown()
        }

        if (path.endsWith('.ts') || path.endsWith('.tsx')) {
            return javascript({
                typescript: true,
                jsx: true
            })
        }

        if (path.endsWith('.jsx')) {
            return javascript({ jsx: true })
        }

        return javascript()
    }

    // File-type colors are intentionally independent of the UI theme.
    function langDot(path: string) {
        if (!path) return '#3a4154'
        if (path.endsWith('.svelte')) return '#ff3e00'
        if (path.endsWith('.ts') || path.endsWith('.tsx')) return '#3178c6'
        if (path.endsWith('.js') || path.endsWith('.jsx')) return '#ffb340'
        if (path.endsWith('.css')) return '#00d4ff'
        if (path.endsWith('.json')) return '#5a6478'
        if (path.endsWith('.md')) return '#e8edf5'

        return '#3a4154'
    }

    // ─────────────────────────────────────────────
    // TABS
    // ─────────────────────────────────────────────

    function addTab(path: string) {
        if (openTabs.some((tab) => tab.path === path)) return

        openTabs = [
            ...openTabs,
            {
                name: path.split('/').pop() ?? path,
                path,
                dirty: false
            }
        ]
    }

    async function closeTab(path: string, event: MouseEvent) {
        event.stopPropagation()

        const remaining = openTabs.filter((tab) => tab.path !== path)
        openTabs = remaining

        if (activeFilePath !== path) return

        const next = remaining[remaining.length - 1]

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
    const files = previewFiles();

    // Find available HTML files.
    const htmlFiles = files.filter(({ path }) =>
        /\.html?$/i.test(path)
    );

    if (!htmlFiles.length) return '';

    // Prefer the currently active HTML file.
    const activeHtml = htmlFiles.find(
        ({ path }) => path === activeFilePath
    );

    // Otherwise prefer conventional entry files.
    const htmlFile =
        activeHtml ??
        htmlFiles.find(({ path }) => /(^|\/)index\.html$/i.test(path)) ??
        htmlFiles.find(({ path }) => /(^|\/)app\.html$/i.test(path)) ??
        htmlFiles.find(({ path }) => /(^|\/)login\.html$/i.test(path)) ??
        htmlFiles[0];

    let htmlContent = htmlFile.content ?? '';

    if (!htmlContent) return '';

    // Remove local stylesheet references because CSS is injected below.
    htmlContent = htmlContent.replace(
        /<link\b(?=[^>]*\brel\s*=\s*["']?stylesheet["']?)[^>]*>/gi,
        (tag) => {
            const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];

            if (!href || /^(https?:)?\/\//i.test(href) || href.startsWith('data:')) {
                return tag;
            }

            return '';
        }
    );

    // Remove local script references because JS is injected below.
    htmlContent = htmlContent.replace(
        /<script\b(?=[^>]*\bsrc\s*=)[^>]*>\s*<\/script>/gi,
        (tag) => {
            const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];

            if (!src || /^(https?:)?\/\//i.test(src) || src.startsWith('data:')) {
                return tag;
            }

            return '';
        }
    );

    // Inject workspace CSS.
    const cssContent = collectCss();

    if (cssContent) {
        const style = `<style>${cssContent}</style>`;

        htmlContent = htmlContent.includes('</head>')
            ? htmlContent.replace('</head>', `${style}</head>`)
            : style + htmlContent;
    }

    // Inject workspace JavaScript.
    const jsContent = files
        .filter(({ path }) =>
            /\.(js)$/i.test(path) &&
            !/\.(jsx|tsx)$/i.test(path)
        )
        .map(({ content }) => content ?? '')
        .filter(Boolean)
        .join('\n');

    if (jsContent) {
        const script = `<script>${jsContent}<\/script>`;

        htmlContent = htmlContent.includes('</body>')
            ? htmlContent.replace('</body>', `${script}</body>`)
            : htmlContent + script;
    }

    return htmlContent;
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

        const rootCandidates = [
            ...preferred,
            ...candidates.filter((name) => !preferred.includes(name))
        ]

        const rootExpression = rootCandidates.length
            ? rootCandidates.map((name) => `typeof ${name} !== 'undefined' ? ${name}`).join(' : ') + ' : null'
            : 'null'

        return `<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-presets="env,react,typescript">
const { useState, useEffect, useMemo, useRef, useCallback, Fragment } = React;
${source}
const __FrameCodeRoot = ${rootExpression};
if (__FrameCodeRoot) ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(__FrameCodeRoot));
else document.getElementById('root').innerHTML = '<div style="padding:24px;font-family:monospace">React preview could not find an App component.</div>';
<\/script>
</body>
</html>`
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
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
<script src="https://unpkg.com/@vue/compiler-dom@3/dist/compiler-dom.global.js"><\/script>
<style>${styles}</style>
</head>
<body>
<div id="app"></div>
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
<\/script>
</body>
</html>`
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

        return `<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${styles}</style>
</head>
<body>
<div id="app">${template}</div>
<script>${stripModuleSyntax(script)}<\/script>
</body>
</html>`
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

        return `<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body>${html}</body>
</html>`
    }

    async function updatePreview() {
        const framework = String(project?.framework ?? '').toLowerCase()

        let html = ''
        let previewLabel = 'Preview started'

        if (framework.includes('react') || framework.includes('next')) {
            html = makeReactPreview()
            previewLabel = framework.includes('next')
                ? '✓ Next.js client preview started'
                : '✓ React preview started'
        } else if (framework.includes('vue') || framework.includes('nuxt')) {
            html = makeVuePreview()
            previewLabel = framework.includes('nuxt')
                ? '✓ Nuxt client preview started'
                : '✓ Vue preview started'
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

        termLines = [
            ...termLines,
            { c: 'var(--fc-accent)', t: `  ${previewLabel}` }
        ]
    }

    function runPreview() {
        void updatePreview()
    }

    // ─────────────────────────────────────────────
    // AUTOSAVE
    // ─────────────────────────────────────────────

    function triggerAutoSave(path: string) {
        if (autoSaveTimer) clearTimeout(autoSaveTimer)

        autoSaveTimer = setTimeout(() => saveFile(path), 2000)
    }

    async function saveFile(path: string) {
        if (!path) return

        const content = fileCache[path]

        if (content === undefined) return

        saveStatus = 'saving'

        try {
            const res = await fetch('/api/ide/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectId: project.id,
                    path,
                    content
                })
            })

            if (!res.ok) {
                throw new Error(await res.text())
            }

            saveStatus = 'saved'

            openTabs = openTabs.map((tab) =>
                tab.path === path
                    ? { ...tab, dirty: false }
                    : tab
            )

            setTimeout(() => {
                if (saveStatus === 'saved') {
                    saveStatus = 'idle'
                }
            }, 2000)
        } catch (error) {
            console.error('[IDE] Autosave failed:', error)
            saveStatus = 'error'
        }
    }

    // ─────────────────────────────────────────────
    // EDITOR
    // ─────────────────────────────────────────────

    function createEditor(content: string, path: string) {
        if (editorView) {
            editorView.destroy()
            editorView = null
        }

        if (!editorEl) return

        const updateListener = EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                const newContent = update.state.doc.toString()

                fileCache[path] = newContent

                openTabs = openTabs.map((tab) =>
                    tab.path === path
                        ? { ...tab, dirty: true }
                        : tab
                )

                triggerAutoSave(path)
            }

            const head = update.state.selection.main.head
            const line = update.state.doc.lineAt(head)

            cursorLine = line.number
            cursorCol = head - line.from + 1
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

                    syntaxHighlighting(defaultHighlightStyle, {
                        fallback: true
                    }),

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

                    updateListener,

                    // CodeMirror now follows FrameCode's global theme.
                    // CSS variables update automatically when data-theme changes.
                    EditorView.theme({
                        '&': {
                            height: '100%',
                            fontSize: '12px',
                            fontFamily: '"Space Mono", monospace',
                            backgroundColor: 'var(--fc-panel)',
                            color: 'var(--fc-text)'
                        },

                        '.cm-scroller': {
                            overflow: 'auto',
                            backgroundColor: 'var(--fc-panel)',
                            color: 'var(--fc-text)'
                        },

                        '.cm-content': {
                            padding: '16px 0',
                            caretColor: 'var(--fc-accent)'
                        },

                        '.cm-cursor': {
                            borderLeftColor: 'var(--fc-accent)'
                        },

                        '.cm-gutters': {
                            backgroundColor: 'var(--fc-sidebar)',
                            borderRight: '1px solid var(--fc-border)',
                            color: 'var(--fc-text-muted)'
                        },

                        '.cm-activeLineGutter': {
                            backgroundColor: 'var(--fc-panel-hover)'
                        },

                        '.cm-activeLine': {
                            backgroundColor: 'var(--fc-panel-hover)'
                        },

                        '.cm-selectionBackground, ::selection': {
                            backgroundColor: 'var(--fc-accent-soft) !important'
                        },

                        '.cm-line': {
                            color: 'var(--fc-text)'
                        },

                        '.cm-tooltip': {
                            backgroundColor: 'var(--fc-panel-raised)',
                            color: 'var(--fc-text)',
                            border: '1px solid var(--fc-border)'
                        },

                        '.cm-tooltip-autocomplete ul li[aria-selected]': {
                            backgroundColor: 'var(--fc-panel-hover)',
                            color: 'var(--fc-text)'
                        },

                        '.cm-foldPlaceholder': {
                            backgroundColor: 'var(--fc-panel-raised)',
                            border: '1px solid var(--fc-border)',
                            color: 'var(--fc-text-muted)'
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

        if (activeFilePath === path && editorView) return

        if (fileCache[path] !== undefined) {
            activeFilePath = path
            addTab(path)
            createEditor(fileCache[path], path)
            return
        }

        fileLoading = true

        try {
            if (hasGitHub) {
                const res = await fetch(
                    `/api/ide/file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(path)}`
                )

                if (!res.ok) {
                    throw new Error(await res.text())
                }

                const result = await res.json()

                const content =
                    typeof result.content === 'string'
                        ? result.content
                        : ''

                fileCache[path] = content
                activeFilePath = path
                addTab(path)
                createEditor(content, path)

                termLines = [
                    ...termLines,
                    {
                        c: 'var(--fc-text-muted)',
                        t: `  ◆ Opened ${path}`
                    }
                ]
            } else {
               const res = await fetch(
    `/api/workspace/files?projectId=${encodeURIComponent(project.id)}&path=${encodeURIComponent(path)}`
);

if (!res.ok) {
    throw new Error(await res.text());
}

const result = await res.json();
const content = result.file?.content ?? "";

                fileCache[path] = content
                activeFilePath = path
                addTab(path)
                createEditor(content, path)
            }
        } catch (error) {
            console.error('[IDE] Failed to load file:', error)

            termLines = [
                ...termLines,
                {
                    c: 'var(--fc-danger)',
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

    function handleTermInput(event: KeyboardEvent) {
        if (event.key !== 'Enter') return

        const cmd = termInput.trim()

        if (!cmd) return

        termLines = [
            ...termLines,
            {
                c: 'var(--fc-text)',
                t: `❯ ${cmd}`
            }
        ]

        if (cmd === 'clear') {
            termLines = []
        } else if (cmd.startsWith('bun add')) {
            termLines = [
                ...termLines,
                {
                    c: 'var(--fc-info)',
                    t: '  ◆ Resolving packages...'
                },
                {
                    c: 'var(--fc-accent)',
                    t: '  ✓ Installed'
                }
            ]
        } else {
            termLines = [
                ...termLines,
                {
                    c: 'var(--fc-danger)',
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
        localStorage.setItem('framecode:lastProjectId', project.id)

        termLines = [
            {
                c: 'var(--fc-text-muted)',
                t: `❯ Opening project: ${project.name}`
            },
            {
                c: 'var(--fc-accent)',
                t: `  ✓ ${project.framework}`
            },
            {
                c: hasGitHub ? 'var(--fc-accent)' : 'var(--fc-text-muted)',
                t: hasGitHub
                    ? `  ✓ GitHub linked → ${owner}/${repo}`
                    : '  ◆ No GitHub repo linked yet'
            },
            {
                c: 'var(--fc-text-muted)',
                t: '  ◆ Ready.'
            }
        ]

        if (fileTree.length > 0) {
            const entryFile =
                fileTree.find((file) =>
                    file.path.includes('+page.svelte') ||
                    file.path.includes('App.jsx') ||
                    file.path.includes('App.tsx') ||
                    file.path.includes('App.vue') ||
                    file.path.includes('index.astro') ||
                    file.path.includes('src/index.ts') ||
                    file.path.includes('index.js')
                ) ?? fileTree[0]

            openFile(entryFile.path)
        } else {
            const starter = '// Start coding here\n'

            fileCache['index.js'] = starter
            activeFilePath = 'index.js'
            addTab('index.js')
            createEditor(starter, 'index.js')
        }
    })

    onDestroy(() => {
        if (autoSaveTimer) clearTimeout(autoSaveTimer)

        if (editorView) {
            editorView.destroy()
        }
    })
</script>

   <div class="ide-root fc-app flex h-screen overflow-hidden font-sans select-none">
  <!-- GRID BACKGROUND -->
  <div
    class="fixed inset-0 pointer-events-none z-0"
    style="
      background-image:
        linear-gradient(var(--fc-accent-soft) 1px, transparent 1px),
        linear-gradient(90deg, var(--fc-accent-soft) 1px, transparent 1px);
      background-size: 40px 40px;
    "
  ></div>
   
        <!-- SIDEBAR -->
        {#if sidebarOpen || mobileSidebarOpen}
            {#if mobileSidebarOpen}
                <button
                    type="button"
                    class="ide-mobile-backdrop"
                    aria-label="Close file explorer"
                    onclick={() => (mobileSidebarOpen = false)}
                ></button>
            {/if}

            <aside
                class="
                    ide-sidebar relative z-10 w-[220px] shrink-0
                    border-r border-[var(--fc-border)]
                    flex flex-col bg-[var(--fc-sidebar)] overflow-hidden
                "
                class:mobile-open={mobileSidebarOpen}
            >
                <!-- PROJECT HEADER -->
                <div class="px-4 py-3 border-b border-[var(--fc-border)]">
                    <div class="flex items-center justify-between">
                        <div class="min-w-0">
                            <p class="font-mono text-[11px] text-[var(--fc-text)] font-bold truncate">
                                {project.name}
                            </p>

                            <p class="font-mono text-[9px] text-[var(--fc-text-muted)] mt-[1px]">
                                {project.framework}
                            </p>
                        </div>

                        <div class="flex items-center gap-1 shrink-0">
                            <span
                                class="w-[5px] h-[5px] rounded-full {hasGitHub
                                    ? 'bg-[var(--fc-success)]'
                                    : 'bg-[var(--fc-text-muted)]'}"
                            ></span>

                            <span class="font-mono text-[9px] text-[var(--fc-text-muted)]">
                                {hasGitHub ? 'github' : 'local'}
                            </span>
                        </div>
                    </div>
                </div>

            

                <!-- EXPLORER HEADER -->
                <div class="flex items-center justify-between px-3 py-2 border-b border-[var(--fc-border)]">
                    <p class="font-mono text-[9px] text-[var(--fc-text-muted)] uppercase tracking-[0.2em]">
                        Explorer
                    </p>

                    <span class="font-mono text-[9px] text-[var(--fc-text-muted)]">
                        {fileTree.length} files
                    </span>
                </div>
<FileExplorer
    files={fileTree.map((file) => ({
        path: file.path,
        type: 'file' as const
    }))}
    activeFilePath={activeFilePath}
    onOpen={openFile}
    onCreateFile={createFile}
    onCreateFolder={createFolder}
    onRename={renameEntry}
    onDelete={deleteEntry}
    onRefresh={refreshWorkspace}
/>

                <!-- DASHBOARD -->
                <div class="border-t border-[var(--fc-border)] p-3">
                    <a
                        href="/dashboard"
                        class="
                            flex items-center gap-2 font-mono text-[10px]
                            text-[var(--fc-text-muted)]
                            hover:text-[var(--fc-accent)]
                            transition-colors no-underline
                        "
                    >
                        ← Dashboard
                    </a>
                </div>
            </aside>
        {/if}

        <!-- MAIN -->
<div
    bind:this={mainEl}
    class="relative z-10 flex-1 min-w-0 flex flex-col overflow-hidden"
    class:terminal-resizing={isTerminalResizing}
    onpointermove={resizeTerminal}
    onpointerup={stopTerminalResize}
    onpointercancel={stopTerminalResize}
>
            <!-- MOBILE HEADER -->
            <div class="ide-mobile-header">
                <button
                    type="button"
                    class="ide-mobile-icon"
                    aria-label="Open file explorer"
                    onclick={() => (mobileSidebarOpen = true)}
                >
                    ☰
                </button>

                <div class="ide-mobile-title">
                    {#if activeFilePath}
                        <span class="ide-mobile-file">{activeFilePath.split('/').pop()}</span>
                    {:else}
                        <span>FrameCode IDE</span>
                    {/if}
                </div>

                <button type="button" class="ide-mobile-run" onclick={runPreview}>
                    ▶ Run
                </button>
            </div>

            <!-- MOBILE SWITCHER -->
            <div class="ide-mobile-switcher">
                <button
                    type="button"
                    class:active={mobilePane === 'editor'}
                    onclick={() => (mobilePane = 'editor')}
                >
                    Editor
                </button>

                <button
                    type="button"
                    class:active={mobilePane === 'preview'}
                    onclick={() => (mobilePane = 'preview')}
                >
                    Preview
                </button>
            </div>

            <!-- DESKTOP HEADER -->
            <header class="ide-desktop-header shrink-0 border-b border-[var(--fc-border)] flex flex-col bg-[var(--fc-bg)]">
                <div class="flex items-center h-[40px] border-b border-[var(--fc-border)]">

                    <!-- SIDEBAR TOGGLE -->
                    <div class="flex items-center gap-3 px-4 border-r border-[var(--fc-border)] h-full shrink-0">
                        <button
                            type="button"
                            onclick={() => (sidebarOpen = !sidebarOpen)}
                            aria-label="Toggle sidebar"
                            class="
                                font-mono text-[12px] text-[var(--fc-text-muted)]
                                hover:text-[var(--fc-accent)] transition-colors
                            "
                        >
                            ☰
                        </button>

                        <span class="font-mono text-[11px] font-bold">
                            <span class="text-[var(--fc-text-muted)]">[</span>
                            <span class="text-[var(--fc-accent)]">FC</span>
                            <span class="text-[var(--fc-text-muted)]">]</span>
                        </span>
                    </div>

                    <!-- TABS -->
                    <div class="flex items-center flex-1 overflow-x-auto [scrollbar-width:none] h-full">
                        {#each openTabs as tab}
                            <button
                                type="button"
                                onclick={() => openFile(tab.path)}
                                class="
                                    flex items-center gap-2 px-4 h-full
                                    border-r border-[var(--fc-border)] shrink-0
                                    transition-colors group
                                    {activeFilePath === tab.path
                                        ? 'bg-[var(--fc-panel-raised)] text-[var(--fc-text)] border-t-2 border-t-[var(--fc-accent)]'
                                        : 'text-[var(--fc-text-muted)] hover:text-[var(--fc-text-secondary)] border-t-2 border-t-transparent'}
                                "
                            >
                                <span
                                    class="w-[5px] h-[5px] rounded-full shrink-0"
                                    style="background:{langDot(tab.path)}; opacity:0.7;"
                                ></span>

                                <span class="font-mono text-[11px]">
                                    {tab.name}
                                </span>

                                {#if tab.dirty}
                                    <span class="w-[4px] h-[4px] rounded-full bg-[var(--fc-warning)]"></span>
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
                                    class="
                                        font-mono text-[10px] text-[var(--fc-text-muted)]
                                        hover:text-[var(--fc-danger)]
                                        opacity-0 group-hover:opacity-100
                                        transition-opacity cursor-pointer
                                    "
                                >
                                    ✕
                                </span>
                            </button>
                        {/each}

                        {#if fileLoading}
                            <div class="px-4 font-mono text-[10px] text-[var(--fc-text-muted)] animate-pulse">
                                Loading...
                            </div>
                        {/if}
                    </div>

                    <!-- RUN -->
                  <!-- WORKSPACE LAYOUT CONTROLS -->
<div class="flex items-center gap-1 mr-3">
    <button
        type="button"
        class:layout-active={layoutMode === 'code'}
        class="layout-btn"
        onclick={() => layoutMode = 'code'}
        title="Focus code"
    >
        <span>⌨</span>
        Code
    </button>

    <button
        type="button"
        class:layout-active={layoutMode === 'split'}
        class="layout-btn"
        onclick={() => layoutMode = 'split'}
        title="Split code and preview"
    >
        <span>◫</span>
        Split
    </button>

    <button
        type="button"
        class:layout-active={layoutMode === 'preview'}
        class="layout-btn"
        onclick={() => layoutMode = 'preview'}
        title="Focus preview"
    >
        <span>▣</span>
        Preview
    </button>
</div>

<!-- RUN -->
<button
    type="button"
    onclick={runPreview}
    class="
        font-mono text-[10px] uppercase tracking-[0.08em]
        px-3 py-[5px]
        border border-[var(--fc-border-strong)]
        text-[var(--fc-text-secondary)]
        hover:text-[var(--fc-accent)]
        hover:border-[var(--fc-accent)]
        transition-all mr-2
    "
>
    ▶ Run
</button>
</div> <!-- ADD THIS: closes the 40px header row -->

<!-- BREADCRUMB -->
<div class="flex items-center justify-between px-4 h-[26px]">
                    <div class="flex items-center gap-1 font-mono text-[9px] text-[var(--fc-text-muted)]">
                        {#if activeFilePath}
                            {#each activeFilePath.split('/') as part, i}
                                <span
                                    class={i === activeFilePath.split('/').length - 1
                                        ? 'text-[var(--fc-text-secondary)]'
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

                    <div class="flex items-center gap-4 font-mono text-[9px] text-[var(--fc-text-muted)]">
                        <span>Ln {cursorLine}, Col {cursorCol}</span>
                        <span>{activeFilePath.split('.').pop()?.toUpperCase() || '—'}</span>
                        <span>UTF-8</span>
                        <span class="text-[var(--fc-accent)]">● Prettier</span>
                    </div>
                </div>
            </header>

            <!-- EDITOR + PREVIEW -->
            <!-- EDITOR + PREVIEW -->
<div
    class="ide-workspace flex-1 min-h-0 flex overflow-hidden"
    class:workspace-resizing={isResizing}
    bind:this={workspaceEl}
    onpointermove={resizeWorkspace}
    onpointerup={stopResize}
    onpointercancel={stopResize}
>
    <!-- CODEMIRROR -->
    <div
        bind:this={editorEl}
        class="ide-editor min-w-0 overflow-hidden"
        class:mobile-hidden={mobilePane !== 'editor'}
        style:flex={layoutMode === 'code'
            ? '1 1 0%'
            : layoutMode === 'preview'
                ? '0 0 0px'
                : `0 0 calc(${splitPercent}% - 3px)`}
    ></div>

    <!-- RESIZABLE DIVIDER -->
    {#if layoutMode === 'split'}
        <div
            class="ide-divider"
            class:dragging={isResizing}
            role="separator"
            aria-label="Resize code and preview panels"
            aria-orientation="vertical"
            aria-valuenow={Math.round(splitPercent)}
            aria-valuemin="10"
            aria-valuemax="90"
            tabindex="0"
            onpointerdown={startResize}
            onkeydown={handleDividerKeydown}
            ondblclick={() => splitPercent = 62}
        >
            <span></span>
        </div>
    {/if}

   <!-- PREVIEW -->
<div
    class="
        ide-preview min-w-0
        bg-[var(--fc-panel)] flex items-center justify-center
        p-3 overflow-hidden
    "
    class:mobile-hidden={mobilePane !== 'preview'}
    style:flex={layoutMode === 'preview'
        ? '1 1 0%'
        : layoutMode === 'code'
            ? '0 0 0px'
            : '1 1 0%'}
>
    {#if previewHtml}
        {#key previewKey}
            <iframe
                title="Preview"
                srcdoc={previewHtml}
                class="w-full h-full bg-white border-0"
                sandbox="allow-scripts allow-forms allow-modals allow-popups"
            ></iframe>
        {/key}
    {:else}
        <p class="font-mono text-[11px] text-[var(--fc-text-muted)]">
            Click ▶ Run to see your preview
        </p>
    {/if}
</div>
</div>
     

            <!-- TERMINAL -->
          
<!-- TERMINAL RESIZE DIVIDER -->
{#if termOpen}
    <div
        class="terminal-divider"
        class:dragging={isTerminalResizing}
        role="separator"
        aria-label="Resize terminal panel"
        aria-orientation="horizontal"
        aria-valuenow={terminalHeight}
        aria-valuemin="90"
        tabindex="0"
        onpointerdown={startTerminalResize}
        onkeydown={handleTerminalDividerKeydown}
        ondblclick={() => terminalHeight = 200}
    >
        <span></span>
    </div>
{/if}


<!-- TERMINAL -->
<div
    class="shrink-0 border-t border-[var(--fc-border)] bg-[var(--fc-panel)] flex flex-col"
    style="height: {termOpen ? terminalHeight : 32}px;"
>

                <div class="shrink-0 h-[32px] flex items-center justify-between px-4 border-b border-[var(--fc-border)]">
                    <div class="flex items-center gap-4">
                        <button
                            type="button"
                            onclick={() => (termOpen = !termOpen)}
                            class="
                                font-mono text-[9px] text-[var(--fc-text-muted)]
                                hover:text-[var(--fc-accent)] transition-colors
                                uppercase tracking-[0.15em] flex items-center gap-2
                            "
                        >
                            <span>{termOpen ? '▾' : '▸'}</span>
                            Terminal
                        </button>
                    </div>

                    <div class="flex items-center gap-3">
                        <span class="font-mono text-[9px] text-[var(--fc-accent)]">
                            ● {project.name}
                        </span>

                        <button
                            type="button"
                            onclick={() => (termLines = [])}
                            class="
                                font-mono text-[9px] text-[var(--fc-text-muted)]
                                hover:text-[var(--fc-text)] transition-colors
                            "
                        >
                            clear
                        </button>
                    </div>
                </div>

                {#if termOpen}
                    <div
                        class="
                            flex-1 overflow-y-auto px-4 py-3
                            [scrollbar-width:thin]
                            font-mono text-[11px]
                        "
                    >
                        {#each termLines as line}
                            <div class="leading-[1.8]" style="color:{line.c}">
                                {line.t}
                            </div>
                        {/each}

                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-[var(--fc-accent)]">❯</span>

                            <input
                                bind:value={termInput}
                                onkeydown={handleTermInput}
                                placeholder="type a command..."
                                class="
                                    flex-1 bg-transparent outline-none
                                    text-[var(--fc-text)] font-mono text-[11px]
                                    placeholder:text-[var(--fc-text-subtle)]
                                    caret-[var(--fc-accent)]
                                "
                            />
                        </div>
                    </div>
                {/if}
            </div>
        </div>
        </div>

    <style>


/* TERMINAL RESIZE DIVIDER */

.terminal-divider {
    position: relative;
    z-index: 20;
    flex: 0 0 5px;
    height: 5px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--fc-border);
    cursor: ns-resize;
    touch-action: none;
    transition: background 150ms ease;
}

.terminal-divider::before {
    content: '';
    position: absolute;
    inset: -4px 0;
}

.terminal-divider span {
    width: 42px;
    height: 2px;
    border-radius: 4px;
    background: var(--fc-text-muted);
    transition: all 150ms ease;
}

.terminal-divider:hover,
.terminal-divider.dragging {
    background: var(--fc-accent-soft);
}

.terminal-divider:hover span,
.terminal-divider.dragging span {
    width: 64px;
    height: 3px;
    background: var(--fc-accent);
}

.terminal-resizing {
    cursor: ns-resize;
    user-select: none;
}

.terminal-resizing iframe {
    pointer-events: none;
}

    /* ─────────────────────────────────
   WORKSPACE RESIZING
───────────────────────────────── */

.ide-editor,
.ide-preview {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
}

.ide-divider {
    position: relative;
    z-index: 10;
    flex: 0 0 6px;
    width: 6px;
    height: 100%;
    background: var(--fc-border);
    cursor: col-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;
    transition: background 150ms ease;
}

.ide-divider::before {
    content: '';
    position: absolute;
    inset: 0 -4px;
}

.ide-divider span {
    width: 2px;
    height: 34px;
    border-radius: 3px;
    background: var(--fc-text-muted);
    transition: all 150ms ease;
}

.ide-divider:hover,
.ide-divider.dragging {
    background: var(--fc-accent-soft);
}

.ide-divider:hover span,
.ide-divider.dragging span {
    height: 52px;
    background: var(--fc-accent);
}

.workspace-resizing {
    cursor: col-resize;
    user-select: none;
}

.workspace-resizing iframe {
    pointer-events: none;
}

/* Layout controls */

.layout-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 8px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--fc-text-muted);
    font: 10px monospace;
    transition: all 150ms ease;
    white-space: nowrap;
}

.layout-btn:hover {
    color: var(--fc-text);
    background: var(--fc-panel-hover);
}

.layout-btn.layout-active {
    color: var(--fc-accent);
    background: var(--fc-accent-soft);
    border-color: var(--fc-border-strong);
}

@media (max-width: 768px) {
    .ide-divider {
        display: none;
    }

    .layout-btn {
        display: none;
    }
}
        .ide-mobile-header,
        .ide-mobile-switcher {
            display: none;
        }

        .ide-mobile-backdrop {
            display: none;
        }

        @media (max-width: 768px) {
            :global(body) {
                overflow: hidden;
            }

            .ide-mobile-header {
                display: flex;
                align-items: center;
                gap: 8px;
                height: 46px;
                min-height: 46px;
                padding: 0 9px;
                border-bottom: 1px solid var(--fc-border);
                background: var(--fc-bg);
                position: relative;
                z-index: 40;
            }

            .ide-mobile-icon {
                width: 34px;
                height: 32px;
                border: 1px solid var(--fc-border);
                background: var(--fc-panel);
                color: var(--fc-text-secondary);
                font: 15px monospace;
            }

            .ide-mobile-title {
                min-width: 0;
                flex: 1;
                overflow: hidden;
                color: var(--fc-text);
                font: 600 11px monospace;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .ide-mobile-run {
                height: 30px;
                padding: 0 10px;
                border: 1px solid var(--fc-border-strong);
                background: var(--fc-accent-soft);
                color: var(--fc-accent);
                font: 600 10px monospace;
            }

            .ide-mobile-switcher {
                display: flex;
                height: 34px;
                min-height: 34px;
                border-bottom: 1px solid var(--fc-border);
                background: var(--fc-sidebar);
            }

            .ide-mobile-switcher button {
                flex: 1;
                border: 0;
                border-bottom: 2px solid transparent;
                background: transparent;
                color: var(--fc-text-muted);
                font: 10px monospace;
            }

            .ide-mobile-switcher button.active {
                color: var(--fc-accent);
                border-bottom-color: var(--fc-accent);
            }

            .ide-desktop-header {
                display: none !important;
            }

            .ide-sidebar {
                position: fixed !important;
                top: 0;
                left: 0;
                bottom: 0;
                width: min(280px, 82vw) !important;
                height: 100dvh;
                z-index: 100 !important;
                transform: translateX(-105%);
                transition: transform .22s ease;
            }

            .ide-sidebar.mobile-open {
                transform: translateX(0);
            }

            .ide-mobile-backdrop {
                display: block;
                position: fixed;
                inset: 0;
                z-index: 90;
                border: 0;
                background: var(--fc-overlay);
            }

            .ide-workspace {
                min-width: 0;
                min-height: 0;
            }

            .ide-editor,
            .ide-preview {
                width: 100%;
                min-width: 0;
                min-height: 0;
            }

            .ide-editor.mobile-hidden,
            .ide-preview.mobile-hidden {
                display: none !important;
            }

            .ide-divider {
                display: none;
            }

            .ide-editor :global(.cm-scroller) {
                overflow: auto !important;
                -webkit-overflow-scrolling: touch;
            }

            .ide-editor :global(.cm-content) {
                min-width: max-content;
            }

            .ide-preview {
                padding: 6px !important;
                align-items: stretch !important;
                justify-content: stretch !important;
            }

            .ide-preview > div {
                width: 100% !important;
                max-width: 100% !important;
                height: 100% !important;
            }

          
        }

        @media (max-width: 480px) {
            .ide-editor :global(.cm-editor) {
                font-size: 11px !important;
            }

           
        }
    </style>
