<script lang="ts">

  
let creatingType = $state<'file' | 'folder' | null>(null);
let creatingParent = $state<string | null>(null);
let newItemName = $state('');
let inlineError = $state('');
let inlineBusy = $state(false);

function startInlineCreate(
    type: 'file' | 'folder',
    parentPath = ''
) {
    creatingType = type;
    creatingParent = parentPath;
    newItemName = '';
    inlineError = '';

    // Make sure the target folder is expanded.
    if (parentPath && !expanded.includes(parentPath)) {
        expanded = [...expanded, parentPath];
    }
}

function cancelInlineCreate() {
    if (inlineBusy) return;

    creatingType = null;
    creatingParent = null;
    newItemName = '';
    inlineError = '';
}

async function submitInlineCreate() {
    const name = newItemName.trim();

    if (!creatingType || creatingParent === null) return;

    if (!name) {
        inlineError = 'Enter a name first.';
        return;
    }

    if (
        name === '.' ||
        name === '..' ||
        name.includes('/') ||
        name.includes('\\')
    ) {
        inlineError = 'Enter a valid name without slashes.';
        return;
    }

    const type = creatingType;
    const parent = creatingParent;
    const path = parent ? `${parent}/${name}` : name;

    inlineBusy = true;
    inlineError = '';

    try {
        if (type === 'file') {
            await onCreateFile(path);
        } else {
            await onCreateFolder(path);
        }

        await onRefresh();

        expandParents(path);

        if (type === 'folder') {
            expanded = [...new Set([...expanded, path])];
        }

        creatingType = null;
        creatingParent = null;
        newItemName = '';
        inlineError = '';

        if (type === 'file') {
            onOpen(path);
        }
    } catch (error) {
        inlineError =
            error instanceof Error
                ? error.message
                : `Could not create ${type}.`;
    } finally {
        inlineBusy = false;
    }
}


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
                onclick={() => startInlineCreate('file')}
            >
                <span class="toolbar-plus">＋</span>
            </button>

            <button
                type="button"
                title="New folder"
                onclick={() => startInlineCreate('folder')}
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
                             onclick={() => startInlineCreate('file', node.path)}
                            >＋</button>

                            <button
                                title="New folder inside folder"
                      
                                       onclick={() => startInlineCreate('folder', node.path)}
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

                   
{#if creatingParent === node.path}
    <div
        class="tree-create-input"
        style={`--depth:${depth + 1}`}
    >
        <span>{creatingType === 'file' ? '📄' : '📁'}</span>

        <input
            bind:value={newItemName}
            placeholder={creatingType === 'file'
                ? 'New file name...'
                : 'New folder name...'}
            disabled={inlineBusy}
            autofocus
            onkeydown={(event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    submitInlineCreate();
                }

                if (event.key === 'Escape') {
                    cancelInlineCreate();
                }
            }}
        />

        <button
            type="button"
            title="Cancel"
            onclick={cancelInlineCreate}
        >×</button>
    </div>

    {#if inlineError}
        <p class="inline-create-error">{inlineError}</p>
    {/if}



    <div class="tree-create-input">
        <span>
            {creatingType === 'file' ? '📄' : '📁'}
        </span>

        <input
            bind:value={newItemName}
            placeholder={creatingType === 'file'
                ? 'Enter file name...'
                : 'Enter folder name...'}
            autofocus
            onkeydown={(event) => {
                if (event.key === 'Escape') {
                    cancelInlineCreate();
                }
            }}
        />
    </div>
{/if}

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


{#if creatingParent === ''}
    <div class="tree-create-input" style="--depth:0">
        <span>{creatingType === 'file' ? '📄' : '📁'}</span>

        <input
            bind:value={newItemName}
            placeholder={creatingType === 'file'
                ? 'New file name...'
                : 'New folder name...'}
            disabled={inlineBusy}
            autofocus
            onkeydown={(event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    submitInlineCreate();
                }

                if (event.key === 'Escape') {
                    cancelInlineCreate();
                }
            }}
        />

        <button
            type="button"
            title="Cancel"
            onclick={cancelInlineCreate}
        >×</button>
    </div>

    {#if inlineError}
        <p class="inline-create-error">{inlineError}</p>
    {/if}
{/if}


        {#each tree as node (node.path)}
            {@render renderNode(node, 0)}
        {/each}

        
{#if tree.length === 0 && creatingParent !== ''}
    <div class="explorer-empty">
        <span>▱</span>
        <p>No files yet</p>
        <button onclick={() => startInlineCreate('file')}>
            Create your first file
        </button>
    </div>
{/if}

    </div>

<!-- DIALOG -->
{#if dialog}
    <div
        class="dialog-overlay"
        role="presentation"
        onclick={(event) => {
            if (event.target === event.currentTarget) closeDialog()
        }}
    >
        <div
            class="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="explorer-dialog-title"
        >
            <div class="dialog-header">
                <div>
                    <p class="dialog-eyebrow">FRAMECODE / EXPLORER</p>

                    <h3 id="explorer-dialog-title">
                        {dialog === 'file'
                            ? 'Create new file'
                            : dialog === 'folder'
                                ? 'Create new folder'
                                : 'Rename item'}
                    </h3>
                </div>

                <button
                    type="button"
                    class="dialog-close"
                    onclick={closeDialog}
                    disabled={busy}
                >
                    ×
                </button>
            </div>

            <label for="explorer-path">
                {dialog === 'rename' ? 'NEW PATH' : 'FILE / FOLDER PATH'}
            </label>

            <input
                id="explorer-path"
                bind:value={inputPath}
                autofocus
                placeholder="src/components/example.svelte"
                disabled={busy}
                onkeydown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault()
                        submitDialog()
                    }

                    if (event.key === 'Escape') {
                        closeDialog()
                    }
                }}
            />

            <p class="dialog-hint">
                Use / to create nested directories.
            </p>

            {#if errorMessage}
                <div class="dialog-error">
                    {errorMessage}
                </div>
            {/if}

            <div class="dialog-footer">
                <button
                    type="button"
                    class="cancel-button"
                    onclick={closeDialog}
                    disabled={busy}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="confirm-button"
                    onclick={submitDialog}
                    disabled={busy || !inputPath.trim()}
                >
                    {busy
                        ? 'Working...'
                        : dialog === 'file'
                            ? 'Create file'
                            : dialog === 'folder'
                                ? 'Create folder'
                                : 'Rename'}
                </button>
            </div>
        </div>
    </div>
{/if}
</div>

<style>

.tree-create-input {
    min-height: 29px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 5px 3px calc(8px + var(--depth) * 14px);
    background: var(--fc-panel-raised);
}

.tree-create-input > span {
    flex-shrink: 0;
    font-size: 12px;
}

.tree-create-input input {
    flex: 1;
    min-width: 0;
    height: 23px;
    padding: 0 6px;
    font-family: monospace;
    font-size: 11px;
    color: var(--fc-text);
    background: var(--fc-panel);
    border: 1px solid var(--fc-accent);
    border-radius: 3px;
    outline: none;
}

.tree-create-input input::placeholder {
    color: var(--fc-text-muted);
}

.tree-create-input button {
    width: 20px;
    height: 22px;
    flex-shrink: 0;
    color: var(--fc-text-muted);
    font-size: 15px;
}

.tree-create-input button:hover {
    color: #ff6b6b;
}

.inline-create-error {
    padding: 3px 8px 3px calc(8px + var(--depth) * 14px);
    color: #ff8585;
    font-family: monospace;
    font-size: 9px;
}

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
    z-index: 999999;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    background: rgba(2, 5, 10, 0.82);
}

.dialog {
    width: 100%;
    max-width: 420px;

    padding: 22px;

    background: #0c121c;
    color: #e8edf5;

    border: 1px solid #273345;
    border-top: 2px solid #00ff88;

    box-shadow:
        0 24px 80px rgba(0, 0, 0, 0.75),
        0 0 30px rgba(0, 255, 136, 0.04);

    border-radius: 8px;
}

.dialog-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    margin-bottom: 24px;
}

.dialog-eyebrow {
    font-family: monospace;
    font-size: 9px;
    letter-spacing: 0.16em;
    color: #00ff88;

    margin-bottom: 8px;
}

.dialog-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #e8edf5;
}

