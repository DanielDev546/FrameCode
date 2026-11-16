
<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'

  // ─── Project State ──────────────────────────────────

  let projectName = $state('')
  let projectType = $state('framecode')
  let language = $state('TypeScript')
  let framework = $state('SvelteKit')
  let visibility = $state('private')

  let loading = $state(false)
  let error = $state('')

  // ─── Language Configuration ─────────────────────────

  const frameworkOptions: Record<string, string[]> = {
    TypeScript: [
      'SvelteKit',
      'React',
      'Next.js',
      'Elysia',
      'Hono',
      'None'
    ],
    JavaScript: [
      'Node.js',
      'React',
      'Next.js',
      'Vue',
      'Astro',
      'None'
    ],
    Java: [
      'Maven',
      'Gradle'
    ],
    'C++': [
      'CMake',
      'Make'
    ],
    Python: [
      'None',
      'Django',
      'Flask',
      'FastAPI'
    ],
    Rust: [
      'Cargo'
    ],
    Go: [
      'Go Modules'
    ]
  }

  // ─── Derived State ───────────────────────────────────

  const availableFrameworks = $derived(
    frameworkOptions[language] ?? ['None']
  )

  const slug = $derived(
    projectName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  )

  // ─── Language Handler ────────────────────────────────

  function handleLanguageChange(event: Event) {
    const target = event.currentTarget as HTMLSelectElement

    language = target.value

    // Reset framework to a valid option
    framework = frameworkOptions[language]?.[0] ?? 'None'
  }

  // ─── Project Creation ────────────────────────────────

  async function handleCreate() {
    if (!projectName.trim()) {
      error = 'Project name is required.'
      return
    }

    if (loading) return

    loading = true
    error = ''

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: projectName.trim(),
          type: projectType,
          language,
          framework,
          visibility
        })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        error = data.error ?? 'Something went wrong.'
        return
      }

      // Project successfully created
      const project = data

      console.log('Project created:', project)

      // Refresh dashboard data
      await invalidateAll()

      // Navigate back to dashboard
      await goto('/dashboard')

    } catch (e) {
      console.error('Project creation error:', e)
      error = 'Network error. Please try again.'
    } finally {
      loading = false
    }
  }

  function handleCancel() {
    if (loading) return
    goto('/dashboard')
  }
</script>

<svelte:head>
  <title>New Project | FrameCode</title>
  <meta
    name="description"
    content="Create a new development workspace in FrameCode."
  />
</svelte:head>

