<script lang="ts">
  
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'

  interface Props { form: ActionData }
  let { form }: Props = $props()

  let loading  = $state(false)
  let provider = $state<'github' | 'google' | null>(null)
  let showPass = $state(false)

  let name     = $state('')
  let email    = $state('')
  let password = $state('')

  // Password strength
  let strength = $derived.by(() => {
    if (password.length === 0) return 0
    let score = 0
    if (password.length >= 8)              score++
    if (/[A-Z]/.test(password))            score++
    if (/[0-9]/.test(password))            score++
    if (/[^A-Za-z0-9]/.test(password))     score++
    return score
  })

  let strengthLabel = $derived(
    strength === 0 ? ''         :
    strength === 1 ? 'WEAK'     :
    strength === 2 ? 'FAIR'     :
    strength === 3 ? 'GOOD'     : 'STRONG'
  )

  let strengthColor = $derived(
    strength <= 1 ? '#ff4f4f' :
    strength === 2 ? '#ffb340' :
    strength === 3 ? '#00d4ff' : '#00ff88'
  )

  let canSubmit = $derived(name.length > 1 && email.includes('@') && password.length >= 8)

  function handleOAuth(p: 'github' | 'google') {
    provider = p
    loading  = true
    window.location.href = `/auth/${p}`
  }
</script>

