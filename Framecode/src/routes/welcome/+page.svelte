
<script lang="ts">
    import { goto } from '$app/navigation'

    let search = $state('')

    const projects = [
        { id: 'framecode', name: 'FrameCode', path: '~/Projects/FrameCode', language: 'SvelteKit', time: 'Opened just now', color: '#00df87' },
        { id: 'sniff', name: 'Sniff', path: '~/Projects/Sniff', language: 'TypeScript', time: 'Opened yesterday', color: '#36bde8' },
        { id: 'draftly', name: 'Draftly', path: '~/Projects/Draftly', language: 'SvelteKit', time: 'Opened 2 days ago', color: '#ad91ef' }
    ]

    const templates = [
        { name: 'SvelteKit', description: 'Full-stack application', color: '#ff895e' },
        { name: 'React', description: 'Frontend application', color: '#61c9ee' },
        { name: 'Hono API', description: 'Backend service', color: '#00df87' }
    ]

    let filtered = $derived(
        projects.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
        )
    )

    function openProject(id: string) {
        console.log('Open project:', id)
        // Connect to the existing project workspace route.
    }

    function createProject() {
        goto('/project')
    }

    function importGitHub() {
        goto('/auth/github')
    }

    function openTemplates() {
        goto('/templates')
    }
</script>

<svelte:head>
    <title>FrameCode — Welcome</title>
</svelte:head>