<div class="min-h-full bg-[#070b12] px-5 py-8 sm:px-8 lg:px-12">

  <div class="mx-auto max-w-5xl">

    <!-- Breadcrumb -->
    <div class="mb-9 flex items-center gap-2 text-xs">
      <a
        href="/dashboard"
        class="text-[#737f93] transition hover:text-white"
      >
        Dashboard
      </a>

      <span class="text-[#394354]">/</span>

      <span class="text-[#00ff88]">New Project</span>
    </div>

    <!-- Page Header -->
    <div class="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

      <div>
        <div class="mb-3 flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-[#00ff88]"></span>

          <p class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#00ff88]">
            FRAMECODE / WORKSPACE
          </p>
        </div>

        <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Create something great.
        </h1>

        <p class="mt-3 max-w-xl text-sm leading-relaxed text-[#8994a7]">
          Set up your development environment, choose your stack,
          and bring your next idea to life.
        </p>
      </div>

      <button
        type="button"
        onclick={handleCancel}
        disabled={loading}
        class="flex w-fit items-center gap-2 border border-white/[0.09]
        px-4 py-2.5 text-xs font-medium text-[#8994a7]
        transition hover:border-white/20 hover:text-white
        disabled:opacity-40"
      >
        ← Back to dashboard
      </button>

    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_280px]">

      <!-- Configuration Form -->
      <main class="min-w-0">

        <form
          onsubmit={(event) => {
            event.preventDefault()
            void handleCreate()
          }}
          class="overflow-hidden border border-white/[0.09] bg-[#090e17]"
        >

          <!-- Form Header -->
          <div class="border-b border-white/[0.07] px-6 py-5 sm:px-8">

            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-base font-semibold text-white">
                  Project configuration
                </h2>

                <p class="mt-1 text-xs text-[#778398]">
                  Configure the fundamentals of your workspace.
                </p>
              </div>

              <span class="border border-[#00ff88]/20 bg-[#00ff88]/[0.06]
                px-2.5 py-1 font-mono text-[9px] text-[#00ff88]">
                NEW PROJECT
              </span>
            </div>

          </div>

          <div class="space-y-8 px-6 py-7 sm:px-8 sm:py-8">

            <!-- Error -->
            {#if error}
              <div
                role="alert"
                aria-live="assertive"
                class="border border-red-500/20 bg-red-500/[0.06]
                px-4 py-3 text-xs text-red-400"
              >
                ✕ {error}
              </div>
            {/if}

            <!-- 01 Project Type -->
            <section>
              <div class="mb-4">
                <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-white">
                  01. Project type
                </h3>

                <p class="mt-1 text-xs text-[#737f93]">
                  Choose how you want to start.
                </p>
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onclick={() => {
                    projectType = 'framecode'
                    error = ''
                  }}
                  aria-pressed={projectType === 'framecode'}
                  disabled={loading}
                  class={`flex items-start gap-3 border p-4 text-left transition
                    ${projectType === 'framecode'
                      ? 'border-[#00ff88]/50 bg-[#00ff88]/[0.045]'
                      : 'border-white/[0.08] bg-white/[0.015] hover:border-white/20'}`}
                >
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center
                    bg-white/[0.05] text-[#00ff88]">
                    <svg viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="1.7"
                      class="h-5 w-5">
                      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>
                    </svg>
                  </div>

                  <div class="flex-1">
                    <p class="text-xs font-semibold text-white">
                      FrameCode Project
                    </p>
                    <p class="mt-1 text-[10px] text-[#778398]">
                      Start fresh inside FrameCode.
                    </p>
                  </div>

                  {#if projectType === 'framecode'}
                    <span class="text-xs text-[#00ff88]">✓</span>
                  {/if}
                </button>

                <button
                  type="button"
                  onclick={() => {
                    projectType = 'github'
                    error = ''
                  }}
                  aria-pressed={projectType === 'github'}
                  disabled={loading}
                  class={`flex items-start gap-3 border p-4 text-left transition
                    ${projectType === 'github'
                      ? 'border-[#00ff88]/50 bg-[#00ff88]/[0.045]'
                      : 'border-white/[0.08] bg-white/[0.015] hover:border-white/20'}`}
                >
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center
                    bg-white/[0.05] text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor"
                      class="h-5 w-5">
                      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.59 1.21 3.22.93.1-.72.39-1.21.7-1.49-2.47-.28-5.06-1.24-5.06-5.5 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.12-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.27-2.6 5.21-5.08 5.49.4.35.75 1.02.75 2.05v3.04c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/>
                    </svg>
                  </div>

                  <div class="flex-1">
                    <p class="text-xs font-semibold text-white">
                      Import GitHub
                    </p>
                    <p class="mt-1 text-[10px] text-[#778398]">
                      Continue with an existing repository.
                    </p>
                  </div>

                  {#if projectType === 'github'}
                    <span class="text-xs text-[#00ff88]">✓</span>
                  {/if}
                </button>

              </div>
            </section>

            <div class="h-px bg-white/[0.06]"></div>

            <!-- 02 Project Identity -->
            <section>
              <div class="mb-4">
                <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-white">
                  02. Project identity
                </h3>

                <p class="mt-1 text-xs text-[#737f93]">
                  Give your project a recognizable name.
                </p>
              </div>

              <label
                for="project-name"
                class="mb-2 block text-xs font-medium text-[#b4bdcc]"
              >
                Project name <span class="text-[#00ff88]">*</span>
              </label>

              <input
                id="project-name"
                bind:value={projectName}
                maxlength="60"
                required
                disabled={loading}
                placeholder="e.g. awesome-dashboard"
                autocomplete="off"
                class="w-full border border-white/[0.09] bg-[#0d131e]
                px-4 py-3.5 text-sm text-white outline-none
                transition placeholder:text-[#465267]
                focus:border-[#00ff88]/60
                focus:ring-1 focus:ring-[#00ff88]/20"
              />

              <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p class="text-[10px] text-[#697589]">
                  Project identifier:
                  <span class="font-mono text-[#00ff88]/80">
                    {slug || 'your-project'}
                  </span>
                </p>

                <span class="font-mono text-[10px] text-[#566176]">
                  {projectName.length}/60
                </span>
              </div>
            </section>

            <div class="h-px bg-white/[0.06]"></div>

            <!-- 03 Development Stack -->
            <section>
              <div class="mb-4">
                <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-white">
                  03. Development stack
                </h3>

                <p class="mt-1 text-xs text-[#737f93]">
                  Select your programming language and development tools.
                </p>
              </div>

              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label
                    for="language"
                    class="mb-2 block text-xs font-medium text-[#b4bdcc]"
                  >
                    Programming language
                  </label>

                  <select
                    id="language"
                    value={language}
                    onchange={handleLanguageChange}
                    disabled={loading}
                    class="w-full appearance-none border border-white/[0.09]
                    bg-[#0d131e] px-4 py-3.5 text-sm text-white
                    outline-none transition focus:border-[#00ff88]/60
                    disabled:opacity-50"
                  >
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="Python">Python</option>
                    <option value="Rust">Rust</option>
                    <option value="Go">Go</option>
                  </select>

                  <p class="mt-2 text-[10px] text-[#667286]">
                    Select your primary language.
                  </p>
                </div>

                <div>
                  <label
                    for="framework"
                    class="mb-2 block text-xs font-medium text-[#b4bdcc]"
                  >
                    Build system / framework
                  </label>

                  <select
                    id="framework"
                    bind:value={framework}
                    disabled={loading}
                    class="w-full appearance-none border border-white/[0.09]
                    bg-[#0d131e] px-4 py-3.5 text-sm text-white
                    outline-none transition focus:border-[#00ff88]/60
                    disabled:opacity-50"
                  >
                    {#each availableFrameworks as option}
                      <option value={option}>{option}</option>
                    {/each}
                  </select>

                  <p class="mt-2 text-[10px] text-[#667286]">
                    Options adapt to your language.
                  </p>
                </div>

              </div>
            </section>

            <div class="h-px bg-white/[0.06]"></div>

            <!-- 04 Visibility -->
            <section>
              <div class="mb-4">
                <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-white">
                  04. Project visibility
                </h3>

                <p class="mt-1 text-xs text-[#737f93]">
                  Decide who can access your project.
                </p>
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onclick={() => visibility = 'private'}
                  disabled={loading}
                  aria-pressed={visibility === 'private'}
                  class={`flex items-start gap-3 border p-4 text-left transition
                    ${visibility === 'private'
                      ? 'border-[#00ff88]/50 bg-[#00ff88]/[0.045]'
                      : 'border-white/[0.08] bg-white/[0.015] hover:border-white/20'}`}
                >
                  <div class="mt-0.5 text-[#a1adbf]">
                    <svg viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="1.7"
                      class="h-5 w-5">
                      <rect x="4" y="10" width="16" height="11" rx="2"/>
                      <path d="M8 10V7a4 4 0 1 1 8 0v3"/>
                    </svg>
                  </div>

                  <div class="flex-1">
                    <p class="text-xs font-semibold text-white">Private</p>
                    <p class="mt-1 text-[10px] text-[#778398]">
                      Only authorized users can access this project.
                    </p>
                  </div>

                  {#if visibility === 'private'}
                    <span class="text-xs text-[#00ff88]">✓</span>
                  {/if}
                </button>

                <button
                  type="button"
                  onclick={() => visibility = 'public'}
                  disabled={loading}
                  aria-pressed={visibility === 'public'}
                  class={`flex items-start gap-3 border p-4 text-left transition
                    ${visibility === 'public'
                      ? 'border-[#00ff88]/50 bg-[#00ff88]/[0.045]'
                      : 'border-white/[0.08] bg-white/[0.015] hover:border-white/20'}`}
                >
                  <div class="mt-0.5 text-[#a1adbf]">
                    <svg viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="1.7"
                      class="h-5 w-5">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M3 12h18M12 3a15 15 0 0 1 0 18"/>
                    </svg>
                  </div>

                  <div class="flex-1">
                    <p class="text-xs font-semibold text-white">Public</p>
                    <p class="mt-1 text-[10px] text-[#778398]">
                      Make your project publicly accessible.
                    </p>
                  </div>

                  {#if visibility === 'public'}
                    <span class="text-xs text-[#00ff88]">✓</span>
                  {/if}
                </button>

              </div>
            </section>

          </div>

          <!-- Footer -->
          <div class="flex flex-col-reverse gap-3 border-t
            border-white/[0.07] bg-[#080c13] px-6 py-5
            sm:flex-row sm:items-center sm:justify-between sm:px-8">

            <p class="text-[10px] text-[#626e82]">
              <span class="text-[#00ff88]">●</span>
              Ready to build something?
            </p>

            <div class="flex flex-col-reverse gap-3 sm:flex-row">

              <button
                type="button"
                onclick={handleCancel}
                disabled={loading}
                class="border border-white/[0.09] px-5 py-3
                text-xs font-semibold text-[#9ba6b8]
                transition hover:bg-white/[0.04] hover:text-white
                disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !projectName.trim()}
                class="flex items-center justify-center gap-2
                border border-[#00ff88]/40 bg-[#00ff88]
                px-6 py-3 text-xs font-bold text-[#041109]
                transition hover:bg-[#36ffa4]
                disabled:cursor-not-allowed disabled:opacity-40"
              >
                {#if loading}
                  <span class="h-3.5 w-3.5 animate-spin rounded-full
                    border-2 border-black/30 border-t-black">
                  </span>
                  Creating...
                {:else}
                  Create project
                  <span>→</span>
                {/if}
              </button>

            </div>
          </div>

        </form>
      </main>

      <!-- Right Sidebar -->
      <aside class="space-y-5">

        <!-- Workspace Preview -->
        <div class="border border-white/[0.09] bg-[#090e17]">

          <div class="border-b border-white/[0.07] px-5 py-4">
            <p class="font-mono text-[10px] font-bold uppercase
              tracking-[0.16em] text-[#9ba7b9]">
              Workspace preview
            </p>
          </div>

          <div class="space-y-5 p-5">

            <div>
              <p class="mb-2 text-[10px] uppercase tracking-wider text-[#667286]">
                Project
              </p>

              <p class="break-all text-sm font-semibold text-white">
                {projectName || 'Untitled project'}
              </p>

              <p class="mt-1 break-all font-mono text-[10px] text-[#00ff88]/70">
                /{slug || 'your-project'}
              </p>
            </div>

            <div class="h-px bg-white/[0.06]"></div>

            <div>
              <p class="mb-2 text-[10px] uppercase tracking-wider text-[#667286]">
                Project type
              </p>

              <p class="text-sm font-medium text-white capitalize">
                {projectType === 'github' ? 'GitHub Import' : 'FrameCode Project'}
              </p>
            </div>

            <div>
              <p class="mb-2 text-[10px] uppercase tracking-wider text-[#667286]">
                Language
              </p>

              <p class="text-sm font-medium text-white">
                {language}
              </p>
            </div>

            <div>
              <p class="mb-2 text-[10px] uppercase tracking-wider text-[#667286]">
                Build system / framework
              </p>

              <p class="text-sm font-medium text-white">
                {framework}
              </p>
            </div>

            <div>
              <p class="mb-2 text-[10px] uppercase tracking-wider text-[#667286]">
                Visibility
              </p>

              <div class="flex items-center gap-2">
                <span class="h-1.5 w-1.5 rounded-full
                  {visibility === 'private' ? 'bg-amber-400' : 'bg-[#00ff88]'}">
                </span>

                <span class="text-xs capitalize text-white">
                  {visibility}
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- Information Card -->
        <div class="border border-[#00ff88]/15 bg-[#00ff88]/[0.025] p-5">

          <div class="mb-3 flex items-center gap-2">
            <span class="text-[#00ff88]">✳</span>

            <p class="text-xs font-semibold text-white">
              Built for developers
            </p>
          </div>

          <p class="text-xs leading-relaxed text-[#8490a3]">
            FrameCode helps you organize your projects, manage your
            source code and build in one development workspace.
          </p>

          <div class="mt-4 flex items-center gap-2
            border-t border-white/[0.06] pt-4">
            <span class="h-1.5 w-1.5 rounded-full bg-[#00ff88]"></span>

            <span class="font-mono text-[9px] text-[#00ff88]">
              FRAMECODE WORKSPACE
            </span>
          </div>

        </div>

      </aside>

    </div>

    <!-- Bottom Footer -->
    <div class="mt-8 flex flex-col gap-2 border-t border-white/[0.06]
      pt-5 sm:flex-row sm:items-center sm:justify-between">

      <p class="font-mono text-[9px] tracking-wider text-[#566176]">
        FRAMECODE / PROJECT CREATION
      </p>

      <p class="text-[10px] text-[#566176]">
        Designed for the way developers build.
      </p>

    </div>

  </div>
</div>
