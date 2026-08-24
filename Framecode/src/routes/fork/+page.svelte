<script lang="ts">
	import { goto } from "$app/navigation";
	import DashboardLayout from "$lib/layout/DashboardLayout.svelte";

	type Template = {
		id: string;
		name: string;
		description?: string | null;
		category: string;
		framework: string;
		repoUrl: string;
	};

	type RepoPreview = {
		name: string;
		fullName: string;
		description: string | null;
		language: string | null;
		stars: number;
		owner: string;
		avatar: string;
	};

	let { data } = $props();

	let mode = $state<"github" | "templates">("github");
	let repoUrl = $state("");
	let importing = $state(false);
	let importError = $state("");
	let importSteps = $state<string[]>([]);

	let preview = $state<RepoPreview | null>(null);
	let previewLoading = $state(false);
	let previewError = $state("");

	let validUrl = $derived(parseGithubUrl(repoUrl) !== null);

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function parseGithubUrl(url: string) {
		const clean = url.trim().replace(/\/+$/, "");
		const match = clean.match(/github\.com\/([^\/]+)\/([^\/]+)/);
		if (!match) return null;
		return { owner: match[1], repo: match[2] };
	}

	async function fetchPreview() {
		const parsed = parseGithubUrl(repoUrl);

		if (!parsed) {
			preview = null;
			previewError = "";
			return;
		}

		previewLoading = true;
		previewError = "";

		try {
			const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);

			if (!res.ok) {
				preview = null;
				previewError = "Repo not found or private.";
				return;
			}

			const data = await res.json();

			preview = {
				name: data.name,
				fullName: data.full_name,
				description: data.description,
				language: data.language,
				stars: data.stargazers_count,
				owner: data.owner.login,
				avatar: data.owner.avatar_url
			};
		} catch {
			preview = null;
			previewError = "Could not reach GitHub.";
		} finally {
			previewLoading = false;
		}
	}

	function onUrlInput() {
		preview = null;
		previewError = "";

		if (debounceTimer) clearTimeout(debounceTimer);

		debounceTimer = setTimeout(() => {
			if (validUrl) fetchPreview();
		}, 500);
	}

	const IMPORT_STEPS = [
		"Verifying repository...",
		"Cloning file tree...",
		"Registering project...",
		"Preparing IDE..."
	];

	async function runImportSequence() {
		importSteps = [];
		for (const step of IMPORT_STEPS) {
			importSteps = [...importSteps, step];
			await new Promise((r) => setTimeout(r, 350 + Math.random() * 300));
		}
	}

	async function importRepo(name: string, url: string, language: string | null = null) {
		importing = true;
		importError = "";

		const seqPromise = runImportSequence();

		try {
			const [res] = await Promise.all([
				fetch("/api/github/import", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name, url, language })
				}),
				seqPromise
			]);

			if (!res.ok) throw new Error(await res.text());

			const project = await res.json();
			goto(`/ide/${project.id}`);
		} catch (e) {
			console.error("Failed to import repo", e);
			importError = e instanceof Error ? e.message : "Failed to import.";
			importing = false;
		}
	}

	function submitGithubUrl() {
		const parsed = parseGithubUrl(repoUrl);

		if (!parsed) {
			importError = "Enter a valid GitHub repo URL.";
			return;
		}

		importRepo(parsed.repo, `https://github.com/${parsed.owner}/${parsed.repo}`);
	}

	function useTemplate(template: Template) {
		importRepo(template.name, template.repoUrl, template.framework);
	}
</script>

