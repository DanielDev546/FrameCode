<script lang="ts">
    type Entry = {
        path: string
        type: 'file' | 'folder'
    }

    type TreeNode = {
        name: string
        path: string
        type: 'file' | 'folder'
        children: TreeNode[]
    }

    let {
        files = [],
        activeFilePath = '',
        onOpen,
        onCreateFile,
        onCreateFolder,
        onRename,
        onDelete,
        onRefresh
    } = $props<{
        files: Entry[]
        activeFilePath: string
        onOpen: (path: string) => void
        onCreateFile: (path: string) => Promise<void>
        onCreateFolder: (path: string) => Promise<void>
        onRename: (oldPath: string, newPath: string) => Promise<void>
        onDelete: (path: string) => Promise<void>
        onRefresh: () => Promise<void>
    }>()

    let expanded = $state<string[]>([])
    let dialog = $state<'file' | 'folder' | 'rename' | null>(null)
    let selectedPath = $state('')
    let inputPath = $state('')
    let busy = $state(false)
    let errorMessage = $state('')

    let tree = $derived.by(() => {
        const root: TreeNode[] = []

        function getOrCreate(
            collection: TreeNode[],
            name: string,
            path: string,
            type: 'file' | 'folder'
        ) {
            let node = collection.find((item) => item.name === name)

            if (!node) {
                node = {
                    name,
                    path,
                    type,
                    children: []
                }

                collection.push(node)
            } else if (type === 'folder') {
                node.type = 'folder'
            }

            return node
        }

        for (const entry of files) {
            const parts = entry.path.split('/').filter(Boolean)
            let current = root
            let parentPath = ''

            parts.forEach((part, index) => {
                parentPath = parentPath
                    ? `${parentPath}/${part}`
                    : part

                const isLast = index === parts.length - 1

                const node = getOrCreate(
                    current,
                    part,
                    parentPath,
                    isLast ? entry.type : 'folder'
                )

                current = node.children
            })
        }

        function sortNodes(nodes: TreeNode[]) {
            nodes.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'folder' ? -1 : 1
                }

                return a.name.localeCompare(b.name)
            })

            for (const node of nodes) {
                sortNodes(node.children)
            }
        }

        sortNodes(root)

        return root
    })

    function toggleFolder(path: string) {
        expanded = expanded.includes(path)
            ? expanded.filter((item) => item !== path)
            : [...expanded, path]
    }

    function expandParents(path: string) {
        const parts = path.split('/')

        const parents: string[] = []

        for (let i = 1; i < parts.length; i++) {
            parents.push(parts.slice(0, i).join('/'))
        }

        expanded = [...new Set([...expanded, ...parents])]
    }

    function openDialog(
        type: 'file' | 'folder' | 'rename',
        path = ''
    ) {
        dialog = type
        selectedPath = path
        errorMessage = ''

        if (type === 'rename') {
            inputPath = path
        } else {
            inputPath = path ? `${path}/` : ''
        }
    }

    function closeDialog() {
        if (busy) return

        dialog = null
        inputPath = ''
        errorMessage = ''
    }

    async function submitDialog() {
        const path = inputPath.trim().replace(/^\/+|\/+$/g, '')

        if (!path) {
            errorMessage = 'Enter a valid path.'
            return
        }

        busy = true
        errorMessage = ''

        try {
            if (dialog === 'file') {
                await onCreateFile(path)
                expandParents(path)
            }

            if (dialog === 'folder') {
                await onCreateFolder(path)
                expandParents(path)
                expanded = [...expanded, path]
            }

            if (dialog === 'rename') {
                await onRename(selectedPath, path)
                expandParents(path)
            }

            dialog = null
            inputPath = ''
        } catch (error) {
            errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Operation failed.'
        } finally {
            busy = false
        }
    }

    async function deleteEntry(
        path: string,
        type: 'file' | 'folder'
    ) {
        const message = type === 'folder'
            ? `Delete "${path}" and everything inside it?`
            : `Delete "${path}"?`

        if (!confirm(message)) return

        busy = true

        try {
            await onDelete(path)

            expanded = expanded.filter(
                (item) => item !== path && !item.startsWith(`${path}/`)
            )
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : 'Delete failed.'
            )
        } finally {
            busy = false
        }
    }

    function fileIcon(filename: string) {
        if (filename.endsWith('.svelte')) return '◆'
        if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'TS'
        if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'JS'
        if (filename.endsWith('.json')) return '{}'
        if (filename.endsWith('.css')) return '#'
        if (filename.endsWith('.html')) return '◇'
        if (filename.endsWith('.md')) return 'M'
        if (filename.endsWith('.java')) return 'J'
        if (filename.endsWith('.py')) return 'PY'
        if (filename.endsWith('.sql')) return 'DB'
        if (filename.endsWith('.xml')) return 'XML'

        return '·'
    }

    function fileColor(filename: string) {
        if (filename.endsWith('.svelte')) return '#ff7849'
        if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return '#5da9e9'
        if (filename.endsWith('.js') || filename.endsWith('.jsx')) return '#e8c85a'
        if (filename.endsWith('.json')) return '#a9b5c7'
        if (filename.endsWith('.css')) return '#62b8ff'
        if (filename.endsWith('.html')) return '#ff9068'
        if (filename.endsWith('.md')) return '#c5cbd5'
        if (filename.endsWith('.java')) return '#e79b68'
        if (filename.endsWith('.py')) return '#78b7dc'
        if (filename.endsWith('.sql')) return '#b59aff'
        if (filename.endsWith('.xml')) return '#e88c71'

        return 'var(--fc-text-muted)'
    }
