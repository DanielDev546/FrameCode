
<script lang="ts">
    import { onMount } from "svelte";

    import DashboardLayout from "$lib/layout/DashboardLayout.svelte";
    import CreateProjectModal from "$lib/components/CreateProjectModal.svelte";

    let { data } = $props();

    let showCreateModal = $state(false);

    let projects = $state(data.projects ?? []);
    let activity = $state(data.activity ?? []);

    type Repo = {
        name: string;
        fullName: string;
        url: string;
        description: string | null;
        language: string | null;
        stars: number;
        updatedAt: string;
        isPrivate: boolean;
        cloneUrl: string;
    };

    type Project = {
        id: string;
        userId: string;
        templateId: string | null;
        name: string;
        slug: string;
        framework: string;
        repoUrl: string | null;
        deployUrl: string | null;
        status: "draft" | "dev" | "live" | "paused";
        meterScore: number | null;
        meterData: string | null;
        createdAt: Date;
        updatedAt: Date;
    };

    let repos = $state<Repo[]>([]);
    let reposLoading = $state(false);

    onMount(() => {
        loadRepos();
    });

    async function loadRepos() {
        reposLoading = true;

        try {
            const res = await fetch("/api/github/repos");

            if (res.ok) {
                repos = await res.json();
            }
        } catch (err) {
            console.error(err);
        } finally {
            reposLoading = false;
        }
    }

    async function deleteProject(id: string) {
        const res = await fetch(`/api/projects/${id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            projects = projects.filter((p) => p.id !== id);
        }
    }

    async function importRepo(repo: Repo) {
        const res = await fetch("/api/github/import", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(repo)
        });

        if (res.ok) {
            const project = await res.json();
            projects = [project, ...projects];
        }
    }

    let stats = $derived([
        {
            label: "Projects",
            val: String(projects.length),
            sub: `${projects.filter((p) => p.status === "live").length} live`
        },
        {
            label: "Forked",
            val: 2,
            sub: "templates"
        },
        {
            label: "Avg Score",
            val
                : "3",
            sub: "AI Meter"
        },
        {
            label: "Repos",
            val: String(projects.filter((p) => p.repoUrl).length),
            sub: "linked"
        }
    ]);

    function scoreColor(score: number) {
        if (score >= 80) return "var(--fc-success)";
        if (score >= 60) return "var(--fc-text-secondary)";
        return "var(--fc-text-muted)";
    }

    function statusColor(status: Project["status"]) {
        if (status === "live") return "var(--fc-success)";
        if (status === "paused") return "var(--fc-text-muted)";
        return "var(--fc-text-secondary)";
    }

    function openCreateModal() {
        showCreateModal = true;
    }
</script>

<DashboardLayout active="dashboard" {data}>
    <div class="min-h-full bg-[var(--fc-bg)] text-[var(--fc-text)] [scrollbar-width:thin] [scrollbar-color:var(--fc-border)_transparent]">
        <div class="p-4 sm:p-5 md:p-7">

            <!-- GREETING -->
            <div class="mb-6 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p class="mb-2 font-mono text-[9px] tracking-[0.2em] text-[var(--fc-text-muted)] sm:text-[10px]">
                        DASHBOARD · {new Date().toLocaleDateString(undefined, {
                            weekday: "short",
                            day: "2-digit",
                            month: "short"
                        }).toUpperCase()}
                    </p>

                    <h1 class="font-display text-[25px] font-bold leading-none tracking-[-0.5px] text-[var(--fc-text)] sm:text-[26px]">
                        Hey {data.user?.name?.split(" ")[0] ?? "Developer"}.
                    </h1>

                    <p class="mt-2 font-mono text-[9px] text-[var(--fc-text-muted)]">
                        Welcome back to FrameCode.
                    </p>
                </div>

                <button
                    onclick={openCreateModal}
                    class="w-full cursor-pointer border border-[var(--fc-accent)]/30 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--fc-accent)] transition-colors hover:border-[var(--fc-accent)]/60 hover:bg-[var(--fc-accent-soft)] sm:w-auto sm:py-[8px] sm:text-[11px]"
                >
                    + New Project
                </button>
            </div>

            <!-- STATS -->
            <div class="mb-7 grid grid-cols-2 gap-px border border-[var(--fc-border)] bg-[var(--fc-border)] md:mb-8 md:grid-cols-4">
                {#each stats as s}
                    <div class="min-w-0 bg-[var(--fc-panel)] px-4 py-4 sm:px-5 sm:py-5">
                        <p class="mb-2 truncate font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--fc-text-muted)] sm:mb-3 sm:text-[9px]">
                            {s.label}
                        </p>

                        <p class="mb-1 font-display text-[25px] font-bold leading-none tracking-[-1px] text-[var(--fc-text)] sm:text-[32px]">
                            {s.val}
                        </p>

                        <p class="font-mono text-[8px] text-[var(--fc-text-muted)] sm:text-[9px]">
                            {s.sub}
                        </p>
                    </div>
                {/each}
            </div>

            <!-- MAIN GRID -->
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">

                <!-- LEFT COLUMN -->
                <div class="min-w-0">

                    <!-- PROJECTS HEADER -->
                    <div class="mb-4 flex items-center justify-between">
                        <p class="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--fc-text-muted)]">
                            // Projects
                        </p>

                        <a
                            href="/projects"
                            class="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--fc-text-muted)] transition-colors hover:text-[var(--fc-accent)]"
                        >
                            View all
                        </a>
                    </div>

                    <!-- DESKTOP PROJECT TABLE -->
                    <div class="hidden border border-[var(--fc-border)] md:block">
                        <div class="grid grid-cols-[minmax(0,1fr)_80px_60px_60px_80px] border-b border-[var(--fc-border)] px-5 py-2">
                            {#each ["Project", "Stack", "Score", "Status", ""] as heading}
                                <p class="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--fc-text-muted)]">
                                    {heading}
                                </p>
                            {/each}
                        </div>

                        {#if projects.length === 0}
                            <div class="px-5 py-8 text-center font-mono text-[11px] text-[var(--fc-text-muted)]">
                                No projects yet — create one to get started
                            </div>
                        {:else}
                            {#each projects as p}
                                <div class="group grid grid-cols-[minmax(0,1fr)_80px_60px_60px_80px] items-center border-b border-[var(--fc-border)] px-5 py-[13px] transition-colors last:border-0 hover:bg-[var(--fc-panel-hover)]">
                                    <div class="flex min-w-0 items-center gap-2">
                                        {#if p.repoUrl}
                                            <svg class="h-[9px] w-[9px] shrink-0 text-[var(--fc-text-muted)]" viewBox="0 0 24 24" fill="currentColor" aria-label="GitHub project">
                                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                                            </svg>
                                        {:else}
                                            <span class="font-mono text-[8px] text-[var(--fc-accent)]">[FC]</span>
                                        {/if}

                                        <p class="truncate font-mono text-[12px] text-[var(--fc-text)]">
                                            {p.name}
                                        </p>
                                    </div>

                                    <p class="truncate font-mono text-[10px] text-[var(--fc-text-muted)]">
                                        {p.framework}
                                    </p>

                                    <p class="font-mono text-[11px]" style:color={scoreColor(p.meterScore ?? 0)}>
                                        {p.meterScore ?? "--"}
                                    </p>

                                    <p class="font-mono text-[9px] uppercase tracking-[0.1em]" style:color={statusColor(p.status)}>
                                        {p.status}
                                    </p>

                                    <div class="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <a
                                            href="/ide/{p.id}"
                                            class="border border-[var(--fc-border)] px-2 py-1 font-mono text-[9px] text-[var(--fc-text-muted)] no-underline transition-colors hover:border-[var(--fc-accent)]/40 hover:text-[var(--fc-accent)]"
                                        >
                                            IDE
                                        </a>

                                        {#if p.repoUrl}
                                            <a
                                                href={p.repoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label="Open GitHub repository"
                                                class="border border-[var(--fc-border)] px-2 py-1 font-mono text-[9px] text-[var(--fc-text-muted)] no-underline transition-colors hover:text-[var(--fc-text)]"
                                            >
                                                ↗
                                            </a>
                                        {:else}
                                            <button
                                                type="button"
                                                class="border border-[var(--fc-border)] px-2 py-1 font-mono text-[9px] text-[var(--fc-text-muted)] transition-colors hover:text-[var(--fc-info)]"
                                            >
                                                Push →
                                            </button>
                                        {/if}

                                        <button
                                            type="button"
                                            onclick={() => deleteProject(p.id)}
                                            aria-label={`Delete ${p.name}`}
                                            class="border border-[var(--fc-border)] px-2 py-1 font-mono text-[9px] text-[var(--fc-text-muted)] transition-colors hover:border-[var(--fc-danger)]/30 hover:text-[var(--fc-danger)]"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>

                    <!-- MOBILE PROJECT CARDS -->
                    <div class="md:hidden">
                        {#if projects.length === 0}
                            <div class="border border-[var(--fc-border)] px-5 py-10 text-center font-mono text-[10px] text-[var(--fc-text-muted)]">
                                No projects yet
                                <span class="mt-1 block">Create one to get started</span>
                            </div>
                        {:else}
                            <div class="flex flex-col gap-2">
                                {#each projects as p}
                                    <div class="border border-[var(--fc-border)] bg-[var(--fc-panel)] p-4 transition-colors active:bg-[var(--fc-panel-hover)]">
                                        <div class="flex items-start justify-between gap-3">
                                            <div class="flex min-w-0 items-center gap-2">
                                                {#if p.repoUrl}
                                                    <span class="font-mono text-[9px] text-[var(--fc-text-muted)]">GH</span>
                                                {:else}
                                                    <span class="font-mono text-[8px] text-[var(--fc-accent)]">[FC]</span>
                                                {/if}

                                                <p class="truncate font-mono text-[12px] font-medium text-[var(--fc-text)]">
                                                    {p.name}
                                                </p>
                                            </div>

                                            <span class="shrink-0 border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em]"
                                                class:border-[var(--fc-success)]={p.status === "live"}
                                                class:text-[var(--fc-success)]={p.status === "live"}
                                                class:border-[var(--fc-border)]={p.status !== "live"}
                                                class:text-[var(--fc-text-muted)]={p.status !== "live"}
                                            >
                                                {p.status}
                                            </span>
                                        </div>

                                        <div class="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--fc-border)] pt-3">
                                            <div>
                                                <p class="font-mono text-[8px] uppercase text-[var(--fc-text-muted)]">Stack</p>
                                                <p class="mt-1 truncate font-mono text-[9px] text-[var(--fc-text-secondary)]">{p.framework}</p>
                                            </div>

                                            <div>
                                                <p class="font-mono text-[8px] uppercase text-[var(--fc-text-muted)]">Score</p>
                                                <p class="mt-1 font-mono text-[10px]" style:color={scoreColor(p.meterScore ?? 0)}>
                                                    {p.meterScore ?? "--"}
                                                </p>
                                            </div>

                                            <div>
                                                <p class="font-mono text-[8px] uppercase text-[var(--fc-text-muted)]">Source</p>
                                                <p class="mt-1 font-mono text-[9px] text-[var(--fc-text-secondary)]">
                                                    {p.repoUrl ? "GitHub" : "FrameCode"}
                                                </p>
                                            </div>
                                        </div>

                                        <div class="mt-4 flex gap-2">
                                            <a
                                                href="/ide/{p.id}"
                                                class="flex-1 border border-[var(--fc-accent)]/30 px-3 py-2 text-center font-mono text-[9px] text-[var(--fc-accent)] no-underline transition-colors hover:bg-[var(--fc-accent-soft)]"
                                            >
                                                Open IDE
                                            </a>

                                            {#if p.repoUrl}
                                                <a
                                                    href={p.repoUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label="Open GitHub repository"
                                                    class="border border-[var(--fc-border)] px-3 py-2 font-mono text-[9px] text-[var(--fc-text-muted)] no-underline"
                                                >
                                                    ↗
                                                </a>
                                            {/if}

                                            <button
                                                type="button"
                                                onclick={() => deleteProject(p.id)}
                                                aria-label={`Delete ${p.name}`}
                                                class="border border-[var(--fc-border)] px-3 py-2 font-mono text-[9px] text-[var(--fc-text-muted)] transition-colors hover:text-[var(--fc-danger)]"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    <!-- ACTIVITY -->
                    <div class="mt-5 border border-[var(--fc-border)] bg-[var(--fc-panel)]">
                        <div class="flex items-center justify-between border-b border-[var(--fc-border)] px-4 py-3">
                            <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--fc-text-muted)]">
                                // Activity
                            </p>

                            <span class="font-mono text-[8px] text-[var(--fc-text-muted)]">
                                {activity.length} events
                            </span>
                        </div>

                        <div class="flex flex-col gap-[8px] px-4 py-4 font-mono text-[10px] sm:text-[11px]">
                            {#if activity.length === 0}
                                <div class="text-[10px] text-[var(--fc-text-muted)]">
                                    No activity yet
                                </div>
                            {:else}
                                {#each activity as item}
                                    <div class="flex items-start gap-3">
                                        <span class="shrink-0 text-[var(--fc-success)]">✓</span>

                                        <span class="min-w-0 flex-1 text-[var(--fc-text-secondary)]">
                                            {item.message}
                                        </span>

                                        <span class="shrink-0 text-[8px] text-[var(--fc-text-muted)]">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                {/each}
                            {/if}

                            <div class="mt-1 flex items-center gap-3">
                                <span class="text-[var(--fc-accent)]">❯</span>
                                <span class="inline-block h-[11px] w-[6px] animate-[blink_1.1s_step-end_infinite] bg-[var(--fc-text-muted)]"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT COLUMN -->
                <div class="flex flex-col gap-5">

                    <!-- QUICK ACTIONS -->
                    <div>
                        <p class="mb-3 font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--fc-text-muted)]">
                            // Actions
                        </p>

                        <div class="grid grid-cols-2 gap-px border border-[var(--fc-border)] bg-[var(--fc-border)] lg:flex lg:flex-col">
                            {#each [
                                {
                                    label: "New Project",
                                    action: () => showCreateModal = true
                                },
                                {
                                    label: "Browse Templates",
                                    action: () => window.location.href = "/templates"
                                },
                                {
                                    label: "Run AI Meter",
                                    action: () => window.location.href = "/meter"
                                },
                                {
                                    label: "Sync GitHub",
                                    action: () => loadRepos()
                                }
                            ] as item}
                                <button
                                    type="button"
                                    onclick={item.action}
                                    class="flex items-center gap-3 bg-[var(--fc-panel)] px-4 py-3 text-left font-mono text-[10px] text-[var(--fc-text-secondary)] transition-colors hover:bg-[var(--fc-panel-hover)] hover:text-[var(--fc-text)] lg:py-[10px] lg:text-[11px]"
                                >
                                    <span class="text-[var(--fc-accent)]">❯</span>
                                    {item.label}
                                </button>
                            {/each}
                        </div>
                    </div>

                    <!-- AI METER -->
                    <div>
                        <p class="mb-3 font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--fc-text-muted)]">
                            // AI Meter
                        </p>

                        <div class="border border-[var(--fc-border)] bg-[var(--fc-panel)] p-4">
                            <div class="mb-4 flex items-center justify-between">
                                <p class="font-mono text-[10px] text-[var(--fc-text-secondary)]">
                                    saas-hero-v2
                                </p>

                                <p class="font-mono text-[11px] text-[var(--fc-success)]">
                                    94
                                </p>
                            </div>

                            {#each [
                                ["CTA", 94, "var(--fc-success)"],
                                ["Copy", 87, "var(--fc-success)"],
                                ["Perf", 71, "var(--fc-text-secondary)"],
                                ["Mobile", 58, "var(--fc-text-muted)"],
                                ["Trust", 32, "var(--fc-danger)"]
                            ] as [label, value, color]}
                                <div class="mb-[10px]">
                                    <div class="mb-1 flex justify-between">
                                        <span class="font-mono text-[9px] text-[var(--fc-text-muted)]">
                                            {label}
                                        </span>

                                        <span class="font-mono text-[9px]" style:color={color}>
                                            {value}%
                                        </span>
                                    </div>

                                    <div class="h-[3px] bg-[var(--fc-border)]">
                                        <div
                                            class="h-[3px] transition-all"
                                            style:width={`${value}%`}
                                            style:background={color}
                                        ></div>
                                    </div>
                                </div>
                            {/each}

                            <button
                                type="button"
                                onclick={() => window.location.href = "/meter"}
                                class="mt-2 w-full border border-[var(--fc-border)] py-[9px] font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--fc-text-muted)] transition-colors hover:border-[var(--fc-accent)]/40 hover:text-[var(--fc-accent)]"
                            >
                                Full Analysis →
                            </button>
                        </div>
                    </div>

                    <!-- GITHUB REPOS -->
                    <div>
                        <p class="mb-3 font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--fc-text-muted)]">
                            // Repos
                        </p>

                        <div class="flex flex-col gap-px border border-[var(--fc-border)] bg-[var(--fc-border)]">
                            {#if reposLoading}
                                <div class="bg-[var(--fc-panel)] px-4 py-3 font-mono text-[10px] text-[var(--fc-text-muted)]">
                                    Syncing...
                                </div>
                            {:else if repos.length === 0}
                                <div class="bg-[var(--fc-panel)] px-4 py-3 font-mono text-[10px] text-[var(--fc-text-muted)]">
                                    No repos — sign in with GitHub
                                </div>
                            {:else}
                                {#each repos.slice(0, 5) as repo}
                                    <div class="group flex items-center gap-3 bg-[var(--fc-panel)] px-4 py-[10px] transition-colors hover:bg-[var(--fc-panel-hover)]">
                                        <svg class="h-[10px] w-[10px] shrink-0 text-[var(--fc-text-muted)]" viewBox="0 0 24 24" fill="currentColor" aria-label="GitHub repository">
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57-.015-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                                        </svg>

                                        <span class="flex-1 truncate font-mono text-[10px] text-[var(--fc-text-secondary)]">
                                            {repo.name}
                                        </span>

                                        <span class="hidden font-mono text-[9px] text-[var(--fc-text-muted)] sm:inline">
                                            {repo.language ?? "—"}
                                        </span>

                                        <button
                                            type="button"
                                            onclick={() => importRepo(repo)}
                                            class="border border-[var(--fc-border)] px-2 py-1 font-mono text-[9px] text-[var(--fc-text-muted)] transition-colors hover:border-[var(--fc-accent)]/30 hover:text-[var(--fc-accent)] lg:opacity-0 lg:group-hover:opacity-100"
                                        >
                                            Import →
                                        </button>
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <CreateProjectModal
            open={showCreateModal}
            onClose={() => showCreateModal = false}
            onCreated={(project: Project) => {
                projects = [project, ...projects];
                showCreateModal = false;
            }}
        />
    </div>
</DashboardLayout>
