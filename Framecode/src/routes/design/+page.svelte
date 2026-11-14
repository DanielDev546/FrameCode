
<script lang="ts">
    import DashboardLayout from "$lib/layout/DashboardLayout.svelte";
    import {
        WandSparkles,
        Globe,
        AppWindow
    } from "@lucide/svelte";

    let { data } = $props();

    let promptText = $state("");
    let selectedPlatform = $state<"App" | "Web">("App");

    function generateUI() {
        if (!promptText.trim()) return;

        // Connect your existing FrameEngine generation logic here.
        console.log({
            prompt: promptText,
            platform: selectedPlatform
        });
    }

    // One greeting per time bucket.
    const buckets = [
        { start: 7, end: 12, text: "Morning SuperDev!" },
        { start: 12, end: 16, text: "Heyy, still grinding?" },
        { start: 16, end: 20, text: "Always Active" },
        { start: 2, end: 7, text: "Night owl" }
    ];

    const lateSession = "Let's have one more session before bed";

    let greeting = $state("");

    function getGreeting(hour: number): string {
        const match = buckets.find(
            (b) => hour >= b.start && hour < b.end
        );

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
    <meta
        name="description"
        content="Describe your idea and bring your next interface to life with FrameCode."
    />
</svelte:head>

<DashboardLayout {data}>
    <main class="
        min-h-full
        flex items-center justify-center
        bg-[var(--fc-bg)]
        px-4 py-10 sm:px-5 sm:py-12
        text-[var(--fc-text)]
        transition-colors
    ">
        <div class="w-full max-w-3xl">

            <!-- Centered branding -->
            <header class="mb-10 text-center sm:mb-12">
                <div class="flex flex-col items-center justify-center">
                    <img
                        src="/favicon.svg"
                        class="mb-5 h-28 w-36 rounded-lg object-contain sm:h-30 sm:w-40"
                        alt="FrameCode Logo"
                    />

                    <p class="
                        text-lg font-medium
                        text-[var(--fc-text-secondary)]
                        sm:text-xl
                    ">
                        {greeting}
                    </p>
                </div>
            </header>

            <!-- Prompt sandbox -->
            <section class="
                mt-2 rounded-xl
                border border-[var(--fc-border)]
                bg-[var(--fc-panel)]
                p-4 sm:p-6
                shadow-[var(--fc-shadow)]
                transition-colors
            ">
                <div class="
                    mb-4 flex items-center gap-2
                    text-sm text-[var(--fc-text-secondary)]
                ">
                    <WandSparkles
                        size={17}
                        class="text-[var(--fc-accent)]"
                    />
                    <span>New design</span>
                </div>

                <textarea
                    bind:value={promptText}
                    rows="3"
                    placeholder="Describe the interface you want to create..."
                    aria-label="Describe the interface you want to create"
                    class="
                        w-full max-h-40 resize-y
                        bg-transparent
                        text-sm leading-6
                        text-[var(--fc-text)]
                        outline-none
                        placeholder:text-[var(--fc-text-subtle)]
                        sm:text-base
                    "
                ></textarea>

                <div class="
                    mt-2 flex flex-wrap items-center
                    justify-between gap-4
                    border-t border-[var(--fc-border)]
                    pt-4
                ">
                    <!-- Platform selector -->
                    <div class="flex items-center gap-2">
                        <button
                            type="button"
                            onclick={() => selectedPlatform = "App"}
                            aria-pressed={selectedPlatform === "App"}
                            class="
                                flex items-center gap-2
                                rounded-lg border
                                px-3 py-2
                                text-sm transition-colors
                                {selectedPlatform === "App"
                                    ? 'border-[var(--fc-accent)] bg-[var(--fc-accent-soft)] text-[var(--fc-accent)]'
                                    : 'border-[var(--fc-border)] text-[var(--fc-text-muted)] hover:border-[var(--fc-border-strong)] hover:text-[var(--fc-text)]'}
                            "
                        >
                            <AppWindow size={16} />
                            App
                        </button>

                        <button
                            type="button"
                            onclick={() => selectedPlatform = "Web"}
                            aria-pressed={selectedPlatform === "Web"}
                            class="
                                flex items-center gap-2
                                rounded-lg border
                                px-3 py-2
                                text-sm transition-colors
                                {selectedPlatform === "Web"
                                    ? 'border-[var(--fc-accent)] bg-[var(--fc-accent-soft)] text-[var(--fc-accent)]'
                                    : 'border-[var(--fc-border)] text-[var(--fc-text-muted)] hover:border-[var(--fc-border-strong)] hover:text-[var(--fc-text)]'}
                            "
                        >
                            <Globe size={16} />
                            Web
                        </button>
                    </div>

                    <!-- Generate button -->
                    <button
                        type="button"
                        onclick={generateUI}
                        disabled={!promptText.trim()}
                        class="
                            flex items-center gap-2
                            rounded-lg
                            bg-[var(--fc-accent)]
                            px-3 py-2
                            text-sm font-semibold
                            text-[var(--fc-on-accent)]
                            transition-colors
                            hover:opacity-90
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        Generate UI
                        <WandSparkles size={16} />
                    </button>
                </div>
            </section>

            <p class="
                mt-5 text-center text-xs
                text-[var(--fc-text-muted)]
            ">
                Powered by FrameEngine · Turn your ideas into reality.
            </p>
        </div>
    </main>
</DashboardLayout>
