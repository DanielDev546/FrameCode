<script lang="ts">

let {
    active = "dashboard",
    avatar = null

} = $props();

</script>
  <!-- topbar -->
    <header class="shrink-0 h-[52px] border-b border-white/[0.05] flex items-center justify-between px-7">
      <p class="font-mono text-[10px] text-[#3a4154] uppercase tracking-[0.25em]">// {active}</p>
      <div class="flex items-center gap-5">
        <div class="flex items-center gap-2 font-mono text-[10px] text-[#3a4154]">
          <span class="w-[5px] h-[5px] rounded-full bg-[#00ff88]"></span>
          github · connected
        </div>
        <div class="w-[1px] h-[14px] bg-white/[0.06]"></div>
        <img
    src={avatar ?? "/default-avatar.png"}
    alt="User Avatar"
    class="w-6 h-6 rounded-full"
/>
      </div>
    </header>
