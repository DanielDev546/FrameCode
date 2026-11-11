
<script lang="ts">
    import Sidebar from "./Sidebar.svelte";
    import Topbar from "./Topbar.svelte";

    let {
        active = "dashboard",
        data,
        children
    } = $props();

    let mobileMenuOpen = $state(false);

    function closeMobileMenu() {
        mobileMenuOpen = false;
    }
</script>

<div class="fc-app flex h-screen overflow-hidden">
    {#if mobileMenuOpen}
        <button
            type="button"
            aria-label="Close navigation"
            onclick={closeMobileMenu}
            class="fixed inset-0 z-40 bg-[var(--fc-overlay)] backdrop-blur-[2px] md:hidden"
        ></button>
    {/if}

    <Sidebar
        {active}
        mobileOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
    />

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--fc-bg)]">
        <Topbar
            {active}
            avatar={data?.user?.avatar}
            onMenu={() => mobileMenuOpen = true}
        />

        <main class="min-h-0 flex-1 overflow-y-auto">
            {@render children()}
        </main>
    </div>
</div>
