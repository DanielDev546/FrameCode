<script lang="ts">
	import { goto } from '$app/navigation';

	type Project = {
		id: string;
		name: string;
		path: string;
		stack: string;
		lastOpened: string;
		icon: string;
		color: string;
	};

	let search = $state('');
	let selectedAction = $state('');
	let folderInput: HTMLInputElement | undefined;

	let projects = $state<Project[]>([
		{
			id: 'framecode',
			name: 'FrameCode',
			path: '~/Projects/FrameCode',
			stack: 'SvelteKit',
			lastOpened: 'Opened just now',
			icon: 'F',
			color: 'green'
		},
		{
			id: 'sniff',
			name: 'Sniff',
			path: '~/Projects/Sniff',
			stack: 'TypeScript',
			lastOpened: 'Opened yesterday',
			icon: 'S',
			color: 'blue'
		},
		{
			id: 'draftly',
			name: 'Draftly',
			path: '~/Projects/Draftly',
			stack: 'SvelteKit',
			lastOpened: 'Opened 2 days ago',
			icon: 'D',
			color: 'purple'
		}
	]);

	let filteredProjects = $derived(
		projects.filter((project) =>
			project.name.toLowerCase().includes(search.toLowerCase())
		)
	);

	let greeting = $derived(
		new Date().getHours() < 12
			? 'Good morning'
			: new Date().getHours() < 18
				? 'Good afternoon'
				: 'Good evening'
	);

	function openProject(project: Project) {
		goto(`/ide/${project.id}`);
	}

	function createProject() {
		goto('/dashboard/project');
	}

	function browseTemplates() {
		goto('/templates');
	}

	function importFromGithub() {
		goto('/github/repos');
	}

	function openFolderPicker() {
		folderInput?.click();
	}

	function handleFolderSelection(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = input.files;

		if (!files || files.length === 0) return;

		const folderName = files[0].webkitRelativePath.split('/')[0];

		const project: Project = {
			id: crypto.randomUUID(),
			name: folderName,
			path: folderName,
			stack: 'Local project',
			lastOpened: 'Imported just now',
			icon: folderName.charAt(0).toUpperCase(),
			color: 'green'
		};

		projects.unshift(project);
		input.value = '';

		selectedAction = 'folder';
	}

	function handleKeydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
			event.preventDefault();
			openFolderPicker();
		}

		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			document.getElementById('project-search')?.focus();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="studio">
	<!-- HEADER -->
	<header class="topbar">
		<div class="brand">
			<div class="brand-mark">F</div>

			<div class="brand-name">
				<span>framecode</span>
				<span class="studio-label">STUDIO</span>
			</div>
		</div>

		<div class="topbar-right">
			<div class="workspace">
				<span class="workspace-dot"></span>
				Personal workspace
			</div>

			<button class="avatar" aria-label="Account">
				D
			</button>
		</div>
	</header>

	<!-- MAIN -->
	<main class="main">
		<div class="welcome">
			<div class="eyebrow">
				<span class="eyebrow-line"></span>
				<span>YOUR DEVELOPMENT ENVIRONMENT</span>
			</div>

			<div class="hero">
				<div class="hero-copy">
					<p class="greeting">{greeting}.</p>

				<h1 class="welcome-title">
    <span>What are we</span>
    <span>
        building today<span class="title-accent">?</span>
    </span>
</h1>

					<p class="subtitle">
						Start something new, continue where you left off, or bring an
						existing project into FrameCode.
					</p>
				</div>

				<div class="hero-decoration">
					<div class="decoration-grid"></div>

					<div class="floating-code">
						<span class="code-muted">01</span>
						<span class="code-green">const</span>
						<span> project = </span>
						<span class="code-blue">"FrameCode"</span>
					</div>

					<div class="floating-code second">
						<span class="code-muted">02</span>
						<span class="code-green">build</span>
						<span>(project)</span>
					</div>

					<div class="decoration-orb"></div>
				</div>
			</div>

		