<DashboardLayout active="fork" {data}>

	<div class="p-8">

		<div class="mb-8">
			<p class="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a4154]">
				// FORK
			</p>

			<h1 class="text-[30px] font-bold text-[#e8edf5]">
				Start a New Project
			</h1>

			<p class="mt-2 text-[#5a6478]">
				Import an existing GitHub repo, or fork one of our templates.
			</p>
		</div>

		<!-- Tabs -->
		<div class="mb-6 flex gap-2 border-b border-white/[0.05]">

			<button
				onclick={() => (mode = "github")}
				disabled={importing}
				class="relative px-4 py-3 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors {mode === 'github'
					? 'text-[#00ff88]'
					: 'text-[#5a6478] hover:text-[#e8edf5]'}"
			>
				From GitHub
				{#if mode === "github"}
					<span class="absolute inset-x-0 -bottom-[1px] h-[2px] bg-[#00ff88]" style="animation: growLine 0.25s ease-out;"></span>
				{/if}
			</button>

			<button
				onclick={() => (mode = "templates")}
				disabled={importing}
				class="relative px-4 py-3 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors {mode === 'templates'
					? 'text-[#00ff88]'
					: 'text-[#5a6478] hover:text-[#e8edf5]'}"
			>
				From Template
				{#if mode === "templates"}
					<span class="absolute inset-x-0 -bottom-[1px] h-[2px] bg-[#00ff88]" style="animation: growLine 0.25s ease-out;"></span>
				{/if}
			</button>

		</div>

		{#if importError}
			<div class="mb-6 max-w-xl rounded-sm border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400" style="animation: fadeUp 0.3s ease-out;">
				{importError}
			</div>
		{/if}

		<!-- Import sequence overlay -->
		{#if importing}

			<div class="mb-6 max-w-xl rounded-sm border border-[#00ff88]/10 bg-[#050810] p-5 font-mono text-[12px]" style="animation: fadeUp 0.3s ease-out;">

				{#each importSteps as step, i}
					<div class="leading-[1.9] text-[#5a6478]" style="animation: fadeIn 0.3s ease-out;">
						<span class="text-[#00ff88]">❯</span>
						{step}
						{#if i === importSteps.length - 1}
							<span class="ml-1 inline-block h-3 w-1.5 animate-pulse bg-[#00ff88] align-middle"></span>
						{:else}
							<span class="ml-1 text-[#00ff88]">✓</span>
						{/if}
					</div>
				{/each}

			</div>

		{/if}

		<!-- GitHub URL mode -->
		{#if mode === "github" && !importing}

			<div class="max-w-xl rounded-sm border border-white/[0.05] bg-[#0b1018] p-6" style="animation: fadeUp 0.3s ease-out;">

				<p class="font-mono text-[10px] uppercase tracking-[0.18em] text-[#3a4154]">
					Repository URL
				</p>

				<div class="mt-4 flex gap-3">

					<div class="relative flex-1">

						<input
							type="text"
							bind:value={repoUrl}
							oninput={onUrlInput}
							placeholder="https://github.com/owner/repo"
							class="w-full border px-3 py-2 pr-8 text-sm text-white outline-none transition-colors {repoUrl && validUrl
								? 'border-[#00ff88]/40 bg-transparent'
								: repoUrl
									? 'border-red-500/30 bg-transparent'
									: 'border-white/[0.08] bg-transparent focus:border-[#00ff88]/40'}"
						/>

						{#if repoUrl}
							<span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
								{#if previewLoading}
									<span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#3a4154] border-t-[#00ff88]"></span>
								{:else if validUrl}
									<span class="text-[#00ff88]">✓</span>
								{:else}
									<span class="text-red-400">✕</span>
								{/if}
							</span>
						{/if}

					</div>

					<button
						onclick={submitGithubUrl}
						disabled={!validUrl || !preview}
						class="border border-[#00ff88]/20 bg-[#00ff88]/5 px-5 py-2 font-mono text-[11px] uppercase text-[#00ff88] transition hover:bg-[#00ff88] hover:text-black disabled:opacity-40"
					>
						Import
					</button>

				</div>

				<p class="mt-3 text-xs text-[#5a6478]">
					Works with any public GitHub repository.
				</p>

				{#if previewError}
					<p class="mt-3 text-xs text-red-400">
						{previewError}
					</p>
				{/if}

				<!-- Repo preview card -->
				{#if preview}

					<div class="mt-5 flex items-center gap-4 rounded-sm border border-white/[0.05] bg-[#070b12] p-4" style="animation: fadeUp 0.3s ease-out;">

						<img
							src={preview.avatar}
							alt={preview.owner}
							class="h-10 w-10 rounded-full border border-white/[0.08]"
						/>

						<div class="min-w-0 flex-1">

							<p class="truncate text-sm font-semibold text-white">
								{preview.fullName}
							</p>

							{#if preview.description}
								<p class="mt-0.5 truncate text-xs text-[#5a6478]">
									{preview.description}
								</p>
							{/if}

						</div>

						<div class="flex shrink-0 items-center gap-4 font-mono text-[10px] text-[#5a6478]">

							{#if preview.language}
								<span>{preview.language}</span>
							{/if}

							<span class="flex items-center gap-1">
								★ {preview.stars}
							</span>

						</div>

					</div>

				{/if}

			</div>

		{:else if mode === "templates" && !importing}

			<!-- Templates mode -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" style="animation: fadeUp 0.3s ease-out;">

				{#each data.templates as template, i}

					<div
						class="group flex flex-col rounded-sm border border-white/[0.05] bg-[#0b1018] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#00ff88]/20 hover:shadow-[0_8px_24px_rgba(0,255,136,0.06)]"
						style="animation: fadeUp 0.35s ease-out {i * 0.05}s both;"
					>

						<p class="font-mono text-[10px] uppercase tracking-[0.15em] text-[#3a4154]">
							{template.category}
						</p>

						<h3 class="mt-2 text-lg font-semibold text-white transition-colors group-hover:text-[#00ff88]">
							{template.name}
						</h3>

						{#if template.description}
							<p class="mt-1 flex-1 text-sm text-[#5a6478]">
								{template.description}
							</p>
						{/if}

						<div class="mt-4 flex items-center justify-between">

							<span class="font-mono text-[10px] uppercase text-[#5a6478]">
								{template.framework}
							</span>

							<button
								onclick={() => useTemplate(template)}
								class="border border-[#00ff88]/20 bg-[#00ff88]/5 px-4 py-1.5 font-mono text-[10px] uppercase text-[#00ff88] transition hover:bg-[#00ff88] hover:text-black"
							>
								Use
							</button>

						</div>

					</div>

				{:else}

					<p class="text-sm text-[#5a6478]">
						No templates available yet.
					</p>

				{/each}

			</div>

		{/if}

	</div>

</DashboardLayout>

<style>
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
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

	@keyframes growLine {
		from { transform: scaleX(0); }
		to { transform: scaleX(1); }
	}
</style>