</script>

<div class="explorer">

    <!-- HEADER -->
    <div class="explorer-header">
        <span class="explorer-heading">EXPLORER</span>

        <div class="explorer-toolbar">
            <button
                type="button"
                title="New file"
                onclick={() => openDialog('file')}
            >
                <span class="toolbar-plus">＋</span>
            </button>

            <button
                type="button"
                title="New folder"
                onclick={() => openDialog('folder')}
            >
                <span class="toolbar-folder">▱</span>
            </button>

            <button
                type="button"
                title="Refresh explorer"
                onclick={onRefresh}
            >
                ↻
            </button>
        </div>
    </div>

    <!-- ROOT -->
    <button
        type="button"
        class="project-root"
        onclick={() => {
            expanded = expanded.length === 0
                ? tree.filter((node) => node.type === 'folder').map((node) => node.path)
                : []
        }}
    >
        <span class="root-chevron">
            {expanded.length > 0 ? '▾' : '▸'}
        </span>

        <span class="root-icon">▰</span>

        <span class="root-name">PROJECT</span>

        <span class="root-count">{files.filter((f) => f.type === 'file').length}</span>
    </button>

    <!-- TREE -->
    <div class="explorer-tree">

        {#snippet renderNode(node: TreeNode, depth: number)}
            <div class="tree-node">

                {#if node.type === 'folder'}
                    <div
                        class="tree-row folder-row"
                        style={`--depth:${depth}`}
                    >
                        <button
                            type="button"
                            class="tree-main"
                            onclick={() => toggleFolder(node.path)}
                        >
                            <span class="tree-chevron">
                                {expanded.includes(node.path) ? '▾' : '▸'}
                            </span>

                            <span class="folder-icon">
                                {expanded.includes(node.path) ? '📂' : '📁'}
                            </span>

                            <span class="tree-name">{node.name}</span>
                        </button>

                        <div class="tree-actions">
                            <button
                                title="New file inside folder"
                                onclick={() => openDialog('file', node.path)}
                            >＋</button>

                            <button
                                title="New folder inside folder"
                                onclick={() => openDialog('folder', node.path)}
                            >▱</button>

                            <button
                                title="Rename folder"
                                onclick={() => openDialog('rename', node.path)}
                            >✎</button>

                            <button
                                title="Delete folder"
                                onclick={() => deleteEntry(node.path, 'folder')}
                            >×</button>
                        </div>
                    </div>

                    {#if expanded.includes(node.path)}
                        <div class="tree-children">
                            {#each node.children as child (child.path)}
                                {@render renderNode(child, depth + 1)}
                            {/each}
                        </div>
                    {/if}

                {:else}
                    <div
                        class="tree-row file-row"
                        class:active={activeFilePath === node.path}
                        style={`--depth:${depth}`}
                    >
                        <button
                            type="button"
                            class="tree-main"
                            onclick={() => onOpen(node.path)}
                        >
                            <span class="tree-spacer"></span>

                            <span
                                class="file-icon"
                                style={`color:${fileColor(node.name)}`}
                            >
                                {fileIcon(node.name)}
                            </span>

                            <span class="tree-name">{node.name}</span>
                        </button>

                        <div class="tree-actions">
                            <button
                                title="Rename file"
                                onclick={() => openDialog('rename', node.path)}
                            >✎</button>

                            <button
                                title="Delete file"
                                onclick={() => deleteEntry(node.path, 'file')}
                            >×</button>
                        </div>
                    </div>
                {/if}
            </div>
        {/snippet}

        {#each tree as node (node.path)}
            {@render renderNode(node, 0)}
        {/each}

        {#if tree.length === 0}
            <div class="explorer-empty">
                <span>▱</span>
                <p>No files yet</p>
                <button onclick={() => openDialog('file')}>
                    Create your first file
                </button>
            </div>
        {/if}
    </div>

    <!-- DIALOG -->
    {#if dialog}
        <div class="dialog-overlay">
            <div class="dialog">

                <div class="dialog-header">
                    <span>
                        {dialog === 'file'
                            ? 'NEW FILE'
                            : dialog === 'folder'
                                ? 'NEW FOLDER'
                                : 'RENAME'}
                    </span>

                    <button onclick={closeDialog} disabled={busy}>×</button>
                </div>

                <label>PATH</label>

                <input
                    bind:value={inputPath}
                    autofocus
                    placeholder="src/components/example.svelte"
                    onkeydown={(event) => {
                        if (event.key === 'Enter') submitDialog()
                        if (event.key === 'Escape') closeDialog()
                    }}
                />

                {#if errorMessage}
                    <p class="dialog-error">{errorMessage}</p>
                {/if}

                <div class="dialog-footer">
                    <button class="cancel-button" onclick={closeDialog}>
                        Cancel
                    </button>

                    <button
                        class="confirm-button"
                        onclick={submitDialog}
                        disabled={busy}
                    >
                        {busy ? 'Working...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .explorer {
        height: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        background: var(--fc-panel);
        color: var(--fc-text);
        overflow: hidden;
    }

    .explorer-header {
        height: 38px;
        min-height: 38px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px 0 12px;
        border-bottom: 1px solid var(--fc-border);
    }

    .explorer-heading {
        font-family: monospace;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.16em;
        color: var(--fc-text-muted);
    }

    .explorer-toolbar {
        display: flex;
        align-items: center;
        gap: 3px;
    }

    .explorer-toolbar button {
        width: 27px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid transparent;
        border-radius: 4px;
        color: var(--fc-text-secondary);
        font-size: 15px;
        transition: 120ms;
    }

    .explorer-toolbar button:hover {
        color: var(--fc-accent);
        background: var(--fc-panel-hover);
        border-color: var(--fc-border);
    }

    .toolbar-plus {
        font-size: 20px;
        line-height: 1;
    }

    .toolbar-folder {
        font-size: 17px;
    }

    .project-root {
        height: 32px;
        min-height: 32px;
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 0 12px;
        width: 100%;
        color: var(--fc-text-secondary);
        text-align: left;
        background: var(--fc-panel-raised);
        border-bottom: 1px solid var(--fc-border);
    }

    .project-root:hover {
        background: var(--fc-panel-hover);
    }

    .root-chevron {
        font-size: 10px;
        color: var(--fc-text-muted);
    }

    .root-icon {
        color: var(--fc-accent);
        font-size: 12px;
    }

    .root-name {
        font-family: monospace;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.08em;
    }

    .root-count {
        margin-left: auto;
        font-family: monospace;
        font-size: 9px;
        color: var(--fc-text-muted);
    }

    .explorer-tree {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 5px 0 12px;
    }

    .tree-row {
        height: 28px;
        display: flex;
        align-items: center;
        padding-right: 5px;
        padding-left: calc(8px + var(--depth) * 14px);
        transition: background 100ms;
    }

    .tree-row:hover {
        background: var(--fc-panel-hover);
    }

    .file-row.active {
        background: var(--fc-accent-soft);
        border-left: 2px solid var(--fc-accent);
        padding-left: calc(6px + var(--depth) * 14px);
        color: var(--fc-text);
    }

    .tree-main {
        flex: 1;
        min-width: 0;
        height: 100%;
        display: flex;
        align-items: center;
        gap: 6px;
        text-align: left;
        overflow: hidden;
    }

    .tree-chevron {
        width: 10px;
        flex-shrink: 0;
        font-size: 10px;
        color: var(--fc-text-muted);
    }

    .tree-spacer {
        width: 10px;
        flex-shrink: 0;
    }

    .folder-icon {
        font-size: 12px;
        flex-shrink: 0;
    }

    .file-icon {
        min-width: 16px;
        font-family: monospace;
        font-size: 9px;
        font-weight: 700;
        flex-shrink: 0;
        text-align: center;
    }

    .tree-name {
        font-family: monospace;
        font-size: 11px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .tree-actions {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        gap: 0;
    }

    .tree-actions button {
        width: 20px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: var(--fc-text-muted);
        border-radius: 3px;
    }

    .tree-actions button:hover {
        color: var(--fc-accent);
        background: var(--fc-panel-raised);
    }

    .explorer-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 30px 15px;
        color: var(--fc-text-muted);
        gap: 8px;
        text-align: center;
    }

    .explorer-empty > span {
        font-size: 24px;
        opacity: 0.5;
    }

    .explorer-empty p {
        font-family: monospace;
        font-size: 10px;
    }

    .explorer-empty button {
        font-family: monospace;
        font-size: 10px;
        color: var(--fc-accent);
    }

    .dialog-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(3px);
    }

    .dialog {
        width: 100%;
        max-width: 380px;
        padding: 16px;
        background: var(--fc-panel);
        border: 1px solid var(--fc-border-strong);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    }

    .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
        font-family: monospace;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.1em;
    }

    .dialog-header button {
        font-size: 18px;
        color: var(--fc-text-muted);
    }

    .dialog label {
        display: block;
        margin-bottom: 7px;
        font-family: monospace;
        font-size: 9px;
        letter-spacing: 0.1em;
        color: var(--fc-text-muted);
    }

    .dialog input {
        width: 100%;
        padding: 10px;
        font-family: monospace;
        font-size: 11px;
        color: var(--fc-text);
        background: var(--fc-bg);
        border: 1px solid var(--fc-border);
        outline: none;
    }

    .dialog input:focus {
        border-color: var(--fc-accent);
    }

    .dialog-error {
        margin-top: 8px;
        font-size: 10px;
        color: var(--fc-danger);
    }

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
    }

    .dialog-footer button {
        padding: 8px 12px;
        font-family: monospace;
        font-size: 10px;
    }

    .cancel-button {
        color: var(--fc-text-muted);
    }

    .confirm-button {
        color: var(--fc-accent);
        border: 1px solid var(--fc-accent);
    }

    .confirm-button:disabled {
        opacity: 0.5;
    }
</style>