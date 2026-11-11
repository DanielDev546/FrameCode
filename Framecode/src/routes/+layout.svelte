
<script lang="ts">
    import { onMount, setContext } from 'svelte';
    import '../app.css';

    import LoadingScreen from '$lib/LoadingScreen.svelte';

    interface Props {
        children: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    type Theme = 'dark' | 'light';

    interface ThemeContext {
        get theme(): Theme;
        setTheme: (nextTheme: Theme) => void;
        toggleTheme: () => void;
    }

    // ---------------- THEME ----------------

    let theme = $state<Theme>('dark');

    function setTheme(nextTheme: Theme) {
        theme = nextTheme;

        document.documentElement.dataset.theme = nextTheme;

        localStorage.setItem('framecode-theme', nextTheme);
    }

    function toggleTheme() {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }

    // Make theme accessible to child components
    setContext<ThemeContext>('framecode-theme', {
        get theme() {
            return theme;
        },
        setTheme,
        toggleTheme
    });

    // ---------------- LOADING ----------------

    let loading = $state(true);

    onMount(() => {
        const savedTheme = localStorage.getItem('framecode-theme');

        const systemTheme = window.matchMedia(
            '(prefers-color-scheme: light)'
        ).matches ? 'light' : 'dark';

        const initialTheme: Theme =
            savedTheme === 'light' || savedTheme === 'dark'
                ? savedTheme
                : systemTheme;

        setTheme(initialTheme);

        const timer = setTimeout(() => {
            loading = false;
        }, 2500);

        return () => clearTimeout(timer);
    });
</script>

<!-- Loading Screen -->
<LoadingScreen visible={loading} />

{#if !loading}
    <div class="fc-app font-sans relative">

        <!-- Grid background -->
        <div
            class="fixed inset-0 pointer-events-none z-0"
            style="
                background-image:
                    linear-gradient(
                        color-mix(in srgb, var(--fc-text) 3%, transparent)
                        1px, transparent 1px
                    ),
                    linear-gradient(
                        color-mix(in srgb, var(--fc-accent) 3%, transparent)
                        1px, transparent 1px
                    );
                background-size: 40px 40px;
            "
        ></div>

        <!-- Scanlines -->
        <div
            class="fixed inset-0 pointer-events-none z-0 opacity-30"
            style="
                background: repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    color-mix(in srgb, var(--fc-text) 3%, transparent) 2px,
                    color-mix(in srgb, var(--fc-text) 3%, transparent) 4px
                );
            "
        ></div>

        <!-- PAGE CONTENT -->
        <main class="relative z-10">
            {@render children()}
        </main>

        <!-- FOOTER -->
        <footer class="relative z-10 border-t border-[var(--fc-border)] mt-20">
            <div class="max-w-[1100px] mx-auto px-8 py-7 flex flex-wrap items-center justify-between gap-4">

                <span class="font-mono text-[12px] text-[var(--fc-text-muted)]">
                    © 2026
                    <span class="text-[var(--fc-accent)]">FrameCode</span>
                    — Built for engineers.
                </span>

                <div class="flex items-center gap-5">

                    {#each ['Privacy', 'Terms', 'Status', 'Twitter', 'GitHub'] as item}
                        <a
                            href="/"
                            class="font-mono text-[10px] uppercase tracking-[0.08em]
                            text-[var(--fc-text-muted)] hover:text-[var(--fc-accent)]
                            transition-colors no-underline"
                        >
                            {item}
                        </a>
                    {/each}

                    <!-- Theme Toggle -->
                    <button
                        type="button"
                        onclick={toggleTheme}
                        aria-label="Switch color theme"
                        class="font-mono text-[11px] px-3 py-2
                        border border-[var(--fc-border)]
                        text-[var(--fc-text-secondary)]
                        hover:border-[var(--fc-accent)]
                        hover:text-[var(--fc-accent)]
                        transition-colors cursor-pointer"
                    >
                        {theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}
                    </button>

                </div>
            </div>
        </footer>
    </div>
{/if}