<div class="flex min-h-[calc(100vh-65px)]">

  <!-- ── LEFT PANEL: terminal art ── -->
  <div class="hidden lg:flex flex-1 border-r border-white/[0.06] items-center justify-center p-16 relative overflow-hidden">

    <span class="absolute font-display font-extrabold text-[220px] leading-none text-white/[0.015] select-none pointer-events-none tracking-[-8px]">FC</span>

    <div class="w-full max-w-[420px] border border-white/[0.08] bg-black/50 backdrop-blur-xl">
      <div class="flex items-center gap-2 px-4 py-[10px] bg-white/[0.04] border-b border-white/[0.08]">
        <span class="w-[9px] h-[9px] rounded-full bg-[#ff5f57]"></span>
        <span class="w-[9px] h-[9px] rounded-full bg-[#ffbd2e]"></span>
        <span class="w-[9px] h-[9px] rounded-full bg-[#28ca41]"></span>
        <span class="font-mono text-[10px] text-[#5a6478] mx-auto">framecode — onboarding</span>
      </div>
      <div class="p-6 font-mono text-[11px] leading-[2]">
        <div class="flex gap-3 text-[#5a6478]"><span class="text-[#00ff88]">❯</span> create-framecode account</div>
        <div class="flex gap-3 text-[#00ff88]"><span class="opacity-0">❯</span> ✓ Identity verified</div>
        <div class="flex gap-3 text-[#00ff88]"><span class="opacity-0">❯</span> ✓ GitHub connected</div>
        <div class="flex gap-3 text-[#00ff88]"><span class="opacity-0">❯</span> ✓ Workspace initialized</div>
        <div class="flex gap-3 text-[#00d4ff]"><span class="opacity-0">❯</span> ◆ Seeding starter templates...</div>
        <div class="flex gap-3 text-[#5a6478]"><span class="opacity-0">❯</span>   → saas-hero-v2 ready</div>
        <div class="flex gap-3 text-[#5a6478]"><span class="opacity-0">❯</span>   → admin-dashboard ready</div>
        <div class="flex gap-3 text-[#00ff88]"><span class="opacity-0">❯</span> ✓ You're set. Start building.</div>
        <div class="flex items-center gap-3 mt-1">
          <span class="text-[#00ff88]">❯</span>
          <span class="inline-block w-[7px] h-[13px] bg-[#5a6478] animate-[blink_1.1s_step-end_infinite]"></span>
        </div>
      </div>
    </div>

    <!-- Feature list -->
    <div class="absolute bottom-10 left-16 right-16 flex flex-col gap-3">
      {#each [
        '300+ production templates, zero setup',
        'AI conversion meter on every deploy',
        'GitHub-native — your repo, your rules',
      ] as feat}
        <div class="flex items-center gap-3 font-mono text-[11px] text-[#5a6478]">
          <span class="text-[#00ff88]">✓</span>{feat}
        </div>
      {/each}
    </div>
  </div>

  <!-- ── RIGHT PANEL: form ── -->
  <div class="flex-1 flex items-center justify-center px-8 py-16">
    <div class="w-full max-w-[400px]">

      <!-- Header -->
      <div class="mb-10">
        <p class="font-mono text-[10px] text-[#00ff88] uppercase tracking-[0.3em] mb-3">// auth.signup</p>
        <h1 class="font-display text-[36px] font-extrabold tracking-[-1.5px] leading-[1.05] mb-3">
          Start building<br /><span class="text-[#00ff88]">today.</span>
        </h1>
        <p class="text-[13px] text-[#5a6478]">
          Already have an account?
          <a href="/auth/login" class="text-[#00d4ff] hover:text-[#00ff88] transition-colors no-underline font-mono text-[11px]">
            Sign in →
          </a>
        </p>
      </div>

      {#if form?.error}
        <div class="border border-[#ff4f4f]/40 bg-[#ff4f4f]/5 px-4 py-3 mb-6 font-mono text-[11px] text-[#ff4f4f] tracking-wide">
          ✕ {form.error}
        </div>
      {/if}

      <!-- OAuth -->
      <div class="flex flex-col gap-3 mb-8">
        <button
          type="button"
          onclick={() => handleOAuth('github')}
          disabled={loading}
          class="w-full flex items-center gap-3 px-5 py-[13px]
                 border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08]
                 hover:border-white/25 transition-all group cursor-pointer disabled:opacity-50"
        >
          <svg class="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57
                     0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41
                     -1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815
                     2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925
                     0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23
                     .96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65
                     .24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925
                     .435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57
                     A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span class="font-mono text-[12px] tracking-[0.08em] text-[#e8edf5] group-hover:text-white transition-colors">
            {loading && provider === 'github' ? 'Redirecting...' : 'Sign up with GitHub'}
          </span>
        </button>

        <button
          type="button"
          onclick={() => handleOAuth('google')}
          disabled={loading}
          class="w-full flex items-center gap-3 px-5 py-[13px]
                 border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08]
                 hover:border-white/25 transition-all group cursor-pointer disabled:opacity-50"
        >
          <svg class="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span class="font-mono text-[12px] tracking-[0.08em] text-[#e8edf5] group-hover:text-white transition-colors">
            {loading && provider === 'google' ? 'Redirecting...' : 'Sign up with Google'}
          </span>
        </button>
      </div>

      <!-- Divider -->
      <div class="flex items-center gap-4 mb-8">
        <div class="flex-1 h-[1px] bg-white/[0.08]"></div>
        <span class="font-mono text-[10px] text-[#3a4154] tracking-[0.2em]">OR</span>
        <div class="flex-1 h-[1px] bg-white/[0.08]"></div>
      </div>

      <!-- Email/pass form -->
      <form
        method="POST"
        action="?/signup"
        use:enhance={() => {
          loading = true
          return async ({ update }) => { await update(); loading = false }
        }}
        class="flex flex-col gap-4"
      >
        <!-- Name -->
        <div class="flex flex-col gap-2">
          <label for="name" class="font-mono text-[10px] text-[#5a6478] uppercase tracking-[0.15em]">Full Name</label>
          <input
            id="name" name="name" type="text" autocomplete="name"
            bind:value={name} placeholder="Ada Lovelace" required
            class="w-full bg-white/[0.04] border border-white/[0.08] px-4 py-3
                   font-mono text-[13px] text-[#e8edf5] placeholder:text-[#3a4154]
                   focus:outline-none focus:border-[#00ff88]/50 focus:bg-white/[0.06] transition-all"
          />
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-2">
          <label for="email" class="font-mono text-[10px] text-[#5a6478] uppercase tracking-[0.15em]">Email Address</label>
          <input
            id="email" name="email" type="email" autocomplete="email"
            bind:value={email} placeholder="you@example.com" required
            class="w-full bg-white/[0.04] border border-white/[0.08] px-4 py-3
                   font-mono text-[13px] text-[#e8edf5] placeholder:text-[#3a4154]
                   focus:outline-none focus:border-[#00ff88]/50 focus:bg-white/[0.06] transition-all"
          />
        </div>

        <!-- Password + strength -->
        <div class="flex flex-col gap-2">
          <label for="password" class="font-mono text-[10px] text-[#5a6478] uppercase tracking-[0.15em]">Password</label>
          <div class="relative">
            <input
              id="password" name="password"
              type={showPass ? 'text' : 'password'}
              autocomplete="new-password"
              bind:value={password} placeholder="Min. 8 characters" required
              class="w-full bg-white/[0.04] border border-white/[0.08] px-4 py-3 pr-12
                     font-mono text-[13px] text-[#e8edf5] placeholder:text-[#3a4154]
                     focus:outline-none focus:border-[#00ff88]/50 focus:bg-white/[0.06] transition-all"
            />
            <button
              type="button" onclick={() => showPass = !showPass}
              class="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px]
                     text-[#3a4154] hover:text-[#00ff88] transition-colors cursor-pointer"
            >{showPass ? 'HIDE' : 'SHOW'}</button>
          </div>

          <!-- Strength bar -->
          {#if password.length > 0}
            <div class="flex items-center gap-3 mt-1">
              <div class="flex gap-1 flex-1">
                {#each [1,2,3,4] as s}
                  <div
                    class="h-[3px] flex-1 transition-all duration-300"
                    style="background: {s <= strength ? strengthColor : 'rgba(255,255,255,0.08)'};"
                  ></div>
                {/each}
              </div>
              <span class="font-mono text-[9px] tracking-[0.15em]" style="color: {strengthColor};">
                {strengthLabel}
              </span>
            </div>
          {/if}
        </div>
         {#if form?.error}
           <div class="border border-[#ff4f4f]/40 bg-[#ff4f4f]/5 px-4 py-3 mb-4 font-mono text-[11px] text-[#ff4f4f]">
          ✕ {form.error}
           </div>
        {/if}
        <button
          type="submit"
          disabled={!canSubmit || loading}
          class="w-full mt-2 py-[14px] font-mono text-[12px] uppercase tracking-[0.1em] font-bold
                 bg-[#00ff88] text-black hover:brightness-110 transition-all cursor-pointer
                 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading && !provider ? 'Creating account...' : 'Create Account →'}
        </button>
      </form>

      <p class="font-mono text-[10px] text-[#3a4154] text-center mt-8 leading-relaxed">
        By signing up you agree to our
        <a href="/terms" class="text-[#5a6478] hover:text-[#00ff88] transition-colors no-underline">Terms</a>
        &amp;
        <a href="/privacy" class="text-[#5a6478] hover:text-[#00ff88] transition-colors no-underline">Privacy Policy</a>.
      </p>
    </div>
  </div>
</div>