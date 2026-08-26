<script lang="ts">
  let { open = false, onClose, onCreated } = $props()

  let projectName = $state('')
  let projectType = $state('framecode')
  let language    = $state('TypeScript')
  let framework   = $state('SvelteKit')
  let visibility  = $state('private')
  let loading     = $state(false)
  let error       = $state('')

  async function handleCreate() {
    if (!projectName.trim()) {
      error = 'Project name is required.'
      return
    }

    loading = true
    error   = ''

    try {
      const res = await fetch('/api/projects', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:       projectName.trim(),
          type:       projectType,
          language,
          framework,
          visibility,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        error = data.error ?? 'Something went wrong.'
        return
      }

      const project = await res.json()
      onCreated?.(project)   // tell dashboard to add to list
      onClose?.()            // close modal
      projectName = ''       // reset form

    } catch (e) {
      error = 'Network error. Please try again.'
    } finally {
      loading = false
    }
  }
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-md"
  >
    <!-- Modal Container -->
    <div
      class="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[#00ff88]/20 bg-[#070b12] shadow-[0_0_80px_rgba(0,255,136,0.12)]"
    >
      <!-- Header -->
      <div class="shrink-0 border-b border-white/10 p-6 sm:p-8">
        <p class="font-mono text-xs uppercase tracking-[0.25em] text-[#00ff88]">
          // CREATE PROJECT
        </p>

        <h2 class="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
          New Project
        </h2>

        <p class="mt-2 text-sm text-[#8a94a8] leading-relaxed">
          Create a new FrameCode project or import an existing repository.
        </p>
      </div>

      <!-- Body (Scrollable area with wider spacing) -->
      <div class="space-y-7 overflow-y-auto p-6 sm:p-8 custom-scrollbar">

        <!-- Error -->
        {#if error}
          <div
            class="rounded-md border border-[#ff4f4f]/40 bg-[#ff4f4f]/10 px-4 py-3 font-mono text-xs text-[#ff4f4f]"
          >
            ✕ {error}
          </div>
        {/if}

        <!-- Project Type -->
        <div>
          <p class="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#6b768e] font-semibold">
            Project Type
          </p>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onclick={() => projectType = 'framecode'}
              class="rounded-lg border p-5 text-left transition-all duration-150
              {projectType === 'framecode'
                ? 'border-[#00ff88] bg-[#00ff88]/10 shadow-[0_0_15px_rgba(0,255,136,0.1)]'
                : 'border-white/10 hover:border-white/30 bg-white/[0.02]'}"
            >
              <p class="font-semibold text-base text-white">
                FrameCode Project
              </p>

              <p class="mt-1.5 text-xs text-[#8a94a8]">
                Start from scratch inside FrameCode.
              </p>
            </button>

            <button
              type="button"
              onclick={() => projectType = 'github'}
              class="rounded-lg border p-5 text-left transition-all duration-150
              {projectType === 'github'
                ? 'border-[#00ff88] bg-[#00ff88]/10 shadow-[0_0_15px_rgba(0,255,136,0.1)]'
                : 'border-white/10 hover:border-white/30 bg-white/[0.02]'}"
            >
              <p class="font-semibold text-base text-white">
                Import GitHub
              </p>

              <p class="mt-1.5 text-xs text-[#8a94a8]">
                Continue working on an existing repository.
              </p>
            </button>
          </div>
        </div>

        <!-- Name -->
        <div>
          <label
            for="project-name-input"
            class="mb-2.5 block font-mono text-xs uppercase tracking-[0.2em] text-[#6b768e] font-semibold"
          >
            Project Name
          </label>

          <input
            id="project-name-input"
            bind:value={projectName}
            placeholder="awesome-dashboard"
            class="w-full rounded-lg border border-white/10 bg-[#0d111a] px-4 py-3.5 text-base text-white placeholder-slate-600 outline-none transition focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]"
          />
        </div>

        <!-- Language + Framework -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              for="language-select"
              class="mb-2.5 block font-mono text-xs uppercase tracking-[0.2em] text-[#6b768e] font-semibold"
            >
              Language
            </label>

            <select
              id="language-select"
              bind:value={language}
              class="w-full rounded-lg border border-white/10 bg-[#0d111a] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#00ff88]"
            >
              <option>TypeScript</option>
              <option>JavaScript</option>
              <option>Python</option>
              <option>C++</option>
              <option>Rust</option>
              <option>Go</option>
            </select>
          </div>

          <div>
            <label
              for="framework-select"
              class="mb-2.5 block font-mono text-xs uppercase tracking-[0.2em] text-[#6b768e] font-semibold"
            >
              Framework
            </label>

            <select
              id="framework-select"
              bind:value={framework}
              class="w-full rounded-lg border border-white/10 bg-[#0d111a] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#00ff88]"
            >
              <option>SvelteKit</option>
              <option>React</option>
              <option>Next.js</option>
              <option>Vue</option>
              <option>Astro</option>
              <option>Elysia</option>
              <option>None</option>
            </select>
          </div>
        </div>

        <!-- Visibility -->
        <div>
          <label
            for="visibility-select"
            class="mb-2.5 block font-mono text-xs uppercase tracking-[0.2em] text-[#6b768e] font-semibold"
          >
            Visibility
          </label>

          <select
            id="visibility-select"
            bind:value={visibility}
            class="w-full rounded-lg border border-white/10 bg-[#0d111a] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#00ff88]"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>

      </div>

      <!-- Footer -->
      <div
        class="shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-white/10 p-6 sm:px-8 sm:py-6"
      >
        <button
          type="button"
          onclick={onClose}
          class="w-full sm:w-auto rounded-md border border-white/10 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-[#8a94a8] transition hover:bg-white/5 hover:text-white"
        >
          Cancel
        </button>

        <button
          type="button"
          onclick={handleCreate}
          disabled={loading}
          class="w-full sm:w-auto rounded-md border border-[#00ff88]/40 bg-[#00ff88]/15 px-8 py-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#00ff88] transition hover:bg-[#00ff88] hover:text-black disabled:opacity-50 shadow-[0_0_20px_rgba(0,255,136,0.15)]"
        >
          {loading ? 'Creating...' : 'Create →'}
        </button>
      </div>

    </div>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 136, 0.3);
  }
</style>