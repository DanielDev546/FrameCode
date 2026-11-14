
<script lang="ts">
	import { onDestroy } from "svelte";
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

	type ParsedRepo = {
		owner: string;
		repo: string;
	};

	let { data } = $props();

	// ── Main page state ──────────────────────────────────

	let mode = $state<"github" | "templates">("github");

	let repoUrl = $state("");
	let importing = $state(false);
	let importError = $state("");
	let importSteps = $state<string[]>([]);

	let preview = $state<RepoPreview | null>(null);
	let previewLoading = $state(false);
	let previewError = $state("");

	// ── Template state ───────────────────────────────────

	let templateSearch = $state("");
	let activeCategory = $state("All");

	let templates = $derived((data?.templates ?? []) as Template[]);

	let categories = $derived([
		"All",
		...new Set(templates.map((template) => template.category))
	]);

	let filteredTemplates = $derived(
		templates.filter((template) => {
			const matchesCategory =
				activeCategory === "All" ||
				template.category.toLowerCase() === activeCategory.toLowerCase();

			const search = templateSearch.trim().toLowerCase();

			const matchesSearch =
				!search ||
				template.name.toLowerCase().includes(search) ||
				(template.description ?? "").toLowerCase().includes(search) ||
				template.framework.toLowerCase().includes(search) ||
				template.category.toLowerCase().includes(search);

			return matchesCategory && matchesSearch;
		})
	);

	// ── GitHub URL validation ────────────────────────────

	function parseGithubUrl(url: string): ParsedRepo | null {
		try {
			const clean = url.trim();

			if (!clean) return null;

			const normalized = clean.startsWith("http")
				? clean
				: `https://${clean}`;

			const parsed = new URL(normalized);

			if (
				parsed.hostname !== "github.com" &&
				parsed.hostname !== "www.github.com"
			) {
				return null;
			}

			const segments = parsed.pathname
				.split("/")
				.filter(Boolean);

			if (segments.length < 2) return null;

			const owner = decodeURIComponent(segments[0]);
			let repo = decodeURIComponent(segments[1]);

			repo = repo.replace(/\.git$/i, "");

			const validOwner = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/;
			const validRepo = /^[a-zA-Z0-9._-]+$/;

			if (!validOwner.test(owner) || !validRepo.test(repo)) {
				return null;
			}

			if (repo === "." || repo === "..") return null;

			return { owner, repo };
		} catch {
			return null;
		}
	}

	let validUrl = $derived(parseGithubUrl(repoUrl) !== null);

	let previewMatchesUrl = $derived.by(() => {
		const parsed = parseGithubUrl(repoUrl);

		if (!parsed || !preview) return false;

		return (
			preview.fullName.toLowerCase() ===
			`${parsed.owner}/${parsed.repo}`.toLowerCase()
		);
	});

	// ── GitHub preview ───────────────────────────────────

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let previewRequestId = 0;

	async function fetchPreview() {
		const parsed = parseGithubUrl(repoUrl);

		if (!parsed) {
			preview = null;
			previewError = "";
			previewLoading = false;
			return;
		}

		const requestId = ++previewRequestId;

		previewLoading = true;
		previewError = "";
		preview = null;

		try {
			const res = await fetch(
				`https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`,
				{
					headers: {
						Accept: "application/vnd.github+json"
					}
				}
			);

			if (requestId !== previewRequestId) return;

			if (!res.ok) {
				preview = null;

				if (res.status === 404) {
					previewError = "Repository not found or it is private.";
				} else if (res.status === 403) {
					previewError = "GitHub API rate limit reached. Try again shortly.";
				} else {
					previewError = "Unable to retrieve this repository.";
				}

				return;
			}

			const result = await res.json();

			if (requestId !== previewRequestId) return;

			preview = {
				name: result.name,
				fullName: result.full_name,
				description: result.description,
				language: result.language,
				stars: result.stargazers_count,
				owner: result.owner.login,
				avatar: result.owner.avatar_url
			};
		} catch {
			if (requestId !== previewRequestId) return;

			preview = null;
			previewError = "Could not connect to GitHub. Check your connection.";
		} finally {
			if (requestId === previewRequestId) {
				previewLoading = false;
			}
		}
	}

	function onUrlInput() {
		// Invalidate any previous request so stale results cannot overwrite
		// the preview for the latest URL.
		previewRequestId++;

		preview = null;
		previewError = "";
		previewLoading = false;
		importError = "";

		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}

		if (!validUrl) return;

		debounceTimer = setTimeout(() => {
			fetchPreview();
		}, 500);
	}

	// ── Import process ───────────────────────────────────

	const IMPORT_STEPS = [
		"Verifying repository...",
		"Cloning file tree...",
		"Registering project...",
		"Preparing IDE..."
	];

	function wait(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function runImportSequence() {
		importSteps = [];

		for (const step of IMPORT_STEPS) {
			importSteps = [...importSteps, step];
			await wait(450);
		}
	}

	async function importRepo(
		name: string,
		url: string,
		language: string | null = null
	) {
		if (importing) return;

		importing = true;
		importError = "";
		importSteps = [];

		try {
			const [res] = await Promise.all([
				fetch("/api/github/import", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						name,
						url,
						language
					})
				}),
				runImportSequence()
			]);

			if (!res.ok) {
				const message = await res.text();
				throw new Error(message || "Repository import failed.");
			}

			const project = await res.json();

			if (!project?.id) {
				throw new Error(
					"The import endpoint did not return a valid project ID."
				);
			}

			await goto(`/ide/${project.id}`);
		} catch (error) {
			console.error("Failed to import repository:", error);

			importError =
				error instanceof Error
					? error.message
					: "Something went wrong while importing the project.";

			importing = false;
		}
	}

	function submitGithubUrl() {
		const parsed = parseGithubUrl(repoUrl);

		if (!parsed) {
			importError = "Enter a valid GitHub repository URL.";
			return;
		}

		if (!previewMatchesUrl) {
			importError = "Wait for the repository preview to finish loading.";
			return;
		}

		importRepo(
			preview?.name ?? parsed.repo,
			`https://github.com/${parsed.owner}/${parsed.repo}`,
			preview?.language ?? null
		);
	}

	function useTemplate(template: Template) {
		importRepo(
			template.name,
			template.repoUrl,
			template.framework
		);
	}

	function changeMode(nextMode: "github" | "templates") {
		if (importing) return;

		mode = nextMode;
		importError = "";
	}

	onDestroy(() => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		previewRequestId++;
	});
