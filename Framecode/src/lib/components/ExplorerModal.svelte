
<script lang="ts">
    type ModalMode = 'file' | 'folder' | 'rename' | 'delete'

    let {
        mode,
        targetPath = '',
        initialName = '',
        onClose,
        onSubmit
    } = $props<{
        mode: ModalMode
        targetPath?: string
        initialName?: string
        onClose: () => void
        onSubmit: (payload: {
            name: string
            location: string
            path: string
        }) => Promise<void> | void
    }>()

    let name = $state(initialName)
    let location = $state('')
    let busy = $state(false)
    let errorMessage = $state('')

    const titles = {
        file: 'New File',
        folder: 'New Folder',
        rename: 'Rename',
        delete: 'Delete'
    }

    const descriptions = {
        file: 'Create a new file in your workspace.',
        folder: 'Create a directory in your workspace.',
        rename: 'Rename this workspace entry.',
        delete: 'This action cannot be undone.'
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && !busy) {
            onClose()
        }
    }

    async function submit() {
        if (busy) return

        if (mode !== 'delete' && !name.trim()) {
            errorMessage = 'Enter a name first.'
            return
        }

        busy = true
        errorMessage = ''

        try {
            await onSubmit({
                name: name.trim(),
                location: location.trim().replace(/^\/+|\/+$/g, ''),
                path: targetPath
            })
        } catch (error) {
            errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Something went wrong.'
        } finally {
            busy = false
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
    class="fixed inset-0 z-[9999] flex items-center justify-center p-4
           bg-black/65 backdrop-blur-sm"
    onclick={(event) => {
        if (event.target === event.currentTarget && !busy) {
            onClose()
        }
    }}
>
    <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="explorer-modal-title"
        class="w-full max-w-[420px] overflow-hidden
               bg-[var(--fc-panel-raised)]
               border border-[var(--fc-border-strong)]
               shadow-2xl rounded-xl"
    >
        <!-- HEADER -->
        <div class="flex items-center justify-between px-5 py-4
                    border-b border-[var(--fc-border)]">

            <div>
                <h2
                    id="explorer-modal-title"
                    class="font-mono text-sm font-semibold
                           text-[var(--fc-text)]"
                >
                    {descriptions[mode]}
                </h2>

                <p class="mt-1 text-xs text-[var(--fc-text-muted)]">
                    {descriptions[mode]}
                </p>
            </div>

            <button
                type="button"
                onclick={onClose}
                disabled={busy}
                class="w-8 h-8 flex items-center justify-center
                       rounded-md text-[var(--fc-text-muted)]
                       hover:bg-[var(--fc-panel-hover)]
                       hover:text-[var(--fc-text)]
                       transition-colors"
                aria-label="Close"
            >
                ✕
            </button>
        </div>

        <!-- BODY -->
        <form onsubmit={(event) => {
            event.preventDefault()
            submit()
        }}>
            <div class="p-5 space-y-4">

                {#if mode === 'delete'}
                    <div class="rounded-lg border border-[var(--fc-danger)]/20
                                bg-[var(--fc-danger)]/5 p-4">

                        <p class="text-sm text-[var(--fc-text)]">
                            Are you sure you want to delete this?
                        </p>

                        <p class="mt-2 font-mono text-xs
                                  text-[var(--fc-danger)] break-all">
                            {targetPath}
                        </p>

                        <p class="mt-3 text-xs leading-relaxed
                                  text-[var(--fc-text-muted)]">
                            If this is a folder, its contents may also be
                            deleted.
                        </p>
                    </div>

                {:else}
                    <!-- NAME -->
                    <div class="space-y-2">
                        <label
                            for="explorer-name"
                            class="block font-mono text-[10px]
                                   uppercase tracking-wider
                                   text-[var(--fc-text-muted)]"
                        >
                            {mode === 'rename'
                                ? 'New name'
                                : mode === 'folder'
                                    ? 'Folder name'
                                    : 'File name'}
                        </label>

                        <input
                            id="explorer-name"
                            bind:value={name}
                            autofocus
                            placeholder={mode === 'folder'
                                ? 'components'
                                : mode === 'file'
                                    ? 'App.svelte'
                                    : 'New name'}
                            class="w-full px-3 py-2.5 rounded-md
                                   bg-[var(--fc-bg)]
                                   border border-[var(--fc-border)]
                                   focus:border-[var(--fc-accent)]
                                   focus:outline-none
                                   font-mono text-sm
                                   text-[var(--fc-text)]
                                   placeholder:text-[var(--fc-text-muted)]"
                        />
                    </div>

                    {#if mode !== 'rename'}
                        <!-- LOCATION -->
                        <div class="space-y-2">
                            <label
                                for="explorer-location"
                                class="block font-mono text-[10px]
                                       uppercase tracking-wider
                                       text-[var(--fc-text-muted)]"
                            >
                                Location
                            </label>

                            <input
                                id="explorer-location"
                                bind:value={location}
                                placeholder="Root (leave empty)"
                                class="w-full px-3 py-2.5 rounded-md
                                       bg-[var(--fc-bg)]
                                       border border-[var(--fc-border)]
                                       focus:border-[var(--fc-accent)]
                                       focus:outline-none
                                       font-mono text-sm
                                       text-[var(--fc-text)]"
                            />

                            <p class="text-[10px]
                                      text-[var(--fc-text-muted)]">
                                Use a relative folder path, e.g.
                                src/components
                            </p>
                        </div>
                    {/if}
                {/if}

                {#if errorMessage}
                    <p class="text-xs text-[var(--fc-danger)]">
                        {errorMessage}
                    </p>
                {/if}
            </div>

            <!-- FOOTER -->
            <div class="flex items-center justify-end gap-2
                        px-5 py-4 border-t
                        border-[var(--fc-border)]">

                <button
                    type="button"
                    onclick={onClose}
                    disabled={busy}
                    class="px-4 py-2 rounded-md text-xs
                           text-[var(--fc-text-secondary)]
                           hover:bg-[var(--fc-panel-hover)]
                           transition-colors"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={busy || (mode !== 'delete' && !name.trim())}
                    class="px-4 py-2 rounded-md text-xs font-medium
                           bg-[var(--fc-accent)]
                           text-[var(--fc-bg)]
                           hover:opacity-90
                           disabled:opacity-40
                           transition-all"
                >
                    {busy
                        ? 'Processing...'
                        : mode === 'delete'
                            ? 'Delete'
                            : mode === 'rename'
                                ? 'Rename'
                                : mode === 'folder'
                                    ? 'Create Folder'
                                    : 'Create File'}
                </button>
            </div>
        </form>
    </div>
</div>
