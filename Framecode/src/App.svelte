<script lang="ts">
	/* Svelte 5 Runes */
	let scrolled = $state(false);

	if (typeof window !== 'undefined') {
		window.onscroll = () => {
			scrolled = window.scrollY > 20;
		};
	}
</script>

<div class="min-h-screen bg-white font-sans text-[#18181b] selection:bg-[#6366f1]/30">
	
	<div class="fixed inset-0 z-0 opacity-[0.03]" 
		style="background-image: radial-gradient(#000000 2px, transparent 2px); background-size: 40px 40px;">
	</div>

	<nav class="fixed top-0 z-50 w-full border-b border-black/5 transition-all duration-300 {scrolled ? 'bg-white/80 backdrop-blur-md' : 'bg-transparent'}">
		<div class="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
			<div class="flex items-center gap-2">
				<div class="h-8 w-8 rounded bg-gradient-to-br from-[#6366f1] to-[#a855f7]"></div>
				<span class="text-xl font-bold tracking-tight">FrameCode</span>
			</div>
			
			<div class="hidden items-center gap-8 text-sm font-medium text-[#a1a1aa] md:flex">
				<a href="#features" class="hover:text-black">Features</a>
				<a href="#templates" class="hover:text-black">Templates</a>
				<a href="#pricing" class="hover:text-black">Pricing</a>
				<button class="rounded-lg bg-[#6366f1] px-5 py-2 text-white hover:bg-[#4f46e5] transition-colors">
					Sign Up
				</button>
			</div>
		</div>
	</nav>

	<div class="relative z-10 flex pt-16">
		
		<aside class="hidden w-[280px] shrink-0 border-r border-black/5 bg-[#fbfbfb] p-6 lg:block min-h-[calc(100vh-4rem)]">
			<div class="space-y-6">
				<div class="text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa]">RECENTLY USED TEMPLATES</div>
				<div class="grid grid-cols-2 gap-3">
					{#each Array(6) as _}
					
						<div class="aspect-square rounded border border-black/5 bg-gray-800 shadow-sm transition-transform hover:scale-95"></div>
					{/each}
				</div>
				<div class="h-px w-full bg-black/5"></div>
				<div class="space-y-3">
					<div class="h-8 w-full rounded border border-black/5 bg-white"></div>
					<div class="h-8 w-full rounded border border-black/5 bg-white"></div>
				</div>
			</div>
		</aside>

		<main class="flex-1 px-8 py-16 lg:px-20">
			<div class="mx-auto max-w-4xl text-center">
				<div class="mb-8 inline-flex items-center gap-2 rounded-full border border-[#6366f1]/10 bg-[#6366f1]/5 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6366f1]">
					v2.0 PRODUCTION READY
				</div>

				<h1 class="text-5xl font-inter font-bold tracking-tight text-[#18181b] md:text-7xl">
					Build production-ready landing pages in 
					<span class="text-[#6366f1]">minutes,</span> 
					not hours.
				</h1>

				<p class="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#71717a]">
					The visual IDE for developers. FrameCode bridges the gap between high-fidelity design 
					and clean, production-grade Tailwind CSS code.
				</p>

				<div class="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<button class="w-full rounded-xl bg-[#6366f1] px-10 py-5 text-sm font-bold text-white shadow-xl shadow-[#6366f1]/20 hover:bg-[#4f46e5] sm:w-auto">
						Start Building For Free
					</button>
					<button class="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-10 py-5 text-sm font-bold hover:bg-gray-50 sm:w-auto">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
						Watch Demo
					</button> 
				</div>
<div class="relative mt-20 rounded-2xl border border-black/5 bg-[#f4f4f5]/50 p-3 shadow-2xl">
    <div class="relative aspect-[16/10] overflow-hidden rounded-xl border border-black/10 bg-white">
        
        <div class="absolute inset-0 bg-[url('/static/frame.png')] bg-cover bg-center bg-no-repeat">
            
            <div class="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/10"></div>

            <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center opacity-10">
                    <div class="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-dashed border-black"></div>
                    <div class="font-mono text-sm font-bold uppercase tracking-widest text-black">Visual Canvas Interface</div>
                </div>
            </div>
            
        </div>
    </div>
</div>
		</main>
	</div>
</div>