</script>

<DashboardLayout active="fork" {data}>
	<div class="fork-page min-h-full px-5 py-8 sm:px-8 lg:px-10">

		<div class="mx-auto max-w-6xl">

			<!-- Page heading -->
			<div class="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
				<div>
					<div class="mb-3 flex items-center gap-2">
						<span class="h-1.5 w-1.5 rounded-full bg-[var(--fc-accent)]"></span>
						<p class="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--fc-text-muted)]">
							FRAMECODE / PROJECT CREATION
						</p>
					</div>

					<h1 class="text-2xl font-semibold tracking-tight text-[var(--fc-text)] sm:text-3xl">
						Start a new project<span class="text-[var(--fc-accent)]">.</span>
					</h1>

					<p class="mt-2 max-w-xl text-sm leading-6 text-[var(--fc-text-secondary)]">
						Bring an existing repository into your workspace or start with
						a ready-to-use template.
					</p>
				</div>

				<div class="flex w-fit items-center gap-2 rounded-lg border border-[var(--fc-border)] bg-[var(--fc-panel)] px-3 py-2">
					<span class="h-1.5 w-1.5 rounded-full bg-[var(--fc-success)]"></span>
					<span class="font-mono text-[10px] uppercase tracking-wider text-[var(--fc-text-secondary)]">
						Workspace ready
					</span>
				</div>
			</div>

			<!-- Mode tabs -->
			<div class="mb-7 flex items-center gap-1 border-b border-[var(--fc-border)]">
				<button
					type="button"
					onclick={() => changeMode("github")}
					disabled={importing}
					aria-selected={mode === "github"}
					class="mode-tab {mode === 'github' ? 'mode-tab-active' : ''}"
				>
					<span class="text-base">⌘</span>
					<span>Import from GitHub</span>
				</button>

				<button
					type="button"
					onclick={() => changeMode("templates")}
					disabled={importing}
					aria-selected={mode === "templates"}
					class="mode-tab {mode === 'templates' ? 'mode-tab-active' : ''}"
				>
					<span class="text-base">▦</span>
					<span>Start from template</span>
				</button>
			</div>

			<!-- Error message -->
			{#if importError}
				<div
					role="alert"
					class="mb-6 flex items-start gap-3 rounded-lg border border-[var(--fc-danger)]/20 bg-[var(--fc-danger)]/5 p-4"
				>
					<span class="mt-0.5 text-[var(--fc-danger)]">!</span>
					<div class="min-w-0 flex-1">
						<p class="text-xs font-semibold text-[var(--fc-danger)]">
							Import unsuccessful
						</p>
						<p class="mt-1 break-words text-xs leading-5 text-[var(--fc-text-secondary)]">
							{importError}
						</p>
					</div>
					<button
						type="button"
						onclick={() => (importError = "")}
						aria-label="Dismiss error"
						class="text-[var(--fc-text-muted)] transition hover:text-[var(--fc-text)]"
					>
						×
					</button>
				</div>
			{/if}

			<!-- Import progress -->
			{#if importing}
				<section class="mb-7 max-w-2xl overflow-hidden rounded-xl border border-[var(--fc-border)] bg-[var(--fc-panel)]">
					<div class="flex items-center justify-between border-b border-[var(--fc-border)] px-5 py-4">
						<div>
							<p class="text-sm font-semibold text-[var(--fc-text)]">
								Preparing your workspace
							</p>
							<p class="mt-1 text-xs text-[var(--fc-text-muted)]">
								Please keep this page open while the import completes.
							</p>
						</div>

						<span class="h-2 w-2 animate-pulse rounded-full bg-[var(--fc-accent)]"></span>
					</div>

					<div class="space-y-3 p-5">
						{#each IMPORT_STEPS as step, i}
							{@const completed = i < importSteps.length}
							<div class="flex items-center gap-3 text-xs">
								<span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border {completed ? 'border-[var(--fc-accent)]/30 bg-[var(--fc-accent-soft)] text-[var(--fc-accent)]' : 'border-[var(--fc-border)] text-[var(--fc-text-muted)]'}">
									{#if completed}
										✓
									{:else}
										{i + 1}
									{/if}
								</span>

								<span class="{completed ? 'text-[var(--fc-text)]' : 'text-[var(--fc-text-muted)]'}">
									{step}
								</span>

								{#if i === importSteps.length - 1 && importSteps.length < IMPORT_STEPS.length}
									<span class="ml-auto h-3 w-3 animate-spin rounded-full border border-[var(--fc-border)] border-t-[var(--fc-accent)]"></span>
								{:else if completed}
									<span class="ml-auto text-[10px] text-[var(--fc-success)]">
										DONE
									</span>
								{/if}
							</div>
						{/each}
					</div>

					<div class="h-1 bg-[var(--fc-panel-raised)]">
						<div
							class="h-full bg-[var(--fc-accent)] transition-all duration-300"
							style="width: {(importSteps.length / IMPORT_STEPS.length) * 100}%"
						></div>
					</div>
				</section>
			{/if}

			<!-- GitHub import mode -->
			{#if mode === "github"}
				<div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">

					<section class="overflow-hidden rounded-xl border border-[var(--fc-border)] bg-[var(--fc-panel)]">
						<div class="border-b border-[var(--fc-border)] px-5 py-5 sm:px-6">
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--fc-border)] bg-[var(--fc-panel-raised)] text-lg text-[var(--fc-text)]">
									⌘
								</div>

								<div>
									<h2 class="text-sm font-semibold text-[var(--fc-text)]">
										Import a GitHub repository
									</h2>
									<p class="mt-1 text-xs text-[var(--fc-text-muted)]">
										Connect any public GitHub repository.
									</p>
								</div>
							</div>
						</div>

						<div class="p-5 sm:p-6">
							<label
								for="github-url"
								class="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--fc-text-muted)]"
							>
								Repository URL
							</label>

							<div class="flex flex-col gap-2 sm:flex-row">
								<div class="relative min-w-0 flex-1">
									<input
										id="github-url"
										type="url"
										bind:value={repoUrl}
										oninput={onUrlInput}
										onkeydown={(event) => {
											if (event.key === "Enter" && previewMatchesUrl && !importing) {
												submitGithubUrl();
											}
										}}
										placeholder="https://github.com/owner/repository"
										autocomplete="off"
										spellcheck="false"
										disabled={importing}
										class="fc-input h-11 w-full rounded-lg px-3 pr-10 font-mono text-xs"
									/>

									<div class="absolute right-3 top-1/2 -translate-y-1/2">
										{#if previewLoading}
											<span class="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--fc-border-strong)] border-t-[var(--fc-accent)]"></span>
										{:else if previewMatchesUrl}
											<span class="text-sm text-[var(--fc-success)]">✓</span>
										{:else if repoUrl && validUrl}
											<span class="text-xs text-[var(--fc-text-muted)]">···</span>
										{:else if repoUrl}
											<span class="text-sm text-[var(--fc-danger)]">×</span>
										{/if}
									</div>
								</div>

								<button
									type="button"
									onclick={submitGithubUrl}
									disabled={!previewMatchesUrl || importing}
									class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--fc-accent)] px-5 text-xs font-semibold text-[var(--fc-on-accent)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
								>
									Import repository
									<span>→</span>
								</button>
							</div>

							<p class="mt-3 text-[11px] leading-5 text-[var(--fc-text-muted)]">
								Use a repository URL from GitHub. Private repositories require
								the appropriate GitHub authentication support.
							</p>

							{#if previewError}
								<div class="mt-4 flex items-start gap-2 rounded-lg border border-[var(--fc-danger)]/20 bg-[var(--fc-danger)]/5 px-3 py-3">
									<span class="text-xs text-[var(--fc-danger)]">!</span>
									<p class="text-xs leading-5 text-[var(--fc-danger)]">
										{previewError}
									</p>
								</div>
							{/if}

							{#if previewLoading}
								<div class="mt-5 flex items-center gap-3 rounded-lg border border-[var(--fc-border)] bg-[var(--fc-panel-raised)] p-4">
									<span class="h-8 w-8 animate-pulse rounded-full bg-[var(--fc-panel-hover)]"></span>
									<div class="flex-1 space-y-2">
										<div class="h-2.5 w-2/5 animate-pulse rounded bg-[var(--fc-panel-hover)]"></div>
										<div class="h-2 w-3/5 animate-pulse rounded bg-[var(--fc-panel-hover)]"></div>
									</div>
								</div>
							{/if}

							{#if preview}
								<div class="mt-5 overflow-hidden rounded-lg border border-[var(--fc-accent)]/20 bg-[var(--fc-accent-soft)]">
									<div class="flex items-center justify-between border-b border-[var(--fc-accent)]/10 px-4 py-2.5">
										<span class="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--fc-accent)]">
											Repository detected
										</span>
										<span class="flex items-center gap-1.5 text-[10px] text-[var(--fc-success)]">
											<span class="h-1.5 w-1.5 rounded-full bg-[var(--fc-success)]"></span>
											Verified
										</span>
									</div>

									<div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
										<img
											src={preview.avatar}
											alt={`${preview.owner} avatar`}
											class="h-11 w-11 rounded-full border border-[var(--fc-border)]"
											referrerpolicy="no-referrer"
										/>

										<div class="min-w-0 flex-1">
											<p class="truncate text-sm font-semibold text-[var(--fc-text)]">
												{preview.fullName}
											</p>

											<p class="mt-1 line-clamp-2 text-xs leading-5 text-[var(--fc-text-secondary)]">
												{preview.description || "No repository description provided."}
											</p>
										</div>

										<div class="flex shrink-0 gap-4 sm:flex-col sm:gap-1 sm:text-right">
											{#if preview.language}
												<span class="text-[10px] text-[var(--fc-text-secondary)]">
													{preview.language}
												</span>
											{/if}

											<span class="text-[10px] text-[var(--fc-text-secondary)]">
												★ {preview.stars.toLocaleString()}
											</span>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</section>

					<!-- Information panel -->
					<aside class="space-y-4">
						<div class="rounded-xl border border-[var(--fc-border)] bg-[var(--fc-panel)] p-5">
							<p class="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fc-text-muted)]">
								How it works
							</p>

							<div class="mt-5 space-y-5">
								<div class="flex gap-3">
									<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--fc-accent-soft)] font-mono text-[10px] text-[var(--fc-accent)]">
										01
									</span>
									<div>
										<p class="text-xs font-semibold text-[var(--fc-text)]">
											Paste your repository
										</p>
										<p class="mt-1 text-[11px] leading-5 text-[var(--fc-text-muted)]">
											Enter the URL of the GitHub project you want to work on.
										</p>
									</div>
								</div>

								<div class="flex gap-3">
									<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--fc-accent-soft)] font-mono text-[10px] text-[var(--fc-accent)]">
										02
									</span>
									<div>
										<p class="text-xs font-semibold text-[var(--fc-text)]">
											Review repository details
										</p>
										<p class="mt-1 text-[11px] leading-5 text-[var(--fc-text-muted)]">
											FrameCode retrieves the public repository information.
										</p>
									</div>
								</div>

								<div class="flex gap-3">
									<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--fc-accent-soft)] font-mono text-[10px] text-[var(--fc-accent)]">
										03
									</span>
									<div>
										<p class="text-xs font-semibold text-[var(--fc-text)]">
											Open in FrameCode
										</p>
										<p class="mt-1 text-[11px] leading-5 text-[var(--fc-text-muted)]">
											Import the repository and continue in your IDE workspace.
										</p>
									</div>
								</div>
							</div>
						</div>

						<div class="rounded-xl border border-[var(--fc-border)] bg-[var(--fc-panel)] p-5">
							<div class="flex items-center gap-2">
								<span class="text-[var(--fc-accent)]">✳</span>
								<p class="text-xs font-semibold text-[var(--fc-text)]">
									Developer tip
								</p>
							</div>
							<p class="mt-2 text-xs leading-5 text-[var(--fc-text-secondary)]">
								You can paste a repository URL ending in
								<code class="rounded bg-[var(--fc-panel-raised)] px-1 py-0.5 font-mono text-[10px]">.git</code>
								too. FrameCode will normalize it before importing.
							</p>
						</div>
					</aside>
				</div>

			<!-- Templates mode -->
			{:else}
				<section>
					<div class="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
						<div>
							<h2 class="text-sm font-semibold text-[var(--fc-text)]">
								Choose a starting point
							</h2>
							<p class="mt-1 text-xs text-[var(--fc-text-muted)]">
								Select a template and FrameCode will prepare your project.
							</p>
						</div>

						<div class="relative w-full sm:max-w-xs">
							<span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--fc-text-muted)]">
								⌕
							</span>
							<input
								type="search"
								bind:value={templateSearch}
								placeholder="Search templates..."
								disabled={importing}
								class="fc-input h-10 w-full rounded-lg pl-9 pr-3 text-xs"
							/>
						</div>
					</div>

					<!-- Category filters -->
					<div class="mb-6 flex flex-wrap gap-2">
						{#each categories as category}
							<button
								type="button"
								onclick={() => (activeCategory = category)}
								disabled={importing}
								class="rounded-full border px-3 py-1.5 text-[10px] font-medium transition {activeCategory === category
									? 'border-[var(--fc-accent)]/30 bg-[var(--fc-accent-soft)] text-[var(--fc-accent)]'
									: 'border-[var(--fc-border)] bg-[var(--fc-panel)] text-[var(--fc-text-muted)] hover:border-[var(--fc-border-strong)] hover:text-[var(--fc-text)]'}"
							>
								{category}
							</button>
						{/each}
					</div>

					<!-- Template cards -->
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{#each filteredTemplates as template, i (template.id)}
							<article
								class="template-card group flex min-h-[220px] flex-col rounded-xl border border-[var(--fc-border)] bg-[var(--fc-panel)] p-5 transition duration-200 hover:-translate-y-1 hover:border-[var(--fc-accent)]/30"
								style={`animation-delay: ${i * 45}ms`}
							>
								<div class="flex items-start justify-between gap-3">
									<span class="rounded-md border border-[var(--fc-border)] bg-[var(--fc-panel-raised)] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-[var(--fc-text-muted)]">
										{template.category}
									</span>

									<span class="text-lg text-[var(--fc-text-muted)] transition group-hover:text-[var(--fc-accent)]">
										↗
									</span>
								</div>

								<h3 class="mt-5 text-base font-semibold text-[var(--fc-text)] transition group-hover:text-[var(--fc-accent)]">
									{template.name}
								</h3>

								<p class="mt-2 flex-1 text-xs leading-5 text-[var(--fc-text-secondary)]">
									{template.description || "A ready-to-use starter project for your next build."}
								</p>

								<div class="mt-5 flex items-center justify-between border-t border-[var(--fc-border)] pt-4">
									<span class="font-mono text-[10px] text-[var(--fc-text-muted)]">
										{template.framework}
									</span>

									<button
										type="button"
										onclick={() => useTemplate(template)}
										disabled={importing}
										class="rounded-lg border border-[var(--fc-accent)]/20 bg-[var(--fc-accent-soft)] px-3 py-2 text-[10px] font-semibold text-[var(--fc-accent)] transition hover:border-[var(--fc-accent)]/50 hover:bg-[var(--fc-accent)] hover:text-[var(--fc-on-accent)] disabled:opacity-40"
									>
										Use template <span class="ml-1">→</span>
									</button>
								</div>
							</article>
						{:else}
							<div class="col-span-full rounded-xl border border-dashed border-[var(--fc-border)] bg-[var(--fc-panel)] px-5 py-14 text-center">
								<p class="text-sm font-medium text-[var(--fc-text)]">
									No templates found
								</p>
								<p class="mt-2 text-xs text-[var(--fc-text-muted)]">
									Try another search term or category.
								</p>
								<button
									type="button"
									onclick={() => {
										templateSearch = "";
										activeCategory = "All";
									}}
									class="mt-4 text-xs font-medium text-[var(--fc-accent)] hover:underline"
								>
									Clear filters
								</button>
							</div>
						{/each}
					</div>

					<p class="mt-5 text-[10px] text-[var(--fc-text-muted)]">
						Showing {filteredTemplates.length} of {templates.length} available templates.
					</p>
				</section>
			{/if}
		</div>
	</div>
</DashboardLayout>

<style>
	.fork-page {
		background-image: radial-gradient(
			circle at 1px 1px,
			color-mix(in srgb, var(--fc-text-muted) 10%, transparent) 1px,
			transparent 0
		);
		background-size: 26px 26px;
	}

	.mode-tab {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 9px;
		padding: 13px 16px;
		font-size: 11px;
		font-weight: 500;
		color: var(--fc-text-muted);
		transition: color 160ms ease;
	}

	.mode-tab:hover {
		color: var(--fc-text);
	}

	.mode-tab:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	.mode-tab-active {
		color: var(--fc-accent);
	}

	.mode-tab-active::after {
		position: absolute;
		right: 0;
		bottom: -1px;
		left: 0;
		height: 2px;
		background: var(--fc-accent);
		content: "";
		animation: grow-line 220ms ease-out;
	}

	.template-card {
		animation: fade-up 350ms ease both;
	}

	@keyframes grow-line {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.template-card,
		.mode-tab-active::after {
			animation: none;
		}

		* {
			scroll-behavior: auto !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