<!-- PRIMARY ACTIONS -->
<section class="actions">

    <!-- CREATE PROJECT -->
    <button
        class="action-card primary"
        onclick={handleCreateProject}
    >
        <div class="action-index">
            <span>01</span>
            <span class="action-category">CREATE</span>
        </div>

        <div class="action-main">
            <div class="action-icon create-icon">
                <svg viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
            </div>

            <div class="action-content">
                <h3>New project</h3>
                <p>Start with a clean workspace</p>
            </div>

            <span class="action-arrow">↗</span>
        </div>

        <div class="action-bottom">
            <span>START BUILDING</span>
            <span>FRAMECODE / 001</span>
        </div>
    </button>


    <!-- GITHUB IMPORT -->
    <button
        class="action-card"
        onclick={handleGitHubImport}
    >
        <div class="action-index">
            <span>02</span>
            <span class="action-category">SOURCE CONTROL</span>
        </div>

        <div class="action-main">
            <div class="action-icon github-icon">
                <svg viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.7"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3"/>
                    <path d="M15 21v-3.5c0-1 .1-1.5-.5-2
                        3.3-.4 6.5-1.6 6.5-7A5.4 5.4
                        0 0 0 19.5 4 5 5 0 0 0
                        19.4.5S18.2.1 15 2.2a13
                        13 0 0 0-6 0C5.8.1 4.6.5
                        4.6.5A5 5 0 0 0 4.5 4
                        5.4 5.4 0 0 0 3 7.5c0
                        5.4 3.2 6.6 6.5 7-.6.5-.6
                        1.2-.5 2V21"/>
                </svg>
            </div>

            <div class="action-content">
                <h3>Import repository</h3>
                <p>Bring an existing GitHub project</p>
            </div>

            <span class="action-arrow">↗</span>
        </div>

        <div class="action-bottom">
            <span>CONNECT GITHUB</span>
            <span>FRAMECODE / 002</span>
        </div>
    </button>


    <!-- TEMPLATES -->
    <button
        class="action-card"
        onclick={handleBrowseTemplates}
    >
        <div class="action-index">
            <span>03</span>
            <span class="action-category">QUICK START</span>
        </div>

        <div class="action-main">
            <div class="action-icon template-icon">
                <svg viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.7"
                    stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="3" width="16" height="18" rx="2"/>
                    <path d="M8 8h8M8 12h8M8 16h5"/>
                </svg>
            </div>

            <div class="action-content">
                <h3>Explore templates</h3>
                <p>Find a starting point for your next idea</p>
            </div>

            <span class="action-arrow">↗</span>
        </div>

        <div class="action-bottom">
            <span>EXPLORE LIBRARY</span>
            <span>FRAMECODE / 003</span>
        </div>
    </button>

</section>


<!-- LOCAL PROJECT -->
<button
    class="local-project"
    onclick={handleOpenLocalFolder}
>
    <div class="local-project-icon">
        <svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.7"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
    </div>

    <div class="local-project-content">
        <span class="local-eyebrow">EXISTING WORKSPACE</span>
        <h3>Open project folder</h3>
        <p>Continue working on a project stored on your computer.</p>
    </div>

    <div class="local-project-shortcut">
        <kbd>CTRL</kbd>
        <kbd>O</kbd>
    </div>

    <span class="action-arrow">↗</span>
