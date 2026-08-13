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

<div class="flex h-screen bg-[#070b12] text-[#e8edf5] overflow-hidden">

    <!-- Mobile backdrop -->
    {#if mobileMenuOpen}
        <button
            type="button"
            aria-label="Close navigation"
            onclick={closeMobileMenu}
            class="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] md:hidden"
        ></button>
    {/if}

    <!-- Sidebar -->
    <Sidebar
        {active}
        mobileOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
    />

    <!-- Main application -->
    <div class="flex-1 min-w-0 flex flex-col overflow-hidden">

        <Topbar
            {active}
            avatar={data?.user?.avatar}
            onMenu={() => mobileMenuOpen = true}
        />

        <main class="flex-1 min-h-0 overflow-y-auto">
            {@render children()}
        </main>

    </div>

</div>