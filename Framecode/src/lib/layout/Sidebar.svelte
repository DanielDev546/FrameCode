
<script lang="ts">

let { active = "dashboard" } = $props();

const nav = [

{ id:"dashboard", label:"Dashboard", href:"/dashboard" },

{ id:"templates", label:"Templates", href:"/templates" },

{ id:"ide", label:"IDE", href:"/ide" },

{ id:"meter", label:"AI Meter", href:"/meter" },

{ id:"fork", label:"ForkTools", href:"/fork" },

{ id:"design", label:"Design Hub", href:"/design" }

];

</script>
  <aside class="relative z-10 w-[200px] shrink-0 border-r border-white/[0.05] flex flex-col bg-[#070b12]">

    <!-- logo -->
    <div class="px-5 py-5 border-b border-white/[0.05]">
      <span class="font-mono text-[13px] font-bold">
        <span class="text-[#3a4154]">[</span><span class="text-[#00ff88]">FC</span><span class="text-[#3a4154]">]</span>
        <span class="text-[#e8edf5] ml-1">FrameCode</span>
      </span>
    </div>

  <nav class="flex-1 py-6 flex flex-col">
  <p class="font-mono text-[9px] text-[#3a4154] uppercase tracking-[0.3em] px-5 mb-4">
    Menu
  </p>

  {#each nav as item}
    <a
      href={item.href}
      class="w-full text-left px-5 py-[9px]
             font-mono text-[11px]
             tracking-wide
             transition-all
             flex items-center justify-between
             no-underline
             {active === item.id
               ? 'text-[#e8edf5] bg-white/[0.04] border-l border-[#00ff88]'
               : 'text-[#3a4154] hover:text-[#5a6478] border-l border-transparent'}"
    >
      {item.label}

      {#if active === item.id}
        <span class="w-[3px] h-[3px] rounded-full bg-[#00ff88]"></span>
      {/if}
    </a>
  {/each}
</nav>
    <!-- bottom -->
    <div class="border-t border-white/[0.05] py-4">
     <a
    href="/settings"
    class="w-full text-left px-5 py-[9px]
           font-mono text-[11px]
           text-[#3a4154]
           hover:text-[#5a6478]
           transition-colors
           no-underline block"
>
    Settings
</a>

      <form method="POST" action="/auth/logout">
        <button
         type="submit" 
          class="w-full text-left px-5 py-[9px] font-mono text-[11px] text-[#3a4154] hover:text-[#ff4f4f] transition-colors">
           Sign out
        </button>
      </form>
    
    </div>
  </aside>
