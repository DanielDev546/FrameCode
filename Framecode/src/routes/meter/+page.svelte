
<script lang="ts">
	import { onDestroy } from "svelte";
	import DashboardLayout from "$lib/layout/DashboardLayout.svelte";

	let { data } = $props();

	type MetricReport = {
		total: number;
		perf: number;
		seo: number;
		a11y: number;
		increase: string;
		tips: string[];
	};

	// Sample reports from the original HTML.
	// These are demonstration values, not live audit results.
	const projectMetrics: Record<string, MetricReport> = {
		"Daniel-sv-website": {
			total: 94,
			perf: 98,
			seo: 95,
			a11y: 91,
			increase: "+3.2%",
			tips: [
				"Optimize image assets on Homepage.",
				"Improve LCP on blog section.",
				"Reduce main thread blocking."
			]
		},
		"draftly-app": {
			total: 91,
			perf: 93,
			seo: 89,
			a11y: 92,
			increase: "+4.1%",
			tips: [
				"Defer non-critical editor hydration.",
				"Add OpenGraph meta tags to shared docs.",
				"Preload primary monospace font subset."
			]
		},
		"svgen-studio": {
			total: 96,
			perf: 99,
			seo: 94,
			a11y: 95,
			increase: "+2.4%",
			tips: [
				"Memoize SVG path bounding-box recalculations.",
				"Add ARIA labels to canvas zoom controls.",
				"Enable Brotli compression on static presets."
			]
		},
		"amund-os": {
			total: 89,
			perf: 92,
			seo: 86,
			a11y: 89,
			increase: "+5.0%",
			tips: [
				"Throttle terminal boot typewriter repaint rate.",
				"Improve contrast ratio on muted status badges.",
				"Add structured JSON-LD developer schema."
			]
		}
	};

	const projects = [
		{ id: "Daniel-sv-website", name: "Daniel-sv-website" },
		{ id: "draftly-app", name: "draftly-app" },
		{ id: "svgen-studio", name: "svgen-studio" },
		{ id: "amund-os", name: "amund-os" }
	];

	let selectedProject = $state("Daniel-sv-website");
	let running = $state(false);
	let progress = $state(0);
	let auditStatus = $state("Sample report");
	let copied = $state(false);
	let errorMessage = $state("");

	let report = $derived(
		projectMetrics[selectedProject] ?? projectMetrics["Daniel-sv-website"]
	);

	let gaugeOffset = $derived(
		75 - (75 * report.total) / 100
	);

	let cliCommand = $derived(
		`framecode metrics analyze ${selectedProject} --full-report`
	);

	let runLabel = $derived(
		running ? "SCANNING..." : "RUN AUDIT"
	);

	let progressTimer: ReturnType<typeof setInterval> | null = null;
	let auditTimer: ReturnType<typeof setTimeout> | null = null;
	let copyTimer: ReturnType<typeof setTimeout> | null = null;

	function updateProjectSelection() {
		errorMessage = "";
		auditStatus = "Sample report";
		progress = 0;
	}

	function runAudit() {
		if (running) return;

		errorMessage = "";
		running = true;
		progress = 0;
		auditStatus = "Analysing project...";

		if (progressTimer) clearInterval(progressTimer);
		if (auditTimer) clearTimeout(auditTimer);

		progressTimer = setInterval(() => {
			progress = Math.min(progress + Math.floor(Math.random() * 14) + 5, 95);
		}, 180);

		auditTimer = setTimeout(() => {
			if (progressTimer) {
				clearInterval(progressTimer);
				progressTimer = null;
			}

			progress = 100;
			running = false;
			auditStatus = "Demo audit complete";

			auditTimer = setTimeout(() => {
				progress = 0;
			}, 1000);
		}, 1800);
	}

	async function copyCliCommand() {
		try {
			await navigator.clipboard.writeText(cliCommand);

			copied = true;

			if (copyTimer) clearTimeout(copyTimer);

			copyTimer = setTimeout(() => {
				copied = false;
				copyTimer = null;
			}, 1800);
		} catch {
			errorMessage = "Unable to access your clipboard. Copy the command manually.";
		}
	}

	onDestroy(() => {
		if (progressTimer) clearInterval(progressTimer);
		if (auditTimer) clearTimeout(auditTimer);
		if (copyTimer) clearTimeout(copyTimer);
	});
</script>

