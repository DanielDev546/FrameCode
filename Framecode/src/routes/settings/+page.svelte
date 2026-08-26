<script lang="ts">
    import DashboardLayout from "$lib/layout/DashboardLayout.svelte";
    import SettingsSidebar from "$lib/components/settings/SettingsSidebar.svelte";
    import ProfileSection from "$lib/components/settings/ProfileSection.svelte";
    import AccountSection from "$lib/components/settings/AccountSection.svelte";
    import AppearanceSection from "$lib/components/settings/AppearanceSection.svelte";
    import GitHubSection from "$lib/components/settings/GitHubSection.svelte";
    import SecuritySection from "$lib/components/settings/SecuritySection.svelte";
    import DangerZone from "$lib/components/settings/DangerZone.svelte";

    let { data } = $props();
    let section = $state("profile");
</script>

<DashboardLayout active="settings" {data}>
    <div class="flex flex-col md:flex-row h-full w-full overflow-hidden">
        <SettingsSidebar active={section} onSelect={(s) => section = s} />

        <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {#if section === "profile"}
                <ProfileSection {data} />
            {:else if section === "account"}
                <AccountSection {data} />
            {:else if section === "appearance"}
                <AppearanceSection />
            {:else if section === "github"}
                <GitHubSection {data} />
            {:else if section === "security"}
                <SecuritySection />
            {:else}
                <DangerZone />
            {/if}
        </div>
    </div>
</DashboardLayout>