.dialog-close {
    width: 30px;
    height: 30px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 22px;
    color: #8995a8;

    border: 1px solid #273345;
    border-radius: 4px;
}

.dialog-close:hover {
    color: #ff6b6b;
    background: #151d29;
}

.dialog label {
    display: block;

    margin-bottom: 8px;

    font-family: monospace;
    font-size: 9px;
    letter-spacing: 0.12em;

    color: #8b98aa;
}

.dialog input {
    width: 100%;
    height: 42px;

    padding: 0 12px;

    font-family: monospace;
    font-size: 12px;

    color: #e8edf5;
    background: #070b12;

    border: 1px solid #273345;
    border-radius: 4px;

    outline: none;
    transition: border-color 150ms;
}

.dialog input:focus {
    border-color: #00ff88;
    box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.08);
}

.dialog input::placeholder {
    color: #566276;
}

.dialog-hint {
    margin-top: 8px;

    font-family: monospace;
    font-size: 9px;
    color: #647186;
}

.dialog-error {
    margin-top: 12px;
    padding: 10px;

    font-family: monospace;
    font-size: 10px;

    color: #ff8585;
    background: rgba(255, 80, 80, 0.08);

    border: 1px solid rgba(255, 80, 80, 0.2);
    border-radius: 4px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    margin-top: 24px;
}

.dialog-footer button {
    height: 34px;
    padding: 0 14px;

    font-family: monospace;
    font-size: 10px;

    border-radius: 4px;
    transition: 150ms;
}

.cancel-button {
    color: #a1adbd;
    border: 1px solid #273345;
}

.cancel-button:hover {
    background: #151d29;
    color: #e8edf5;
}

.confirm-button {
    color: #06110b;
    background: #00ff88;
    border: 1px solid #00ff88;
    font-weight: 700;
}

.confirm-button:hover {
    background: #00dc77;
}

.confirm-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.dialog button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
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