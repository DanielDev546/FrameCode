<script lang="ts">
    import Sidebar from "./Sidebar.svelte";
    import Topbar from "./Topbar.svelte";

    let {
        active = "dashboard",
        data,
        children
    } = $props();
</script>

<div class="flex h-screen bg-[#070b12] text-[#e8edf5] overflow-hidden">

    <Sidebar {active} />

    <div class="flex-1 flex flex-col overflow-hidden">

     <Topbar
    active={active}
    avatar={data?.user?.avatar}
/>

        <main class="flex-1 overflow-y-auto">
            {@render children()}
        </main>

    </div>

</div>