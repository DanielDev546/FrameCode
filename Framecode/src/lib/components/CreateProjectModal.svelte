<script>
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
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div class="w-[580px] px-8 py-5 mt-8 rounded-lg border border-white/10 bg-[#070b12]">

      <!-- Header -->
      <div class="border-b border-white/5 px-6 py-5">
        <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-[#3a4154]">
          // CREATE PROJECT
        </p>
        <h2 class="mt-2 text-2xl font-bold text-[#e8edf5]">New Project</h2>
        <p class="mt-1 text-sm text-[#5a6478]">
          Create a new FrameCode project or import an existing repository.
        </p>
      </div>

      <!-- Body -->
      <div class="space-y-6 p-6">

        <!-- Error -->
        {#if error}
          <div class="border border-[#ff4f4f]/40 bg-[#ff4f4f]/5 px-4 py-3 font-mono text-[11px] text-[#ff4f4f]">
            ✕ {error}
          </div>
        {/if}

        <!-- Project Type -->
        <div>
          <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#3a4154]">
            Project Type
          </p>
          <div class="grid grid-cols-2 gap-4">
            <button
              type="button"
              onclick={() => projectType = 'framecode'}
              class="border p-5 text-left rounded-md transition
                     {projectType === 'framecode'
                       ? 'border-[#00ff88] bg-[#00ff88]/5'
                       : 'border-white/10 hover:border-[#00ff88]/40'}"
            >
              <p class="font-semibold text-[#e8edf5]">FrameCode Project</p>
              <p class="mt-2 text-sm text-[#5a6478]">Start from scratch inside FrameCode.</p>
            </button>

            <button
              type="button"
              onclick={() => projectType = 'github'}
              class="border p-5 text-left rounded-md transition
                     {projectType === 'github'
                       ? 'border-[#00ff88] bg-[#00ff88]/5'
                       : 'border-white/10 hover:border-[#00ff88]/40'}"
            >
              <p class="font-semibold text-[#e8edf5]">Import GitHub</p>
              <p class="mt-2 text-sm text-[#5a6478]">Continue working on an existing repository.</p>
            </button>
          </div>
        </div>

        <!-- Name -->
        <div>
          <label class="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-[#3a4154]">
            Project Name
          </label>
          <input
            bind:value={projectName}
            placeholder="awesome-dashboard"
            class="w-full border rounded-md border-white/10 bg-transparent px-4 py-3
                   text-[#e8edf5] outline-none transition focus:border-[#00ff88]"
          />
        </div>

        <!-- Language + Framework -->
        <div class="grid grid-cols-2 gap-5">
          <div>
            <label class="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-[#3a4154]">
              Language
            </label>
            <select
              bind:value={language}
              class="w-full border rounded-md border-white/10 bg-[#070b12] px-4 py-3 text-[#e8edf5]"
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
            <label class="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-[#3a4154]">
              Framework
            </label>
            <select
              bind:value={framework}
              class="w-full border rounded-md border-white/10 bg-[#070b12] px-4 py-3 text-[#e8edf5]"
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
          <label class="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-[#3a4154]">
            Visibility
          </label>
          <select
            bind:value={visibility}
            class="w-full border rounded-md border-white/10 bg-[#070b12] px-4 py-3 text-[#e8edf5]"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>

      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 border-t border-white/5 px-6 py-5">
        <button
          type="button"
          onclick={onClose}
          class="border border-white/10 px-5 py-2 font-mono text-[11px] uppercase
                 tracking-[0.15em] text-[#5a6478] transition hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onclick={handleCreate}
          disabled={loading}
          class="border border-[#00ff88]/30 bg-[#00ff88]/10 px-6 py-2 font-mono text-[11px]
                 uppercase tracking-[0.15em] text-[#00ff88] transition
                 hover:bg-[#00ff88] hover:text-black disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create →'}
        </button>
      </div>

    </div>
  </div>
{/if}