</button>

			<!-- OPEN LOCAL PROJECT -->
			<button class="open-local" onclick={openFolderPicker}>
				<div class="folder-icon">
					<svg viewBox="0 0 24 24" fill="none">
						<path
							d="M3 6.5A2.5 2.5 0 0 1 5.5 4h4l2 2h7A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5z"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linejoin="round"
						/>
					</svg>
				</div>

				<div class="open-local-copy">
					<strong>Open a local folder</strong>
					<span>Bring a project from your computer</span>
				</div>

				<span class="shortcut">Ctrl O</span>
			</button>

			<input
				bind:this={folderInput}
				type="file"
				webkitdirectory
				directory
				hidden
				onchange={handleFolderSelection}
			/>

			<!-- RECENT PROJECTS -->
			<section class="recent">
				<div class="recent-header">
					<div>
						<div class="section-heading">
							<h2>Recent projects</h2>
							<span class="count">{projects.length.toString().padStart(2, '0')}</span>
						</div>

						<p class="section-description">Pick up exactly where you left off.</p>
					</div>

					<div class="search">
						<svg viewBox="0 0 24 24" fill="none">
							<circle
								cx="10.8"
								cy="10.8"
								r="6.8"
								stroke="currentColor"
								stroke-width="1.6"
							/>
							<path
								d="m16 16 4 4"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linecap="round"
							/>
						</svg>

						<input
							id="project-search"
							bind:value={search}
							placeholder="Search projects"
						/>

						<kbd>⌘ K</kbd>
					</div>
				</div>

				<div class="project-list">
					{#if filteredProjects.length}
						{#each filteredProjects as project (project.id)}
							<button
								class="project-row"
								onclick={() => openProject(project)}
							>
								<div class="project-icon {project.color}">
									{project.icon}
								</div>

								<div class="project-info">
									<strong>{project.name}</strong>
									<span>{project.path}</span>
								</div>

								<div class="project-stack">
									<span class="stack-dot"></span>
									{project.stack}
								</div>

								<div class="project-time">
									{project.lastOpened}
								</div>

								<div class="project-chevron">↗</div>
							</button>
						{/each}
					{:else}
						<div class="empty-search">
							No projects match "{search}".
						</div>
					{/if}
				</div>
			</section>

			<!-- FOOTER -->
			<footer class="footer">
				<div class="footer-status">
					<span class="status-indicator"></span>
					FrameCode Studio
				</div>

				<div class="footer-right">
					<span>Built for the way you build.</span>
					<span class="version">PREVIEW</span>
				</div>
			</footer>
		</div>
	</main>
</div>
<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: #090c10;
		color: #e8edf5;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
			"Segoe UI", sans-serif;
	}

	:global(button),
	:global(input) {
		font: inherit;
	}

	:global(button) {
		cursor: pointer;
	}

	.studio {
		min-height: 100vh;
		background:
			radial-gradient(
				ellipse at 70% 0%,
				rgba(0, 220, 135, 0.045),
				transparent 38%
			),
			#090c10;
	}

	.topbar {
		height: 68px;
		border-bottom: 1px solid #202832;
		padding: 0 36px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(11, 15, 20, 0.94);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.brand-mark {
		width: 35px;
		height: 35px;
		display: grid;
		place-items: center;
		background: #00d887;
		color: #07130e;
		border-radius: 9px;
		font-weight: 900;
		font-size: 18px;
	}

	.brand-name {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 15px;
		font-weight: 750;
		letter-spacing: -0.5px;
	}

	.studio-label {
		font-size: 9px;
		letter-spacing: 1.7px;
		color: #8290a1;
		font-weight: 700;
	}

	.topbar-right {
		display: flex;
		align-items: center;
		gap: 18px;
	}

	.workspace {
		color: #8c9aab;
		font-size: 12px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.workspace-dot {
		width: 6px;
		height: 6px;
		background: #00d887;
		border-radius: 50%;
	}

	.avatar {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		border: 1px solid #293c33;
		background: #172720;
		color: #00d887;
		font-size: 12px;
		font-weight: 700;
	}

	.main {
		padding: 64px 32px 40px;
	}

	.welcome {
		max-width: 1040px;
		margin: 0 auto;
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: 10px;
		color: #8596a9;
		font-size: 10px;
		font-weight: 750;
		letter-spacing: 2px;
	}

	.eyebrow-line {
		width: 22px;
		height: 2px;
		background: #00d887;
	}

	.hero {
		margin-top: 30px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
		min-height: 230px;
		overflow: hidden;
	}

	.hero-copy {
		position: relative;
		z-index: 2;
		max-width: 620px;
	}

	.greeting {
		font-size: 14px;
		color: #8493a5;
		margin: 0 0 10px;
	}

	h1 {
		font-size: clamp(48px, 5.5vw, 72px);
		line-height: 0.99;
		letter-spacing: -5px;
		font-weight: 800;
		margin: 0;
		color: #e8edf5;
	}

	.accent {
		color: #00d887;
	}

	.subtitle {
		margin-top: 22px;
		max-width: 480px;
		font-size: 14px;
		line-height: 1.8;
		color: #8998a9;
	}

	.hero-decoration {
		position: absolute;
		right: 0;
		top: 0;
		width: 330px;
		height: 250px;
		overflow: hidden;
		pointer-events: none;
		opacity: 0.75;
	}

	.decoration-grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(37, 51, 63, 0.3) 1px, transparent 1px),
			linear-gradient(90deg, rgba(37, 51, 63, 0.3) 1px, transparent 1px);
		background-size: 28px 28px;
		mask-image: radial-gradient(ellipse, black, transparent 72%);
	}

	.decoration-orb {
		position: absolute;
		width: 180px;
		height: 180px;
		right: 50px;
		top: 30px;
		border-radius: 50%;
		border: 1px solid rgba(0, 216, 135, 0.16);
		box-shadow:
			0 0 70px rgba(0, 216, 135, 0.06),
			inset 0 0 50px rgba(0, 216, 135, 0.04);
	}

	.floating-code {
		position: absolute;
		top: 80px;
		right: 55px;
		padding: 12px 15px;
		border: 1px solid #26333e;
		background: rgba(16, 22, 29, 0.9);
		border-radius: 9px;
		font-family: monospace;
		font-size: 11px;
		white-space: nowrap;
		transform: rotate(-5deg);
		z-index: 2;
	}

	.floating-code.second {
		top: 150px;
		right: 115px;
		transform: rotate(3deg);
	}

	.code-muted {
		color: #576577;
		margin-right: 8px;
	}

	.code-green {
		color: #00d887;
	}

	.code-blue {
		color: #7fc8ff;
	}

	.actions {
		margin-top: 40px;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}

	.action-card {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		text-align: left;
		min-height: 145px;
		padding: 19px;
		border-radius: 12px;
		border: 1px solid #26313b;
		background: #11171e;
		color: #e8edf5;
		transition:
			border-color 180ms ease,
			background 180ms ease,
			transform 180ms ease;
	}

	.action-card:hover {
		border-color: #3a4b59;
		background: #151d25;
		transform: translateY(-2px);
	}

	.action-card.primary {
		border-color: #28523f;
		background:
			linear-gradient(
				135deg,
				rgba(0, 216, 135, 0.075),
				rgba(16, 22, 29, 0.96)
			);
	}

	.action-card.primary:hover {
		border-color: #00b978;
		background: rgba(0, 216, 135, 0.09);
	}

	.action-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.action-icon {
		width: 36px;
		height: 36px;
		border-radius: 9px;
		display: grid;
		place-items: center;
	}

	.action-icon svg {
		width: 19px;
		height: 19px;
	}

	.create-icon {
		background: rgba(0, 216, 135, 0.12);
		color: #00d887;
	}

	.github-icon {
		background: #202c38;
		color: #9ccfff;
	}

	.template-icon {
		background: #202c38;
		color: #b6c8dc;
	}

	.action-arrow {
		color: #657789;
		font-size: 14px;
		transition: color 180ms ease;
	}

	.action-card:hover .action-arrow {
		color: #00d887;
	}

	.action-content h3 {
		margin: 20px 0 6px;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: -0.15px;
	}

	.action-content p {
		margin: 0;
		font-size: 11px;
		color: #8393a5;
		line-height: 1.6;
	}

	.open-local {
		width: 100%;
		margin-top: 15px;
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 15px 17px;
		border: 1px solid #222e38;
		border-radius: 11px;
		background: rgba(13, 18, 24, 0.8);
		color: #e8edf5;
		text-align: left;
		transition: border-color 180ms ease;
	}

	.open-local:hover {
		border-color: #3b4d5b;
	}

	.folder-icon {
		width: 36px;
		height: 36px;
		border-radius: 9px;
		display: grid;
		place-items: center;
		background: #1b2631;
		color: #a3bfd9;
	}

	.folder-icon svg {
		width: 19px;
		height: 19px;
	}

	.open-local-copy {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
	}

	.open-local-copy strong {
		font-size: 12px;
	}

	.open-local-copy span {
		font-size: 11px;
		color: #8393a5;
	}

	.shortcut {
		border: 1px solid #293540;
		background: #151c24;
		border-radius: 6px;
		padding: 5px 8px;
		font-size: 10px;
		color: #8c9aab;
	}

	.recent {
		margin-top: 55px;
	}

	.recent-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 20px;
		margin-bottom: 22px;
	}

	.section-heading {
		display: flex;
		align-items: center;
		gap: 9px;
	}

	.section-heading h2 {
		font-size: 15px;
		font-weight: 750;
		margin: 0;
		letter-spacing: -0.4px;
	}

	.count {
		font-size: 10px;
		color: #637285;
		background: #151c24;
		border: 1px solid #25303b;
		padding: 3px 6px;
		border-radius: 5px;
	}

	.section-description {
		margin: 8px 0 0;
		font-size: 11px;
		color: #8393a5;
	}

	.search {
		display: flex;
		align-items: center;
		gap: 9px;
		border: 1px solid #28343f;
		background: #11171e;
		border-radius: 8px;
		padding: 9px 11px;
		width: 260px;
	}

	.search svg {
		width: 16px;
		height: 16px;
		color: #8393a5;
		flex-shrink: 0;
	}

	.search input {
		width: 100%;
		background: transparent;
		color: #e8edf5;
		border: none;
		outline: none;
		font-size: 11px;
		min-width: 0;
	}

	.search input::placeholder {
		color: #68788a;
	}

	.search kbd {
		white-space: nowrap;
		font-size: 9px;
		color: #718195;
		border: 1px solid #28343f;
		border-radius: 4px;
		padding: 3px 5px;
	}

	.project-list {
		border-top: 1px solid #25303b;
	}

	.project-row {
		width: 100%;
		display: grid;
		grid-template-columns: 42px minmax(0, 1fr) 130px 135px 20px;
		gap: 16px;
		align-items: center;
		text-align: left;
		padding: 15px 12px;
		border: none;
		border-bottom: 1px solid #25303b;
		background: transparent;
		color: #e8edf5;
		transition: background 180ms ease;
	}

	.project-row:hover {
		background: rgba(255, 255, 255, 0.025);
	}

	.project-icon {
		width: 39px;
		height: 39px;
		display: grid;
		place-items: center;
		border-radius: 10px;
		font-size: 13px;
		font-weight: 800;
		border: 1px solid transparent;
	}

	.project-icon.green {
		background: #142820;
		color: #00d887;
		border-color: #254637;
	}

	.project-icon.blue {
		background: #172a36;
		color: #80d4ff;
		border-color: #264152;
	}

	.project-icon.purple {
		background: #252438;
		color: #c4b5fd;
		border-color: #393750;
	}

	.project-info {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}

	.project-info strong {
		font-size: 12px;
		font-weight: 700;
	}

	.project-info span {
		font-size: 10px;
		color: #8393a5;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.project-stack {
		font-size: 10px;
		color: #8595a8;
		display: flex;
		align-items: center;
		gap: 7px;
	}

	.stack-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #00d887;
		opacity: 0.65;
	}

	.project-time {
		font-size: 10px;
		color: #8393a5;
	}

	.project-chevron {
		color: #64778a;
		font-size: 13px;
		opacity: 0;
		transition: opacity 180ms ease;
	}

	.project-row:hover .project-chevron {
		opacity: 1;
		color: #00d887;
	}

	.empty-search {
		padding: 35px 15px;
		text-align: center;
		font-size: 12px;
		color: #8393a5;
		border-bottom: 1px solid #25303b;
	}

	.footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 25px;
		color: #718195;
		font-size: 10px;
	}

	.footer-status {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-indicator {
		width: 6px;
		height: 6px;
		background: #00d887;
		border-radius: 50%;
	}

	.footer-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.version {
		border: 1px solid #26313b;
		border-radius: 4px;
		padding: 4px 6px;
		font-size: 8px;
		letter-spacing: 1px;
	}

	@media (max-width: 900px) {
		.hero-decoration {
			opacity: 0.25;
		}

		.project-row {
			grid-template-columns: 42px minmax(0, 1fr) 100px 20px;
		}

		.project-time {
			display: none;
		}
	}

	@media (max-width: 650px) {
		.topbar {
			padding: 0 18px;
		}

		.workspace {
			display: none;
		}

		.main {
			padding: 42px 18px;
		}

		.hero {
			min-height: unset;
		}

		.hero-decoration {
			display: none;
		}

h1 {
    font-family: 'Inter Variable', Inter, sans-serif;
    font-size: clamp(48px, 5vw, 68px);
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.052em;

    color: #E8EDF5;
    margin: 0;

    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
}

.accent {
    color: #00D887;
    font-weight: 700;
}


		
.action-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: left;
    min-height: 145px;
    padding: 19px;
    border-radius: 8px;
    border: 1px solid #28323D;
    background: #11171E;
    color: #E8EDF5;
    box-shadow: none;
    transition: background 160ms ease, border-color 160ms ease;
}

.action-card:hover {
    background: #171F28;
    border-color: #465363;
    transform: none;
}

.action-card.primary {
    background: #00D887;
    border-color: #00D887;
    color: #07130E;
}

.action-card.primary:hover {
    background: #00C77C;
    border-color: #00C77C;
}

.action-card.primary .action-content p,
.action-card.primary .action-arrow {
    color: #174B37;
}

.action-card.primary .create-icon {
    background: #08BE7D;
    color: #06170F;
}

.action-icon {
    border-radius: 7px;
}

.open-local {
    background: #10161D;
    border: 1px solid #28323D;
    border-radius: 8px;
    box-shadow: none;
}

.open-local:hover {
    background: #171F28;
    border-color: #465363;
}

.project-row {
    background: transparent;
    border-bottom: 1px solid #25303B;
    border-radius: 0;
    box-shadow: none;
}

.project-row:hover {
    background: #111820;
}


		.recent-header {
			flex-direction: column;
			align-items: stretch;
		}

		.search {
			width: 100%;
		}

		.project-row {
			grid-template-columns: 40px minmax(0, 1fr) 20px;
			gap: 12px;
		}

		.project-stack {
			display: none;
		}

		.footer {
			flex-direction: column;
			align-items: flex-start;
			gap: 15px;
		}
	}

.actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 40px;
}

.action-card {
    min-width: 0;
    min-height: 172px;
    padding: 17px 19px 13px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: left;
    color: #E8EDF5;
    background: #10161D;
    border: 1px solid #29343F;
    border-radius: 7px;
    cursor: pointer;
    transition: background .18s ease, border-color .18s ease;
}

.action-card:hover {
    background: #151D25;
    border-color: #536171;
}

.action-card.primary {
    background: #101C18;
    border-color: #315343;
}

.action-card.primary:hover {
    background: #15251E;
    border-color: #00D887;
}

.action-index {
    display: flex;
    align-items: center;
    gap: 11px;
    color: #657789;
    font-family: monospace;
    font-size: 10px;
}

.action-category {
    color: #8B9AAA;
    letter-spacing: 1.2px;
    font-size: 9px;
}

.action-main {
    display: flex;
    align-items: center;
    gap: 12px;
}

.action-icon,
.local-project-icon {
    width: 39px;
    height: 39px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    background: #202B35;
    color: #B9C9D8;
    border-radius: 6px;
}

.action-icon svg,
.local-project-icon svg {
    width: 19px;
    height: 19px;
}

.create-icon {
    background: #00D887;
    color: #07130E;
}

.action-content {
    flex: 1;
    min-width: 0;
}

