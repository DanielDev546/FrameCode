<script lang="ts">
    let {
        active = "profile",
        onSelect
    }: {
        active?: string;
        onSelect: (section: string) => void;
    } = $props();

    let isOpen = $state(false);

    const items = [
        { id: "profile", label: "Profile" },
        { id: "account", label: "Account" },
        { id: "appearance", label: "Appearance" },
        { id: "github", label: "GitHub" },
        { id: "security", label: "Security" },
        { id: "danger", label: "Danger Zone" }
    ];

    const currentItem = $derived(items.find((i) => i.id === active));

    function handleSelect(id: string) {
        onSelect(id);
        isOpen = false;
    }
</script>

<!-- Mobile Collapsible Selector (Hidden on md+) -->
<div class="md:hidden border-b border-white/[0.05] bg-[#07090e] p-4">
    <button
        onclick={() => isOpen = !isOpen}
        class="w-full flex items-center justify-between px-4 py-2.5 font-mono text-xs text-white bg-white/[0.03] border border-white/10 rounded-md"
    >
        <div class="flex items-center gap-2">
            <span class="text-[#3a4154]">// SETTINGS /</span>
            <span class="text-[#00ff88] font-semibold">{currentItem?.label}</span>
        </div>
        <span class="text-[#5a6478] text-xs transition-transform duration-200 {isOpen ? 'rotate-180' : ''}">
            ▼
        </span>
    </button>

    {#if isOpen}
        <div class="mt-2 bg-[#0d111a] border border-white/10 rounded-md overflow-hidden divide-y divide-white/[0.04] shadow-2xl">
            {#each items as item}
                <button
                    onclick={() => handleSelect(item.id)}
                    class="w-full flex items-center justify-between px-4 py-3 font-mono text-xs text-left transition-colors
                    {active === item.id ? 'text-[#00ff88] bg-white/[0.05]' : 'text-[#8a94a8] hover:text-white'}"
                >
                    <span>{item.label}</span>
                    {#if active === item.id}
                        <div class="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></div>
                    {/if}
                </button>
            {/each}
        </div>
    {/if}
</div>

<!-- Desktop Permanent Sidebar (Hidden on mobile) -->
<aside class="hidden md:block w-[240px] border-r border-white/[0.05] shrink-0 bg-[#07090e]">
    <div class="px-6 py-6 border-b border-white/[0.05]">
        <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-[#3a4154]">
            Settings
        </p>
    </div>

    <nav class="py-3">
        {#each items as item}
            <button
                onclick={() => onSelect(item.id)}
                class="w-full flex items-center justify-between px-6 py-3 font-mono text-[11px] transition-all
                {active === item.id
                    ? 'text-white bg-white/[0.04] border-l-2 border-[#00ff88]'
                    : 'text-[#5a6478] hover:text-white border-l-2 border-transparent'}"
            >
                {item.label}
                {#if active === item.id}
                    <div class="w-[4px] h-[4px] rounded-full bg-[#00ff88]"></div>
                {/if}
            </button>
        {/each}
    </nav>
</aside>