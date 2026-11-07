
<script lang="ts">

  import DashboardLayout from "$lib/layout/DashboardLayout.svelte";

    let { data } = $props();

  import { Sparkles, WandSparkles, Globe, AppWindow } from '@lucide/svelte';

  let promptText = $state('');
  let selectedPlatform = $state<'App' | 'Web'>('App');

  function generateUI() {
    if (!promptText.trim()) return;

    // Connect your existing FrameEngine generation logic here.
    console.log({
      prompt: promptText,
      platform: selectedPlatform
    });
  }
  // one greeting per bucket, no randomness
// one greeting per bucket, no randomness
const buckets = [
  { start: 7,  end: 12, text: 'Morning SuperDev!' },
  { start: 12, end: 16, text: 'Heyy, still grinding?' },
  { start: 16, end: 20, text: 'Always Active' },
  { start: 2,  end: 7,  text: 'Night owl' }
];

// 20:00 to 01:59 wraps past midnight, so it's whatever the buckets don't match
const lateSession = 'Let’s have one more session before bed';

let greeting = $state('');

function getGreeting(hour: number): string {
  const match = buckets.find((b) => hour >= b.start && hour < b.end);
  return match ? match.text : lateSession;
}

  $effect(() => {
    greeting = getGreeting(new Date().getHours());

    const id = setInterval(() => {
      greeting = getGreeting(new Date().getHours());
    }, 60_000);

    return () => clearInterval(id);
  });
</script>



<svelte:head>
 <img src="favicon.svg" class="w-26 h-26" alt="FrameCode Logo" />
  <meta
    name="description"
    content="Describe your idea and bring your next interface to life with FrameCode."
  />
</svelte:head>

<DashboardLayout {data}>
<main class="min-h-screen bg-[#070b12] text-[#e8edf5] flex items-center justify-center px-5 py-12">
  <div class="w-full max-w-3xl">

    <!-- Centered branding -->
    <header class="mb-12 text-center">
      <div class="mb-5 flex flex-col items-center justify-center gap-">
       <img src="/favicon.svg" class="w-40 h-30 rounded-lg" alt="FrameCode Logo" />

      



      <p class="text-xl font-medium text-slate-300">
        {greeting}
      </p>
      </div>

     

     
    </header>

    <!-- Prompt sandbox -->
    <section class=" mt-2 rounded-xl border border-slate-800 bg-[#0c0f15] p-4 shadow-2xl sm:p-6">
      <div class="mb-4 flex items-center gap-2 text-sm text-slate-300">
        <WandSparkles size={17} class="text-[#00ff88]" />
        <span>New design</span>
      </div>

      <textarea
        bind:value={promptText}
        rows="3"
        placeholder="Describe the interface you want to create..."
        class="w-full resize-y bg-transparent text-sm leading-5 max-h-40 text-white outline-none placeholder:text-slate-600 sm:text-base"
      ></textarea>

      <div class="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-4">
        <div class="flex items-center gap-2">
          <button
            onclick={() => selectedPlatform = 'App'}
            class={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${
              selectedPlatform === 'App'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-[#00ff88]'
                : 'border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <AppWindow size={16} />
            App
          </button> 

          <button
            onclick={() => selectedPlatform = 'Web'}
            class={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
              selectedPlatform === 'Web'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-[#00ff88]'
                : 'border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Globe size={16} />
            Web
          </button>
        </div>

        <button
          onclick={generateUI}
          disabled={!promptText.trim()}
          class="flex items-center gap-2 rounded-lg bg-[#00ff88] px-3 py-1.5 text-sm font-semibold text-[#07110c] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Generate UI
          <WandSparkles size={16} />
        </button>
      </div>
    </section>

    <p class="mt-5 text-center text-xs text-slate-600">
      Powered by FrameEngine · Turn your ideas into reality.
    </p>

  </div>
</main>

</DashboardLayout>