<script lang="ts">

let {
    active = "dashboard",
    avatar = "/default-avatar.png",
    onMenu
} = $props();

</script>


<header
    class="
        shrink-0
        h-[52px]

        border-b
        border-white/[0.05]

        flex
        items-center
        justify-between

        px-4
        sm:px-5
        md:px-7

        bg-[#070b12]
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
                md:hidden

                w-8
                h-8

                flex
                items-center
                justify-center

                border
                border-white/[0.06]

                text-[#5a6478]

                hover:text-[#00ff88]
                hover:border-[#00ff88]/30

                transition
            "
        >

            <span class="text-[16px] leading-none">
                ☰
            </span>

        </button>


        <!-- Page indicator -->

        <p
            class="
                font-mono
                text-[9px]
                sm:text-[10px]

                text-[#3a4154]

                uppercase
                tracking-[0.2em]
            "
        >
            // {active}
        </p>

    </div>


    <!-- RIGHT -->

    <div class="flex items-center gap-3 sm:gap-5">

        <!-- GitHub -->

        <div
            class="
                hidden
                sm:flex

                items-center
                gap-2

                font-mono
                text-[10px]
                text-[#3a4154]
            "
        >

            <span
                class="
                    w-[5px]
                    h-[5px]
                    rounded-full
                    bg-[#00ff88]
                    shadow-[0_0_6px_rgba(0,255,136,0.7)]
                "
            ></span>

            github · connected

        </div>


        <div
            class="
                hidden
                sm:block

                w-[1px]
                h-[14px]

                bg-white/[0.06]
            "
        ></div>


        <!-- Avatar -->

        <img
            src={avatar}
            alt="Avatar"
            class="
                w-7
                h-7
                sm:w-8
                sm:h-8

                rounded-full

                object-cover

                border
                border-white/[0.08]
            "
        />

    </div>

</header>