.action-content h3,
.local-project-content h3 {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -.3px;
}

.action-content p {
    margin: 0;
    font-size: 11px;
    line-height: 1.6;
    color: #8998A8;
}

.action-arrow {
    color: #78899A;
    font-size: 17px;
    transition: color .18s ease;
}

.action-card:hover .action-arrow,
.local-project:hover .action-arrow {
    color: #00D887;
}

.action-bottom {
    display: flex;
    justify-content: space-between;
    padding-top: 11px;
    border-top: 1px solid #29343F;
    color: #708092;
    font-family: monospace;
    font-size: 8px;
    letter-spacing: .8px;
}

.action-card.primary .action-bottom {
    border-color: #315343;
}

.local-project {
    width: 100%;
    min-height: 88px;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 19px;
    margin-top: 14px;
    text-align: left;
    color: #E8EDF5;
    background: #0E141A;
    border: 1px solid #29343F;
    border-radius: 7px;
    cursor: pointer;
    transition: background .18s ease, border-color .18s ease;
}

.local-project:hover {
    background: #151D25;
    border-color: #536171;
}

.local-project-content {
    flex: 1;
}

.local-eyebrow {
    display: block;
    margin-bottom: 6px;
    color: #00D887;
    font-family: monospace;
    font-size: 9px;
    letter-spacing: 1.1px;
}

