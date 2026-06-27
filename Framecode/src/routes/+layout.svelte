<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';



	import LoadingScreen from '$lib/LoadingScreen.svelte';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	/* ---------------- LOADING ---------------- */

	let loading = $state(true);

	onMount(() => {
		setTimeout(() => {
			loading = false;
		}, 2500);
	});

	/* ---------------- MOBILE MENU ---------------- */

	let mobileMenuOpen = $state(false);

	const navLinks = [
		{ href: '/templates', label: 'Templates' },
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/forktools', label: 'ForkTools' },
		{ href: '/docs', label: 'Docs' },
		{ href: 'https://github.com', label: 'GitHub', external: true },
	];
</script>

<!-- Loading Screen -->
<LoadingScreen visible={loading} />

{#if !loading}
<div class="min-h-screen bg-[#070b12] text-[#e8edf5] font-sans relative">

	<!-- Grid background -->
	<div
		class="fixed inset-0 pointer-events-none z-0"
		style="
			background-image:
				linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
				linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px);
			background-size: 40px 40px;
		"
	></div>

	<!-- Scanlines -->
	<div
		class="fixed inset-0 pointer-events-none z-0 opacity-40"
		style="
			background: repeating-linear-gradient(
				0deg,
				transparent,
				transparent 2px,
				rgba(0,0,0,0.08) 2px,
				rgba(0,0,0,0.08) 4px
			);
		"
	></div>

	<!-- NAV -->
	<nav class="relative z-10 border-b border-white/[0.08]">
		<div class="max-w-[1100px] mx-auto px-8 flex items-center justify-between py-[22px]">

			<!-- Logo -->
			<a href="/" class="flex items-center gap-2 no-underline">
				<span class="font-mono text-[18px] font-bold tracking-tight text-[#00ff88]">
					<span class="text-[#5a6478]">[</span>FC<span class="text-[#5a6478]">]</span>
					FrameCode
					<span
						class="inline-block w-[10px] h-[16px] bg-[#00ff88] ml-[2px] align-middle animate-[blink_1.1s_step-end_infinite]"
					></span>
				</span>
			</a>

			<!-- Desktop nav -->
			<div class="hidden md:flex items-center gap-7">
				{#each navLinks as link}
					<a
						href={link.href}
						target={link.external ? '_blank' : undefined}
						rel={link.external ? 'noopener noreferrer' : undefined}
						class="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a6478] hover:text-[#00ff88] transition-colors no-underline"
					>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- CTA -->
			<div class="hidden md:flex items-center gap-3">
			<a href="/auth/signup" class="content">
				<button
					class="font-mono text-[11px] uppercase tracking-[0.08em] px-4 py-[6px]
					border border-[#00ff88] text-[#00ff88] bg-[rgba(0,255,136,0.08)]
					hover:bg-[#00ff88] hover:text-black transition-all cursor-pointer"
				>
					Start Free →
				</button>
				</a>
			</div>

			<!-- Mobile hamburger -->
			<button
				class="md:hidden font-mono text-[#5a6478] hover:text-[#00ff88] transition-colors"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label="Toggle menu"
			>
				{mobileMenuOpen ? '✕' : '☰'}
			</button>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden border-t border-white/[0.08] bg-[#0d1420] px-8 py-6 flex flex-col gap-5">
				{#each navLinks as link}
					<a
						href={link.href}
						class="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a6478] hover:text-[#00ff88] transition-colors no-underline"
						onclick={() => (mobileMenuOpen = false)}
					>
						{link.label}
					</a>
				{/each}

				<button
					class="font-mono text-[11px] uppercase tracking-[0.08em] px-4 py-[6px] mt-2
					border border-[#00ff88] text-[#00ff88] bg-[rgba(0,255,136,0.08)]
					hover:bg-[#00ff88] hover:text-black transition-all w-fit cursor-pointer"
				>
					Start Free →
				</button>
			</div>
		{/if}
	</nav>

	<!-- PAGE CONTENT -->
	<main class="relative z-10">
		{@render children()}
	</main>

	<!-- FOOTER -->
	<footer class="relative z-10 border-t border-white/[0.08] mt-20">
		<div class="max-w-[1100px] mx-auto px-8 py-7 flex flex-wrap items-center justify-between gap-3">
			<span class="font-mono text-[12px] text-[#5a6478]">
				© 2026 <span class="text-[#00ff88]">FrameCode</span> — Built for engineers.
			</span>

			<div class="flex gap-5">
				{#each ['Privacy', 'Terms', 'Status', 'Twitter', 'GitHub'] as item}
					<a
						href="/"
						class="font-mono text-[10px] uppercase tracking-[0.08em] text-[#3a4154] hover:text-[#00ff88] transition-colors no-underline"
					>
						{item}
					</a>
				{/each}
			</div>
		</div>
	</footer>
</div>
{/if}