<svelte:head>
	<title>Conversion Meter | FrameCode</title>
	<meta
		name="description"
		content="Monitor project performance, SEO, accessibility and conversion insights in FrameCode."
	/>
</svelte:head>

<DashboardLayout active="ai-meter" {data}>
	<div class="meter-page min-h-full px-5 py-8 sm:px-8 lg:px-10">
		<div class="mx-auto max-w-6xl space-y-7">

			<!-- PAGE HEADING -->
			<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
				<div>
					<div class="mb-2 flex items-center gap-2">
						<span class="h-1.5 w-1.5 rounded-full bg-[var(--fc-accent)]"></span>
						<p class="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--fc-text-muted)]">
							FRAMECODE / AI METER
						</p>
					</div>

					<h1 class="text-2xl font-semibold tracking-tight text-[var(--fc-text)] sm:text-3xl">
						Conversion Meter<span class="text-[var(--fc-accent)]">.</span>
					</h1>

					<p class="mt-2 max-w-xl text-sm leading-6 text-[var(--fc-text-secondary)]">
						Understand your project's performance, discover optimization opportunities,
						and track the metrics that matter.
					</p>
				</div>

				<div class="flex items-center gap-2 self-start rounded-lg border border-[var(--fc-border)] bg-[var(--fc-panel)] px-3 py-2 sm:self-auto">
					<span class="h-1.5 w-1.5 rounded-full bg-[var(--fc-warning)]"></span>
					<span class="font-mono text-[9px] uppercase tracking-wider text-[var(--fc-text-muted)]">
						Demo report data
					</span>
				</div>
			</div>

			<!-- ERROR MESSAGE -->
			{#if errorMessage}
				<div
					role="alert"
					class="flex items-start justify-between gap-3 rounded-lg border border-[var(--fc-danger)]/20 bg-[var(--fc-danger)]/5 px-4 py-3"
				>
					<p class="text-xs leading-5 text-[var(--fc-danger)]">
						{errorMessage}
					</p>
					<button
						type="button"
						onclick={() => (errorMessage = "")}
						class="text-[var(--fc-danger)]"
						aria-label="Dismiss error"
					>
						×
					</button>
				</div>
			{/if}

			<!-- PROJECT SELECTOR -->
			<section class="rounded-xl border border-[var(--fc-border)] bg-[var(--fc-panel)] p-5 sm:p-6">
				<div class="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
					<div>
						<h2 class="text-sm font-semibold text-[var(--fc-text)]">
							Project analysis
						</h2>
						<p class="mt-1 text-xs text-[var(--fc-text-muted)]">
							Choose a project to view its conversion metrics.
						</p>
					</div>

					<span class="font-mono text-[9px] uppercase tracking-wider text-[var(--fc-text-muted)]">
						PROJECT / SELECT
					</span>
				</div>

				<div class="flex flex-col gap-3 sm:flex-row">
					<div class="relative min-w-0 flex-1">
						<select
							id="projectSelect"
							bind:value={selectedProject}
							onchange={updateProjectSelection}
							disabled={running}
							class="custom-select fc-input h-11 w-full cursor-pointer rounded-lg px-4 font-mono text-xs"
						>
							{#each projects as project}
								<option value={project.id}>{project.name}</option>
							{/each}
						</select>
					</div>

					<button
						type="button"
						onclick={runAudit}
						disabled={running}
						class="flex h-11 items-center justify-center gap-2 rounded-lg border border-[var(--fc-accent)]/30 bg-[var(--fc-accent-soft)] px-6 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--fc-accent)] transition hover:bg-[var(--fc-accent)] hover:text-[var(--fc-on-accent)] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if running}
							<span class="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
						{:else}
							<span>↻</span>
						{/if}
						{runLabel}
					</button>
				</div>

				{#if running}
					<div class="mt-4">
						<div class="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[var(--fc-text-muted)]">
							<span>Running analysis</span>
							<span>{progress}%</span>
						</div>
						<div class="h-1 overflow-hidden rounded-full bg-[var(--fc-panel-raised)]">
							<div
								class="h-full rounded-full bg-[var(--fc-accent)] transition-all duration-200"
								style={`width: ${progress}%`}
							></div>
						</div>
					</div>
				{/if}
			</section>

			<!-- RESULTS HEADING -->
			<div class="flex items-center justify-between gap-3">
				<div>
					<h2 class="text-sm font-semibold text-[var(--fc-text)]">
						Analysis overview
					</h2>
					<p class="mt-1 text-[11px] text-[var(--fc-text-muted)]">
						Current report for {selectedProject}
					</p>
				</div>

				<span class="rounded-md border border-[var(--fc-border)] bg-[var(--fc-panel)] px-2.5 py-1 font-mono text-[9px] text-[var(--fc-text-muted)]">
					{auditStatus}
				</span>
			</div>

			<!-- METRICS GRID -->
			<div class="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">

				<!-- TOTAL SCORE -->
				<section class="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-[var(--fc-border)] bg-[var(--fc-panel)] p-6 lg:col-span-4">
					<div class="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[var(--fc-accent)]/40 to-transparent"></div>

					<div class="mb-2 flex w-full items-center justify-between">
						<p class="font-mono text-[9px] uppercase tracking-[0.17em] text-[var(--fc-text-muted)]">
							Overall score
						</p>
						<span class="text-[9px] text-[var(--fc-text-muted)]">01 / 04</span>
					</div>

					<div class="gauge-wrap relative mt-3 flex h-56 w-56 items-center justify-center">
						<svg
							class="h-full w-full -rotate-[225deg]"
							viewBox="0 0 220 220"
							role="img"
							aria-label={`Overall score ${report.total} out of 100`}
						>
							<circle
								cx="110"
								cy="110"
								r="96"
								fill="none"
								stroke="var(--fc-border)"
								stroke-width="3"
								stroke-dasharray="1.5 5"
								pathLength="100"
							/>

							<circle
								cx="110"
								cy="110"
								r="78"
								fill="none"
								stroke="var(--fc-panel-raised)"
								stroke-width="11"
								stroke-linecap="round"
								pathLength="100"
								stroke-dasharray="75 100"
							/>

							<circle
								cx="110"
								cy="110"
								r="78"
								fill="none"
								stroke="var(--fc-accent)"
								stroke-width="11"
								stroke-linecap="round"
								pathLength="100"
								stroke-dasharray="75 100"
								stroke-dashoffset={gaugeOffset}
								class="gauge-progress"
							/>
						</svg>

						<div class="absolute inset-0 flex flex-col items-center justify-center pt-1 text-center">
							<span class="font-mono text-[10px] text-[var(--fc-text-muted)]">
								TOTAL SCORE
							</span>

							<span class="my-1 text-5xl font-semibold tracking-tighter text-[var(--fc-text)]">
								{report.total}
							</span>

							<span class="font-mono text-xs text-[var(--fc-text-muted)]">
								/ 100
							</span>

							<span class="mt-3 rounded-full border border-[var(--fc-accent)]/20 bg-[var(--fc-accent-soft)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-[var(--fc-accent)]">
								{report.total >= 90 ? "Excellent" : report.total >= 80 ? "Good" : "Needs work"}
							</span>
						</div>
					</div>

					<p class="mt-3 max-w-[230px] text-center text-[10px] leading-5 text-[var(--fc-text-muted)]">
						Your combined project quality score across the available metrics.
					</p>
				</section>

				<!-- INDIVIDUAL METRICS -->
				<section class="flex flex-col gap-3.5 lg:col-span-3">

					{#each [
						{ name: "Performance", value: report.perf, number: "02", description: "Loading and responsiveness" },
						{ name: "SEO", value: report.seo, number: "03", description: "Search engine optimization" },
						{ name: "Accessibility", value: report.a11y, number: "04", description: "Inclusive user experience" }
					] as metric}
						<div class="flex flex-1 flex-col justify-center rounded-xl border border-[var(--fc-border)] bg-[var(--fc-panel)] p-4">
							<div class="mb-3 flex items-start justify-between gap-2">
								<div>
									<p class="text-sm font-semibold text-[var(--fc-text)]">
										{metric.name}
									</p>
									<p class="mt-1 text-[10px] text-[var(--fc-text-muted)]">
										{metric.description}
									</p>
								</div>

								<span class="font-mono text-[9px] text-[var(--fc-text-muted)]">
									{metric.number}
								</span>
							</div>

							<div class="mb-2 flex items-end justify-between">
								<span class="text-2xl font-semibold tracking-tight text-[var(--fc-text)]">
									{metric.value}
								</span>
								<span class="font-mono text-[10px] text-[var(--fc-accent)]">
									{metric.value}%
								</span>
							</div>

							<div
								class="h-1.5 overflow-hidden rounded-full bg-[var(--fc-panel-raised)]"
								role="progressbar"
								aria-label={`${metric.name} score`}
								aria-valuenow={metric.value}
								aria-valuemin="0"
								aria-valuemax="100"
							>
								<div
									class="metric-bar h-full rounded-full bg-[var(--fc-accent)]"
									style={`width: ${metric.value}%`}
								></div>
							</div>
						</div>
					{/each}
				</section>

				<!-- AI INSIGHTS -->
				<section class="flex flex-col rounded-xl border border-[var(--fc-border)] bg-[var(--fc-panel)] p-5 lg:col-span-5">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-semibold text-[var(--fc-text)]">
								AI Insights
							</p>
							<p class="mt-1 text-[10px] text-[var(--fc-text-muted)]">
								Optimization suggestions
							</p>
						</div>

						<div class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--fc-accent)]/20 bg-[var(--fc-accent-soft)] text-sm text-[var(--fc-accent)]">
							✳
						</div>
					</div>

					<div class="mt-6">
						<p class="mb-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--fc-text-muted)]">
							Recommended improvements
						</p>

						<div class="space-y-4">
							{#each report.tips as tip, i}
								<div class="flex items-start gap-3">
									<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--fc-panel-raised)] font-mono text-[9px] text-[var(--fc-accent)]">
										0{i + 1}
									</span>
									<p class="pt-1 text-xs leading-5 text-[var(--fc-text-secondary)]">
										{tip}
									</p>
								</div>
							{/each}
						</div>
					</div>

					<div class="mt-auto pt-7">
						<div class="rounded-lg border border-[var(--fc-accent)]/15 bg-[var(--fc-accent-soft)] p-4">
							<p class="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--fc-text-muted)]">
								Estimated conversion opportunity
							</p>
							<p class="mt-2 text-2xl font-semibold tracking-tight text-[var(--fc-accent)]">
								{report.increase}
							</p>
							<p class="mt-1 text-[10px] leading-5 text-[var(--fc-text-muted)]">
								Demonstration estimate from sample data, not a measured conversion uplift.
							</p>
						</div>
					</div>
				</section>
			</div>

			<!-- CLI COMMAND -->
			<section class="overflow-hidden rounded-xl border border-[var(--fc-border)] bg-[var(--fc-panel)]">
				<div class="flex flex-col justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center">
					<div class="min-w-0 overflow-x-auto">
						<div class="whitespace-nowrap font-mono text-[11px]">
							<span class="mr-2 text-[var(--fc-accent)]">$</span>
							<span class="text-[var(--fc-text)]">framecode metrics analyze</span>
							<span class="text-[var(--fc-accent)]">{selectedProject}</span>
							<span class="text-[var(--fc-text-muted)]">--full-report</span>
						</div>
					</div>

					<button
						type="button"
						onclick={copyCliCommand}
						class="flex shrink-0 items-center justify-center gap-2 rounded-md border border-[var(--fc-border)] bg-[var(--fc-panel-raised)] px-3 py-2 font-mono text-[9px] text-[var(--fc-text-secondary)] transition hover:border-[var(--fc-accent)]/30 hover:text-[var(--fc-accent)]"
					>
						{#if copied}
							<span class="text-[var(--fc-success)]">✓</span>
							COPIED
						{:else}
							<span>▢</span>
							COPY COMMAND
						{/if}
					</button>
				</div>
			</section>

			<!-- FOOTNOTE -->
			<div class="flex flex-col justify-between gap-2 pb-5 sm:flex-row sm:items-center">
				<p class="text-[10px] text-[var(--fc-text-muted)]">
					FrameCode / Conversion Meter
				</p>
				<p class="font-mono text-[9px] text-[var(--fc-text-muted)]">
					REPORT DATA: DEMONSTRATION MODE
				</p>
			</div>
		</div>
	</div>
</DashboardLayout>

<style>
	.meter-page {
		background-image: radial-gradient(
			circle at 1px 1px,
			color-mix(in srgb, var(--fc-text-muted) 9%, transparent) 1px,
			transparent 0
		);
		background-size: 22px 22px;
	}

	.custom-select {
		appearance: none;
		background-color: var(--fc-input);
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 1rem center;
		background-size: 14px;
		padding-right: 2.75rem;
	}

	.gauge-progress {
		transition: stroke-dashoffset 800ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.metric-bar {
		transition: width 650ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	@media (prefers-reduced-motion: reduce) {
		.gauge-progress,
		.metric-bar {
			transition: none;
		}
	}
</style>
