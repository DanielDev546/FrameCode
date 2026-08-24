<script lang="ts">
	import DashboardLayout from "$lib/layout/DashboardLayout.svelte";

	type Project = {
		id: string;
		name: string;
		repoUrl?: string | null;
	};

	type Analysis = {
		score: number;
		summary: string;
		strengths: string[];
		improvements: string[];
		entryFile?: string;
	};

	let { data } = $props();

	let selectedProjectId = $state(data.projects[0]?.id ?? "");
	let running = $state(false);
	let runError = $state("");
	let result = $state<Analysis | null>(null);

	let displayScore = $state(0);
	let scanLines = $state<string[]>([]);

	let selectedProject = $derived(
		data.projects.find((p: Project) => p.id === selectedProjectId)
	);

	const SCAN_STEPS = [
		"Connecting to repository...",
		"Reading file tree...",
		"Locating entry file...",
		"Sending to Gemini for analysis...",
		"Scoring conversion signals..."
	];

	function animateScore(target: number) {
		displayScore = 0;
		const duration = 900;
		const start = performance.now();

		function tick(now: number) {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			displayScore = Math.round(eased * target);

			if (progress < 1) requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
	}

	async function runScanSequence() {
		scanLines = [];
		for (const step of SCAN_STEPS) {
			scanLines = [...scanLines, step];
			await new Promise((r) => setTimeout(r, 450 + Math.random() * 350));
		}
	}

	async function runAnalysis() {
		if (!selectedProjectId) return;

		running = true;
		runError = "";
		result = null;
		displayScore = 0;

		const scanPromise = runScanSequence();

		try {
			const [res] = await Promise.all([
				fetch("/api/meter/run", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ projectId: selectedProjectId })
				}),
				scanPromise
			]);

			if (!res.ok) throw new Error(await res.text());

			const analysis = await res.json();
			result = analysis;
			animateScore(analysis.score);
		} catch (e) {
			console.error("Meter run failed", e);
			runError = e instanceof Error ? e.message : "Analysis failed.";
		} finally {
			running = false;
		}
	}

	function scoreColor(score: number) {
		if (score >= 75) return "#00ff88";
		if (score >= 50) return "#ffb340";
		return "#ff4f4f";
	}

	const RADIUS = 70;
	const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

	let dashOffset = $derived(
		CIRCUMFERENCE - (displayScore / 100) * CIRCUMFERENCE
	);
</script>

