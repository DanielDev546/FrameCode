
<script lang="ts">
    import { onMount } from "svelte";

    let {
        active = "dashboard",
        avatar = "/default-avatar.png",
        onMenu
    } = $props();

    let theme = $state<"dark" | "light">("dark");

    onMount(() => {
        const savedTheme = localStorage.getItem("fc-theme");

        const initialTheme =
            savedTheme === "light" || savedTheme === "dark"
                ? savedTheme
                : document.documentElement.getAttribute("data-theme") === "light"
                    ? "light"
                    : "dark";

        theme = initialTheme;
        document.documentElement.setAttribute("data-theme", theme);
    });

    function toggleTheme() {
        theme = theme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("fc-theme", theme);
    }
</script>

<header
    class="
        shrink-0 h-[52px]
        border-b border-[var(--fc-border)]
        flex items-center justify-between
        px-4 sm:px-5 md:px-7
        bg-[var(--fc-bg)]
        transition-colors
    "
>
    <!-- LEFT -->
    <div class="flex items-center gap-3">
        <!-- Mobile menu -->
        <button
            type="button"
            onclick={onMenu}
            aria-label="Open navigation"
            class="
                md:hidden w-8 h-8
                flex items-center justify-center
                border border-[var(--fc-border)]
                text-[var(--fc-text-secondary)]
                hover:text-[var(--fc-accent)]
                hover:border-[var(--fc-accent)]
                transition-colors
            "
        >
            <span class="text-[16px] leading-none">☰</span>
        </button>

        <!-- Page indicator -->
        <p class="
            font-mono text-[9px] sm:text-[10px]
            text-[var(--fc-text-muted)]
            uppercase tracking-[0.2em]
        ">
            // {active}
        </p>
    </div>

    <!-- RIGHT -->
    <div class="flex items-center gap-3 sm:gap-5">
        <!-- GitHub -->
        <div class="
            hidden sm:flex items-center gap-2
            font-mono text-[10px]
            text-[var(--fc-text-muted)]
        ">
            <span class="
                w-[5px] h-[5px] rounded-full
                bg-[var(--fc-success)]
            "></span>

            github · connected
        </div>

        <!-- Divider -->
        <div class="
            hidden sm:block
            w-[1px] h-[14px]
            bg-[var(--fc-border)]
        "></div>

        <!-- Theme Toggle -->
        <button
            type="button"
            onclick={toggleTheme}
            aria-label="Switch color theme"
            class="
                font-mono text-[10px] sm:text-[11px]
                px-2 sm:px-3 py-2
                border border-[var(--fc-border)]
                text-[var(--fc-text-secondary)]
                hover:border-[var(--fc-accent)]
                hover:text-[var(--fc-accent)]
                transition-colors
            "
        >
            {theme === "dark" ? "☀ LIGHT" : "☾ DARK"}
        </button>

        <!-- Avatar -->
        <img
            src={avatar}
            alt="Avatar"
            class="
                w-7 h-7 sm:w-8 sm:h-8
                rounded-full object-cover
                border border-[var(--fc-border)]
                bg-[var(--fc-panel)]
            "
        />
    </div>
</header>
