<script lang="ts">
	let { data } = $props();

	let github = $state({
		connected: !!data.user?.githubUsername,
		username: data.user?.githubUsername ?? "",
		avatar: data.user?.githubAvatar ?? "/default-avatar.png",

		defaultRepo: "FrameCode",
		defaultBranch: "main",

		autoSync: true,
		syncPush: true,
		importReadme: true,
		detectFramework: true,

		lastSync: "2 minutes ago",
		repositoryCount: 14
	});

	const repositories = [
		"FrameCode",
		"StudyHub",
		"Portfolio",
		"DevLion"
	];

	function disconnect() {}

	function syncRepositories() {}
</script>

<div class="space-y-6">

	<!-- ================================= -->
	<!-- GitHub Account -->
	<!-- ================================= -->

	<section class="rounded-xl border border-white/5 bg-white/[0.02] p-6">

		<div class="flex items-center justify-between">

			<div class="flex items-center gap-5">

				<img
					src={github.avatar}
					alt=""
					class="h-20 w-20 rounded-full border border-white/10 object-cover"
				/>

				<div>

					<h2 class="text-xl font-semibold">

						{github.connected
							? github.username
							: "GitHub Not Connected"}

					</h2>

					<p class="mt-1 text-sm text-[#667085]">

						{github.connected
							? `github.com/${github.username}`
							: "Connect your GitHub account to sync repositories."}

					</p>

					<div class="mt-3">

						<span
							class={`rounded-full px-3 py-1 text-xs font-medium ${
								github.connected
									? "bg-[#00ff88]/10 text-[#00ff88]"
									: "bg-white/5 text-[#98A2B3]"
							}`}
						>

							{github.connected
								? "● Connected"
								: "● Not Connected"}

						</span>

					</div>

				</div>

			</div>

			{#if github.connected}

				<button
					onclick={disconnect}
					class="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">

					Disconnect

				</button>

			{:else}

				<button
					class="rounded-lg bg-[#00ff88] px-4 py-2 text-sm font-medium text-black hover:opacity-90">

					Connect GitHub

				</button>

			{/if}

		</div>

	</section>

	<!-- ================================= -->
	<!-- Repository -->
	<!-- ================================= -->

	<section class="rounded-xl border border-white/5 bg-white/[0.02] p-6">

		<h2 class="mb-6 text-lg font-semibold">

			Repository Settings

		</h2>

		<div class="grid gap-5 md:grid-cols-2">

			<div>

				<label class="mb-2 block text-sm text-[#98A2B3]">

					Default Repository

				</label>

				<select
					bind:value={github.defaultRepo}
					class="w-full rounded-lg border border-white/5 bg-[#0B0F17] px-4 py-3 outline-none focus:border-[#00ff88]">

					{#each repositories as repo}

						<option>{repo}</option>

					{/each}

				</select>

			</div>

			<div>

				<label class="mb-2 block text-sm text-[#98A2B3]">

					Default Branch

				</label>

				<select
					bind:value={github.defaultBranch}
					class="w-full rounded-lg border border-white/5 bg-[#0B0F17] px-4 py-3 outline-none focus:border-[#00ff88]">

					<option>main</option>

					<option>dev</option>

					<option>production</option>

				</select>

			</div>

		</div>

	</section>

	<!-- ================================= -->
	<!-- Sync Preferences -->
	<!-- ================================= -->

	<section class="rounded-xl border border-white/5 bg-white/[0.02]">

		<div class="divide-y divide-white/5">

			<label class="flex items-center justify-between p-6">

				<div>

					<p class="font-medium">

						Auto Sync

					</p>

					<p class="text-sm text-[#667085]">

						Automatically sync repositories.

					</p>

				</div>

				<input type="checkbox" bind:checked={github.autoSync} />

			</label>

			<label class="flex items-center justify-between p-6">

				<div>

					<p class="font-medium">

						Push after Save

					</p>

					<p class="text-sm text-[#667085]">

						Automatically push commits after saving.

					</p>

				</div>

				<input type="checkbox" bind:checked={github.syncPush} />

			</label>

			<label class="flex items-center justify-between p-6">

				<div>

					<p class="font-medium">

						Import README

					</p>

					<p class="text-sm text-[#667085]">

						Generate README automatically.

					</p>

				</div>

				<input type="checkbox" bind:checked={github.importReadme} />

			</label>

			<label class="flex items-center justify-between p-6">

				<div>

					<p class="font-medium">

						Detect Framework

					</p>

					<p class="text-sm text-[#667085]">

						Automatically detect Svelte, React, Vue and more.

					</p>

				</div>

				<input type="checkbox" bind:checked={github.detectFramework} />

			</label>

		</div>

	</section>

	<!-- ================================= -->
	<!-- Repository Status -->
	<!-- ================================= -->

	<section class="rounded-xl border border-white/5 bg-white/[0.02] p-6">

		<h2 class="mb-6 text-lg font-semibold">

			Repository Status

		</h2>

		<div class="grid grid-cols-3 gap-6">

			<div>

				<p class="text-sm text-[#667085]">

					Last Sync

				</p>

				<p class="mt-1 font-medium">

					{github.lastSync}

				</p>

			</div>

			<div>

				<p class="text-sm text-[#667085]">

					Repositories

				</p>

				<p class="mt-1 font-medium">

					{github.repositoryCount}

				</p>

			</div>

			<div>

				<p class="text-sm text-[#667085]">

					Branch

				</p>

				<p class="mt-1 font-medium">

					{github.defaultBranch}

				</p>

			</div>

		</div>

		<div class="mt-8 flex gap-3">

			<button
				onclick={syncRepositories}
				class="rounded-lg bg-[#00ff88] px-5 py-3 font-medium text-black hover:opacity-90">

				Sync Now

			</button>

			<button
				onclick={disconnect}
				class="rounded-lg border border-red-500/30 px-5 py-3 text-red-400 hover:bg-red-500/10">

				Disconnect

			</button>

		</div>

	</section>

</div>