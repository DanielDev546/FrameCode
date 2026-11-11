
<script lang="ts">
    let {
        active = "dashboard",
        mobileOpen = false,
        onClose
    } = $props();

    const nav = [
        { id: "dashboard", label: "Dashboard", href: "/dashboard" },
        { id: "templates", label: "Templates", href: "/templates" },
        { id: "ide", label: "IDE", href: "/ide" },
        { id: "meter", label: "AI Meter", href: "/meter" },
        { id: "fork", label: "ForkTools", href: "/fork" },
        { id: "design", label: "Design Hub", href: "/design" }
    ];
</script>

<aside
    class="
        fixed inset-y-0 left-0 z-50
        w-[260px]
        shrink-0
        border-r border-[var(--fc-border)]
        flex flex-col
        bg-[var(--fc-sidebar)]
        transition-[transform,background-color,border-color]
        duration-200 ease-out

        md:relative
        md:z-10
        md:w-[200px]
        md:translate-x-0
        md:transition-none

        {mobileOpen ? 'translate-x-0' : '-translate-x-full'}
    "
>
    <!-- LOGO -->
    <div
        class="
            h-[52px]
            shrink-0
            px-5
            border-b border-[var(--fc-border)]
            flex items-center justify-between
        "
    >
        <span class="font-mono text-[13px] font-bold">

            <span class="text-[var(--fc-text-muted)]">[</span>

            <span class="text-[var(--fc-accent)]">FC</span>

            <span class="text-[var(--fc-text-muted)]">]</span>

            <span class="ml-1 text-[var(--fc-text)]">
                FrameCode
            </span>

        </span>

        <!-- Mobile close -->
        <button
            type="button"
            onclick={onClose}
            aria-label="Close menu"
            class="
                md:hidden
                w-8 h-8
                flex items-center justify-center
                border border-[var(--fc-border)]
                text-[var(--fc-text-secondary)]
                hover:text-[var(--fc-accent)]
                hover:border-[var(--fc-accent)]/40
                transition-colors
            "
        >
            ×
        </button>
    </div>

    <!-- NAVIGATION -->
    <nav class="flex-1 overflow-y-auto py-6">

        <p
            class="
                px-5 mb-4
                font-mono text-[9px]
                text-[var(--fc-text-muted)]
                uppercase tracking-[0.3em]
            "
        >
            Menu
        </p>

        {#each nav as item}
            <a
                href={item.href}
                onclick={onClose}
                aria-current={active === item.id ? "page" : undefined}
                class="
                    w-full
                    text-left
                    px-5 py-[11px]
                    font-mono text-[11px]
                    tracking-wide
                    transition-colors
                    flex items-center justify-between
                    no-underline
                    border-l
                    {active === item.id
                        ? 'text-[var(--fc-text)] bg-[var(--fc-accent-soft)] border-[var(--fc-accent)]'
                        : 'text-[var(--fc-text-muted)] hover:text-[var(--fc-text-secondary)] hover:bg-[var(--fc-panel-hover)] border-transparent'}
                "
            >
                <span>
                    {item.label}
                </span>

                {#if active === item.id}
                    <span
                        class="
                            w-[4px] h-[4px]
                            rounded-full
                            bg-[var(--fc-accent)]
                        "
                    ></span>
                {/if}
            </a>
        {/each}
    </nav>

    <!-- BOTTOM -->
    <div
        class="
            shrink-0
            border-t border-[var(--fc-border)]
            py-4
        "
    >
        <a
            href="/settings"
            onclick={onClose}
            class="
                block w-full
                text-left
                px-5 py-[10px]
                font-mono text-[11px]
                text-[var(--fc-text-muted)]
                hover:text-[var(--fc-text)]
                hover:bg-[var(--fc-panel-hover)]
                transition-colors
                no-underline
            "
        >
            Settings
        </a>

        <form method="POST" action="/auth/logout">
            <button
                type="submit"
                class="
                    w-full
                    text-left
                    px-5 py-[10px]
                    font-mono text-[11px]
                    text-[var(--fc-text-muted)]
                    hover:text-[var(--fc-danger)]
                    transition-colors
                "
            >
                Sign out
            </button>
        </form>
    </div>
</aside>