.local-project-content p {
    margin: 0;
    color: #8998A8;
    font-size: 11px;
}

.local-project-shortcut {
    display: flex;
    gap: 4px;
}

.local-project-shortcut kbd {
    padding: 5px 7px;
    border: 1px solid #34414E;
    border-radius: 4px;
    background: #171F28;
    color: #AAB8C6;
    font-size: 9px;
}
.welcome-title {
    display: flex;
    flex-direction: column;
    margin: 0;

    font-family: 'Inter Variable', sans-serif;
    font-size: clamp(3.5rem, 5.2vw, 4.75rem);
    font-weight: 650;
    line-height: 1.04;
    letter-spacing: -0.065em;

    color: #e8edf5;

    font-feature-settings: "cv11", "ss01";
    font-optical-sizing: auto;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
}

.title-accent {
    color: #00d887;
    font-weight: 650;
}

@media (max-width: 640px) {
    .welcome-title {
        font-size: clamp(2.7rem, 10vw, 3.5rem);
        letter-spacing: -0.055em;
    }
}

@media (max-width: 700px) {
    .actions {
        grid-template-columns: 1fr;
    }

    .action-card {
        min-height: 155px;
    }
}


:global(html),
:global(body) {
    font-family: 'Inter Variable', sans-serif;
    font-optical-sizing: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>