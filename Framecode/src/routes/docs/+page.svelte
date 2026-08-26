<script lang="ts">
	type Section = {
		id: string;
		label: string;
	};
	let mobileNavOpen = $state(false);

	const sections: Section[] = [
		{ id: 'intro', label: 'Introduction' },
		{ id: 'getting-started', label: 'Getting Started' },
		{ id: 'dashboard', label: 'Dashboard' },
		{ id: 'ide', label: 'The IDE' },
		{ id: 'fork', label: 'Fork' },
		{ id: 'templates', label: 'Templates' },
		{ id: 'meter', label: 'AI Meter' },
		{ id: 'github', label: 'GitHub Integration' },
		{ id: 'account', label: 'Account & Settings' }
	];

	let activeSection = $state('intro');

	function selectSection(id: string) {
		activeSection = id;
	}
</script>

<svelte:head>
	<title>Docs — FrameCode</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-[#070b12] text-[#e8edf5]">

	<!-- Top bar -->
	<header class="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.05] px-6">

		<a href="/" class="flex items-center gap-1 font-mono text-[15px] font-bold no-underline">
			<span class="text-[#3a4154]">[</span>
			<span class="text-[#00ff88]">FC</span>
			<span class="text-[#3a4154]">]</span>
			<span class="ml-1 text-white">FrameCode</span>
		</a>

		<nav class="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.1em] text-[#5a6478]">
			<a href="/" class="no-underline transition-colors hover:text-[#e8edf5]">Home</a>
			<a href="/dashboard" class="no-underline transition-colors hover:text-[#e8edf5]">Dashboard</a>
		</nav>

	</header>

	<div class="flex flex-1">

		<!-- Sidebar -->
		<!-- Mobile toggle -->
<button
	onclick={() => (mobileNavOpen = !mobileNavOpen)}
	class="flex items-center gap-2 border-b border-white/[0.05] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[#5a6478] md:hidden"
>
	☰ Sections
</button>

<aside class="w-full shrink-0 border-r border-white/[0.05] px-4 py-6 md:block md:w-[220px] {mobileNavOpen ? 'block' : 'hidden'}">

	<p class="mb-3 font-mono text-[9px] uppercase tracking-[0.25em] text-[#3a4154]">
		// Docs
	</p>

	<nav class="flex flex-col gap-[2px]">
		{#each sections as section}
			<button
				onclick={() => {
					selectSection(section.id);
					mobileNavOpen = false;
				}}
				class="rounded-sm px-3 py-2 text-left font-mono text-[12px] transition-colors {activeSection === section.id
					? 'bg-[#00ff88]/10 text-[#00ff88]'
					: 'text-[#5a6478] hover:bg-white/[0.03] hover:text-[#e8edf5]'}"
			>
				{section.label}
			</button>
		{/each}
	</nav>

</aside>

		<!-- Content -->
		<main class="flex-1 px-10 py-10">

			<div class="mx-auto max-w-2xl">

				{#if activeSection === 'intro'}

					<p class="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a4154]">
						// Introduction
					</p>

					<h1 class="text-[30px] font-bold text-white">
						What is FrameCode?
					</h1>

					<p class="mt-4 leading-7 text-[#b8c3d6]">
						FrameCode is the platform where developers go from idea to revenue. It brings
						together a browser-based IDE,a Design Hub to create and publish your amazing templates, GitHub integration, ready-to-fork templates, and
						AI-powered conversion analysis into one workspace — so you can go from a blank
						idea to a live, optimized project without switching tools.
					</p>

					<h2 class="mt-8 text-lg font-semibold text-white">
						What it's for
					</h2>

					<ul class="mt-3 space-y-2 text-sm leading-6 text-[#b8c3d6]">
						<li class="flex gap-2"><span class="text-[#00ff88]">→</span> Spinning up a new project from a GitHub repo or a template in seconds</li>
						<li class="flex gap-2"><span class="text-[#00ff88]">→</span> Editing and running code directly in the browser, no local setup required</li>
						<li class="flex gap-2"><span class="text-[#00ff88]">→</span> Getting AI feedback on how well your landing page is likely to convert</li>
						<li class="flex gap-2"><span class="text-[#00ff88]">→</span> Tracking all your projects, activity, and GitHub repos in one dashboard</li>
						<li class="flex gap-2"><span class="text-[#00ff88]">→</span> Designing and publishing Landing pages,Fintech templates and all other types of Templates </li>

					</ul>

					<p class="mt-8 text-sm text-[#5a6478]">
						Use the sidebar to explore each part of FrameCode in more detail.
					</p>

				{:else if activeSection === 'getting-started'}

					<p class="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a4154]">
						// Getting Started
					</p>

					<h1 class="text-[30px] font-bold text-white">
						Getting Started
					</h1>

					<ol class="mt-6 space-y-6">

						<li>
							<p class="font-mono text-[11px] text-[#00ff88]">01</p>
							<p class="mt-1 font-semibold text-white">Create an account</p>
							<p class="mt-1 text-sm leading-6 text-[#b8c3d6]">
								Sign up with email, or continue with GitHub or Google for a faster setup —
								connecting GitHub during sign-in also links your repos automatically.
							</p>
						</li>

						<li>
							<p class="font-mono text-[11px] text-[#00ff88]">02</p>
							<p class="mt-1 font-semibold text-white">Start a project</p>
							<p class="mt-1 text-sm leading-6 text-[#b8c3d6]">
								Head to Fork and either paste a public GitHub repo URL or pick one of our
								templates. Your new project lands straight in the IDE.
							</p>
						</li>

						<li>
							<p class="font-mono text-[11px] text-[#00ff88]">03</p>
							<p class="mt-1 font-semibold text-white">Build and check your score</p>
							<p class="mt-1 text-sm leading-6 text-[#b8c3d6]">
								Edit your project in the IDE, then run it through AI Meter to see a
								conversion score with concrete suggestions for improvement.
							</p>
						</li>

					</ol>

				{:else if activeSection === 'dashboard'}

					<p class="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a4154]">
						// Dashboard
					</p>

					<h1 class="text-[30px] font-bold text-white">
						Dashboard
					</h1>

					<p class="mt-4 leading-7 text-[#b8c3d6]">
						Your home base. The dashboard shows every project you own, at-a-glance stats
						(total projects, how many are forked from templates, your average AI Meter
						score, and how many are linked to GitHub), a running activity log, and quick
						links into your GitHub repos for fast importing.
					</p>

				{:else if activeSection === 'ide'}

					<p class="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a4154]">
						// The IDE
					</p>

					<h1 class="text-[30px] font-bold text-white">
						The IDE
					</h1>

					<p class="mt-4 leading-7 text-[#b8c3d6]">
						A full code editor in your browser, built on CodeMirror. Browse your project's
						file tree, open multiple tabs, and edit with syntax highlighting across
						JavaScript, TypeScript, Svelte, CSS, JSON, and Markdown. Changes to
						GitHub-linked projects autosave back to your repo as you type.
					</p>

					<p class="mt-4 leading-7 text-[#b8c3d6]">
						A built-in preview pane renders HTML projects live, and a terminal panel at the
						bottom lets you run basic commands.
					</p>

				{:else if activeSection === 'fork'}

					<p class="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a4154]">
						// Fork
					</p>

					<h1 class="text-[30px] font-bold text-white">
						Fork
					</h1>

					<p class="mt-4 leading-7 text-[#b8c3d6]">
						The fastest way to start a new project. Fork works two ways: paste any public
						GitHub repository URL to import it directly, or browse the template gallery and
						fork a ready-made starting point. Either way, you land straight in the IDE with
						your new project ready to edit.
					</p>

				{:else if activeSection === 'templates'}

					<p class="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a4154]">
						// Templates
					</p>

					<h1 class="text-[30px] font-bold text-white">
						Templates
					</h1>

					<p class="mt-4 leading-7 text-[#b8c3d6]">
						A curated library of starting points across frameworks and categories. Search,
						filter by category, and fork any template into a new project in one click from
						the Fork page.
					</p>

				{:else if activeSection === 'meter'}

					<p class="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a4154]">
						// AI Meter
					</p>

					<h1 class="text-[30px] font-bold text-white">
						AI Meter
					</h1>

					<p class="mt-4 leading-7 text-[#b8c3d6]">
						Get an AI-generated conversion optimization score for any of your GitHub-linked
						projects. AI Meter locates your project's main landing page, analyzes it, and
						returns a 0–100 score along with specific strengths and improvements — so you
						know exactly what to fix before you ship.
					</p>

					<p class="mt-4 leading-7 text-[#b8c3d6]">
						Currently, AI Meter only works on projects with a linked GitHub repository.
					</p>

				{:else if activeSection === 'github'}

					<p class="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a4154]">
						// GitHub Integration
					</p>

					<h1 class="text-[30px] font-bold text-white">
						GitHub Integration
					</h1>

					<p class="mt-4 leading-7 text-[#b8c3d6]">
						Connect your GitHub account from Settings, or automatically during sign-in with
						GitHub. Once connected, FrameCode can list your repos for quick importing, read
						and write files in the IDE, and power AI Meter's analysis.
					</p>

				{:else if activeSection === 'account'}

					<p class="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a4154]">
						// Account & Settings
					</p>

					<h1 class="text-[30px] font-bold text-white">
						Account & Settings
					</h1>

					<p class="mt-4 leading-7 text-[#b8c3d6]">
						Manage your profile, appearance preferences, security, and connected accounts
						from Settings. You can change your email (with confirmation), connect or manage
						GitHub, and update your display details at any time.
					</p>

				{/if}

			</div>

		</main>

	</div>

</div>