<div class="launchpad">
    <header class="app-header">
        <a href="/" class="brand">
            <span class="brand-icon">F</span>
            <span>framecode</span>
            <span class="desktop-label">DESKTOP</span>
        </a>

        <div class="header-right">
            <span class="version">Personal workspace</span>
            <button class="avatar" title="Account">D</button>
        </div>
    </header>

    <main class="content">

        <section class="welcome">
            <div class="welcome-kicker">
                <span class="green-line"></span>
                YOUR DEVELOPMENT ENVIRONMENT
            </div>

            <h1>What are we<br />building today<span>?</span></h1>

            <p>
                Start something new, continue where you left off,
                or bring an existing project into FrameCode.
            </p>
        </section>

        <section class="actions">
            <button class="action primary" onclick={createProject}>
                <span class="action-icon">＋</span>
                <span class="action-copy">
                    <strong>Create new project</strong>
                    <small>Start with a blank workspace</small>
                </span>
                <span class="action-arrow">↗</span>
            </button>

            <button class="action" onclick={importGitHub}>
                <span class="action-icon github">⌘</span>
                <span class="action-copy">
                    <strong>Import from GitHub</strong>
                    <small>Continue with an existing repository</small>
                </span>
                <span class="action-arrow">↗</span>
            </button>

            <button class="action" onclick={openTemplates}>
                <span class="action-icon template">▤</span>
                <span class="action-copy">
                    <strong>Browse templates</strong>
                    <small>Choose a project starter</small>
                </span>
                <span class="action-arrow">↗</span>
            </button>
        </section>

        <section class="recent">
            <div class="section-heading">
                <div>
                    <h2>Recent projects</h2>
                    <p>Pick up exactly where you left off.</p>
                </div>

                <label class="search">
                    <span>⌕</span>
                    <input bind:value={search} placeholder="Search projects" />
                </label>
            </div>

            <div class="recent-list">
                {#each filtered as project}
                    <button
                        class="recent-item"
                        onclick={() => openProject(project.id)}
                    >
                        <span
                            class="project-icon"
                            style={`--project-color:${project.color}`}
                        >
                            {project.name.charAt(0)}
                        </span>

                        <span class="project-info">
                            <strong>{project.name}</strong>
                            <small>{project.path}</small>
                        </span>

                        <span class="project-language">{project.language}</span>
                        <span class="project-time">{project.time}</span>
                        <span class="open-arrow">↗</span>
                    </button>
                {/each}

                {#if filtered.length === 0}
                    <div class="empty">No matching projects.</div>
                {/if}
            </div>

            <button class="all-projects" onclick={() => search = ''}>
                Show all recent projects <span>→</span>
            </button>
        </section>

        <section class="templates">
            <div class="template-heading">
                <h2>Quick start</h2>
                <button onclick={openTemplates}>All templates →</button>
            </div>

            <div class="template-list">
                {#each templates as template}
                    <button class="template-item" onclick={openTemplates}>
                        <span
                            class="template-icon"
                            style={`--template-color:${template.color}`}
                        >
                            {template.name.charAt(0)}
                        </span>

                        <span>
                            <strong>{template.name}</strong>
                            <small>{template.description}</small>
                        </span>

                        <span class="template-arrow">↗</span>
                    </button>
                {/each}
            </div>
        </section>

        <footer>
            <span>FRAMECODE DESKTOP</span>
            <span>Made for the work that matters.</span>
        </footer>
    </main>
</div>

<style>
    :global(*) {
        box-sizing: border-box;
    }

    :global(body) {
        margin: 0;
        background: #0d1117;
        color: #e6eaf0;
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    :global(button), :global(input) {
        font: inherit;
    }

    button {
        cursor: pointer;
    }

    .launchpad {
        min-height: 100vh;
        background: #0d1117;
    }

    .app-header {
        height: 64px;
        padding: 0 6%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #252d37;
    }

    .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: #edf1f5;
        font-size: 17px;
        font-weight: 750;
        letter-spacing: -.6px;
    }

    .brand-icon {
        display: grid;
        place-items: center;
        width: 29px;
        height: 29px;
        border-radius: 6px;
        background: #00df87;
        color: #07140e;
        font-weight: 900;
    }

    .desktop-label {
        margin-left: 4px;
        color: #687584;
        font-size: 9px;
        font-weight: 650;
        letter-spacing: 1.2px;
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 18px;
    }

    .version {
        font-size: 10px;
        color: #8592a0;
    }

    .avatar {
        width: 29px;
        height: 29px;
        border: 1px solid #34433c;
        border-radius: 50%;
        background: #1b2c25;
        color: #00df87;
        font-size: 11px;
        font-weight: 700;
    }

    .content {
        width: min(850px, calc(100% - 48px));
        margin: 0 auto;
        padding: 70px 0 28px;
    }

    .welcome {
        margin-bottom: 35px;
    }

    .welcome-kicker {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #8995a3;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.5px;
        margin-bottom: 19px;
    }

    .green-line {
        width: 17px;
        height: 2px;
        background: #00df87;
    }

    h1 {
        margin: 0;
        font-size: clamp(38px, 5vw, 53px);
        line-height: 1.12;
        letter-spacing: -2.7px;
        font-weight: 680;
    }

    h1 span {
        color: #00df87;
    }

    .welcome > p {
        margin: 15px 0 0;
        max-width: 470px;
        color: #929eac;
        font-size: 12px;
        line-height: 1.8;
    }

    .actions {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 11px;
        margin-bottom: 57px;
    }

    .action {
        min-height: 104px;
        padding: 15px;
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 11px;
        position: relative;
        border: 1px solid #2a3440;
        border-radius: 6px;
        background: #141b23;
        color: #e6eaf0;
        text-align: left;
        transition: border-color .15s, background .15s;
    }

    .action:hover {
        border-color: #647283;
        background: #19222c;
    }

    .action.primary {
        border-color: #365445;
        background: #17221e;
    }

    .action.primary:hover {
        border-color: #00df87;
    }

    .action-icon {
        width: 29px;
        height: 29px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        border-radius: 5px;
        background: #20392d;
        color: #00df87;
        font-size: 18px;
    }

    .action-icon.github,
    .action-icon.template {
        color: #c4ced8;
        background: #222d38;
    }

    .action-copy {
        display: grid;
        gap: 6px;
        padding-top: 2px;
    }

    .action-copy strong {
        font-size: 11px;
        font-weight: 650;
    }

    .action-copy small {
        font-size: 9px;
        line-height: 1.5;
        color: #8794a2;
    }

    .action-arrow {
        position: absolute;
        right: 13px;
        top: 14px;
        color: #748291;
        font-size: 13px;
    }

    .section-heading {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 15px;
        margin-bottom: 16px;
    }

    h2 {
        margin: 0;
        font-size: 14px;
        font-weight: 680;
        letter-spacing: -.2px;
    }

    .section-heading p {
        color: #8592a0;
        margin: 6px 0 0;
        font-size: 10px;
    }

    .search {
        height: 31px;
        width: 190px;
        padding: 0 9px;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid #2b3540;
        border-radius: 5px;
        color: #83909e;
        background: #111820;
    }

    .search input {
        width: 100%;
        min-width: 0;
        background: transparent;
        border: 0;
        outline: 0;
        color: white;
        font-size: 10px;
    }

    .recent-list {
        border-top: 1px solid #29333d;
    }

    .recent-item {
        display: grid;
        grid-template-columns: 36px minmax(140px, 1fr) 135px 110px 16px;
        gap: 13px;
        align-items: center;
        width: 100%;
        min-height: 65px;
        padding: 9px 10px;
        border: 0;
        border-bottom: 1px solid #29333d;
        background: transparent;
        color: #e5eaf0;
        text-align: left;
        transition: background .15s;
    }

    .recent-item:hover {
        background: #151d26;
    }

    .project-icon {
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        border-radius: 5px;
        background: color-mix(in srgb, var(--project-color) 12%, #172029);
        color: var(--project-color);
        font-weight: 750;
        font-size: 13px;
    }

    .project-info {
        display: grid;
        gap: 5px;
        min-width: 0;
    }

    .project-info strong {
        font-size: 11px;
    }

    .project-info small {
        font-size: 9px;
        color: #788694;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .project-language, .project-time {
        color: #84919f;
        font-size: 9px;
    }

    .open-arrow {
        color: #718090;
        opacity: 0;
    }

    .recent-item:hover .open-arrow {
        opacity: 1;
    }

    .empty {
        padding: 25px;
        text-align: center;
        color: #84919f;
        font-size: 11px;
    }

    .all-projects {
        margin-top: 13px;
        border: 0;
        background: transparent;
        color: #a7b2bf;
        font-size: 10px;
    }

    .all-projects:hover {
        color: #00df87;
    }

    .all-projects span {
        margin-left: 6px;
    }

    .templates {
        margin-top: 48px;
    }

    .template-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
    }

    .template-heading button {
        border: 0;
        background: transparent;
        color: #9ba8b5;
        font-size: 10px;
    }

    .template-heading button:hover {
        color: #00df87;
    }

    .template-list {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
    }

    .template-item {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 13px 11px;
        background: transparent;
        border: 1px solid #29333d;
        border-radius: 5px;
        text-align: left;
        color: #e6eaf0;
        transition: background .15s, border-color .15s;
    }

    .template-item:hover {
        background: #151d26;
        border-color: #536170;
    }

    .template-icon {
        width: 30px;
        height: 30px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        border-radius: 5px;
        color: var(--template-color);
        background: color-mix(in srgb, var(--template-color) 12%, #172029);
        font-size: 13px;
        font-weight: 750;
    }

    .template-item > span:nth-child(2) {
        display: grid;
        gap: 5px;
        min-width: 0;
    }

    .template-item strong {
        font-size: 10px;
    }

    .template-item small {
        color: #8592a0;
        font-size: 8px;
        white-space: nowrap;
    }

    .template-arrow {
        margin-left: auto;
        color: #73808e;
    }

    footer {
        display: flex;
        justify-content: space-between;
        margin-top: 57px;
        padding-top: 16px;
        border-top: 1px solid #252e38;
        color: #65717f;
        font-size: 8px;
        letter-spacing: .8px;
    }

    @media (max-width: 650px) {
        .content {
            padding-top: 45px;
        }

        .actions {
            grid-template-columns: 1fr;
            margin-bottom: 40px;
        }

        .action {
            min-height: 75px;
        }

        .recent-item {
            grid-template-columns: 36px minmax(0, 1fr) 15px;
        }

        .project-language, .project-time {
            display: none;
        }

        .template-list {
            grid-template-columns: 1fr;
        }

        .section-heading {
            align-items: flex-start;
            flex-direction: column;
        }

        .search {
            width: 100%;
        }
    }
</style>
