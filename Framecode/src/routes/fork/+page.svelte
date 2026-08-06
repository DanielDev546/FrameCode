<script lang="ts">
	import DashboardLayout from "$lib/layout/DashboardLayout.svelte";

	const tools = [
		{
			id: 1,
			name: "GitHub Import",
			description: "Clone any public repository into FrameCode.",
			status: "Ready",
			icon: "↗"
		},
		{
			id: 2,
			name: "Template Fork",
			description: "Duplicate a community template instantly.",
			status: "Ready",
			icon: "⎇"
		},
		{
			id: 3,
			name: "AI Refactor",
			description: "Improve existing code using FrameCode AI.",
			status: "Beta",
			icon: "✦"
		},
		{
			id: 4,
			name: "Dependency Scanner",
			description: "Analyze outdated packages.",
			status: "Coming Soon",
			icon: "⬢"
		},
		{
			id: 5,
			name: "Project Export",
			description: "Download your project as ZIP.",
			status: "Ready",
			icon: "↓"
		},
		{
			id: 6,
			name: "Framework Detector",
			description: "Detect React, Svelte, Vue, Next, Astro automatically.",
			status: "Ready",
			icon: "{}"
		}
	];
</script>

<DashboardLayout active="fork">

<main class="flex-1 overflow-y-auto">

	<!-- Header -->

	<section class="border-b border-white/[0.05]">

		<div class="max-w-7xl mx-auto px-8 py-7">

			

			<h2 class="mt-3 p-4 text-2xl font-bold">
				Developer Toolkit
			</h2>

			<p class="mb-4  text-[#5a6478] max-w-xl">
				Clone repositories, fork templates, scan projects and automate your workflow.
			</p>

		</div>

	</section>

	<!-- Stats -->

	<section class="max-w-7xl mx-auto px-8 py-8">

		<div class="grid grid-cols-4 gap-5">

			<div class="border border-white/[0.05] p-6">
				<p class="text-[#3a4154] font-mono text-[11px] uppercase">Repositories</p>
				<h2 class="text-4xl mt-2 font-bold">18</h2>
			</div>

			<div class="border border-white/[0.05] p-6">
				<p class="text-[#3a4154] font-mono text-[11px] uppercase">Forks</p>
				<h2 class="text-4xl mt-2 font-bold">9</h2>
			</div>

			<div class="border border-white/[0.05] p-6">
				<p class="text-[#3a4154] font-mono text-[11px] uppercase">AI Actions</p>
				<h2 class="text-4xl mt-2 font-bold">214</h2>
			</div>

			<div class="border border-white/[0.05] p-6">
				<p class="text-[#3a4154] font-mono text-[11px] uppercase">Exports</p>
				<h2 class="text-4xl mt-2 font-bold">41</h2>
			</div>

		</div>

	</section>

	<!-- Tool Cards -->

	<section class="max-w-7xl mx-auto px-8 pb-20">

		<div class="grid grid-cols-3 gap-6">

			{#each tools as tool}

				<div
					class="group border border-white/[0.05] hover:border-[#00ff88]/30 transition rounded-xl p-6 bg-[#090d15]"
				>

					<div class="flex items-center justify-between">

						<div class="text-3xl text-[#00ff88]">
							{tool.icon}
						</div>

						<span class="text-[10px] font-mono uppercase text-[#3a4154]">
							{tool.status}
						</span>

					</div>

					<h3 class="mt-6 text-xl font-semibold">
						{tool.name}
					</h3>

					<p class="mt-2 text-[#5a6478] text-sm leading-6">
						{tool.description}
					</p>

					<button
						class="mt-8 border border-[#00ff88]/20 px-4 py-2
						font-mono text-[11px] uppercase
						text-[#00ff88]
						hover:bg-[#00ff88]
						hover:text-black
						transition
						cursor:bind:pointer"
					>
						Launch →
					</button>

				</div>

			{/each}

		</div>

	</section>

</main>

</DashboardLayout>