<DashboardLayout active="meter" {data}>

	<div class="p-8">

		<div class="mb-8">
			<p class="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a4154]">
				// AI METER
			</p>

			<h1 class="text-[30px] font-bold text-[#e8edf5]">
				Conversion Meter
			</h1>

			<p class="mt-2 text-[#5a6478]">
				Get an AI-powered conversion optimization score for your projects.
			</p>
		</div>

		<!-- Project selector -->
		<div class="max-w-2xl rounded-sm border border-white/[0.05] bg-[#0b1018] p-6">

			<p class="font-mono text-[10px] uppercase tracking-[0.18em] text-[#3a4154]">
				Select Project
			</p>

			<div class="mt-4 flex gap-3">

				<select
					bind:value={selectedProjectId}
					disabled={running}
					class="flex-1 border border-white/[0.08] bg-[#070b12] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#00ff88]/40 disabled:opacity-50"
				>
					{#each data.projects as project}
						<option value={project.id}>
							{project.name}{!project.repoUrl ? " (no GitHub repo)" : ""}
						</option>
					{/each}
				</select>

				<button
					onclick={runAnalysis}
					disabled={running || !selectedProjectId || !selectedProject?.repoUrl}
					class="relative overflow-hidden border border-[#00ff88]/20 bg-[#00ff88]/5 px-5 py-2 font-mono text-[11px] uppercase text-[#00ff88] transition hover:bg-[#00ff88] hover:text-black disabled:opacity-40"
				>
					{#if running}
						<span class="inline-block animate-pulse">Scanning...</span>
					{:else}
						Run
					{/if}
				</button>

			</div>

			{#if selectedProject && !selectedProject.repoUrl}
				<p class="mt-3 text-xs text-yellow-400">
					This project has no linked GitHub repo, so it can't be analyzed yet.
				</p>
			{/if}

			{#if runError}
				<p class="mt-3 text-xs text-red-400">
					{runError}
				</p>
			{/if}

		</div>

		<!-- Scanning terminal -->
		{#if running}

			<div class="mt-6 max-w-2xl rounded-sm border border-[#00ff88]/10 bg-[#050810] p-5 font-mono text-[12px]">

				{#each scanLines as line, i}
					<div
						class="leading-[1.9] text-[#5a6478]"
						style="animation: fadeIn 0.3s ease-out;"
					>
						<span class="text-[#00ff88]">❯</span>
						{line}
						{#if i === scanLines.length - 1}
							<span class="ml-1 inline-block h-3 w-1.5 animate-pulse bg-[#00ff88] align-middle"></span>
						{:else}
							<span class="ml-1 text-[#00ff88]">✓</span>
						{/if}
					</div>
				{/each}

			</div>

		{/if}

		<!-- Result -->
		{#if result}

			<div
				class="mt-6 max-w-2xl rounded-sm border border-white/[0.05] bg-[#0b1018] p-6"
				style="animation: fadeUp 0.5s ease-out;"
			>

				<div class="flex items-center gap-8">

					<!-- Gauge -->
					<div class="relative h-[160px] w-[160px] shrink-0">

						<svg viewBox="0 0 160 160" class="h-full w-full -rotate-90">

							<circle
								cx="80"
								cy="80"
								r={RADIUS}
								fill="none"
								stroke="rgba(255,255,255,0.05)"
								stroke-width="10"
							/>

							<circle
								cx="80"
								cy="80"
								r={RADIUS}
								fill="none"
								stroke={scoreColor(result.score)}
								stroke-width="10"
								stroke-linecap="round"
								stroke-dasharray={CIRCUMFERENCE}
								stroke-dashoffset={dashOffset}
								style="transition: stroke-dashoffset 0.1s linear;"
							/>

						</svg>

						<div class="absolute inset-0 flex flex-col items-center justify-center">
							<span
								class="text-[38px] font-bold"
								style="color: {scoreColor(result.score)}"
							>
								{displayScore}
							</span>
							<span class="font-mono text-[9px] uppercase tracking-[0.15em] text-[#3a4154]">
								/ 100
							</span>
						</div>

					</div>

					<div class="flex-1">

						<div class="flex items-center justify-between">
							<p class="font-mono text-[10px] uppercase tracking-[0.18em] text-[#3a4154]">
								Analysis
							</p>

							<span class="font-mono text-[9px] text-[#3a4154]">
								{result.entryFile}
							</span>
						</div>

						<p class="mt-3 text-sm leading-6 text-[#b8c3d6]">
							{result.summary}
						</p>

					</div>

				</div>

				<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">

					<div>
						<p class="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00ff88]">
							Strengths
						</p>

						<ul class="mt-3 space-y-2 text-sm text-[#b8c3d6]">
							{#each result.strengths as point, i}
								<li
									class="flex gap-2"
									style="animation: fadeUp 0.4s ease-out {i * 0.08}s both;"
								>
									<span class="text-[#00ff88]">+</span>
									{point}
								</li>
							{/each}
						</ul>
					</div>

					<div>
						<p class="font-mono text-[10px] uppercase tracking-[0.18em] text-yellow-400">
							Improvements
						</p>

						<ul class="mt-3 space-y-2 text-sm text-[#b8c3d6]">
							{#each result.improvements as point, i}
								<li
									class="flex gap-2"
									style="animation: fadeUp 0.4s ease-out {i * 0.08}s both;"
								>
									<span class="text-yellow-400">→</span>
									{point}
								</li>
							{/each}
						</ul>
					</div>

				</div>

			</div>

		{/if}

	</div>

</DashboardLayout>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>