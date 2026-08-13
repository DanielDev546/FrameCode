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
        border-r border-white/[0.05]
        flex flex-col
        bg-[#070b12]

        transform transition-transform duration-200 ease-out

        md:relative
        md:z-10
        md:w-[200px]
        md:translate-x-0
        md:transition-none

        {mobileOpen ? 'translate-x-0' : '-translate-x-full'}
    "
>

    <!-- LOGO -->

    <div class="
        h-[52px]
        shrink-0
        px-5
        border-b border-white/[0.05]
        flex items-center
        justify-between
    ">

        <span class="font-mono text-[13px] font-bold">

            <span class="text-[#3a4154]">[</span>

            <span class="text-[#00ff88]">FC</span>

            <span class="text-[#3a4154]">]</span>

            <span class="text-[#e8edf5] ml-1">
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
                border border-white/[0.06]
                text-[#5a6478]
                hover:text-[#00ff88]
                hover:border-[#00ff88]/30
                transition
            "
        >
            ×
        </button>

    </div>


    <!-- NAVIGATION -->

    <nav class="flex-1 py-6 overflow-y-auto">

        <p class="
            font-mono
            text-[9px]
            text-[#3a4154]
            uppercase
            tracking-[0.3em]
            px-5
            mb-4
        ">
            Menu
        </p>


        {#each nav as item}

            <a
                href={item.href}
                onclick={onClose}
                class="
                    w-full
                    text-left
                    px-5
                    py-[11px]

                    font-mono
                    text-[11px]
                    tracking-wide

                    transition-all

                    flex
                    items-center
                    justify-between

                    no-underline

                    {active === item.id
                        ? 'text-[#e8edf5] bg-white/[0.04] border-l border-[#00ff88]'
                        : 'text-[#3a4154] hover:text-[#5a6478] border-l border-transparent'}
                "
            >

                <span>
                    {item.label}
                </span>

                {#if active === item.id}

                    <span
                        class="
                            w-[4px]
                            h-[4px]
                            rounded-full
                            bg-[#00ff88]
                            shadow-[0_0_8px_rgba(0,255,136,0.6)]
                        "
                    ></span>

                {/if}

            </a>

        {/each}

    </nav>


    <!-- BOTTOM -->

    <div class="
        shrink-0
        border-t
        border-white/[0.05]
        py-4
    ">

        <a
            href="/settings"
            onclick={onClose}
            class="
                block
                w-full
                text-left
                px-5
                py-[10px]

                font-mono
                text-[11px]

                text-[#3a4154]
                hover:text-[#5a6478]

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
                    px-5
                    py-[10px]

                    font-mono
                    text-[11px]

                    text-[#3a4154]
                    hover:text-[#ff4f4f]

                    transition-colors
                "
            >
                Sign out
            </button>

        </form>

    </div>

</aside>