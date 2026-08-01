<script lang="ts">
	let { data } = $props();

	let github = $state({
		connected: !!data.user?.githubUsername,
		username: data.user?.githubUsername ?? "",
		avatar: data.user?.githubAvatar ?? "/default-avatar.png",
		defaultRepo: "",
		defaultBranch: "main",
		autoSync: true,
		syncPush: true,
		importReadme: true,
		detectFramework: true
	});

	const repositories = [
		"FrameCode",
		"StudyHub",
		"Portfolio",
		"DevLion"
	];

	async function syncRepositories() {}

	async function disconnect() {}
</script>
<div class="border border-white/[0.05] rounded-xl p-6 flex items-center gap-5">

	<img
		src={github.avatar}
		class="w-20 h-20 rounded-full border border-white/[0.08]"
	/>

	<div class="flex-1">

		<h2 class="text-xl font-semibold">
			{github.username || "Not Connected"}
		</h2>

		<p class="text-[#5a6478]">
			{github.username ? `github.com/${github.username}` : "Connect your GitHub account"}
		</p>

		<div class="mt-2">
			<span
				class="px-2 py-1 rounded-full text-[11px]
				bg-[#00ff88]/10
				text-[#00ff88]"
			>

				{github.connected ? "Connected" : "Disconnected"}

			</span>
		</div>

	</div>

</div><br>

<section class="p-7">
<div>
<p class="mb-2 font-semibold">
	Default Repository
</p>

<select bind:value={github.defaultRepo} class="w-full">

	<option>Select Repository</option>

	{#each repositories as repo}
		<option>{repo}</option>
	{/each}

</select>

</div>
<div>

<p class="mb-2 font-semibold">
	Default Branch
</p>

<select bind:value={github.defaultBranch} class="w-full">

	<option>main</option>

	<option>dev</option>

	<option>production</option>

</select>

</div>
<div class="space-y-4">

<label>

<input type="checkbox" bind:checked={github.autoSync} />

Auto Sync

</label>

<label>

<input type="checkbox" bind:checked={github.syncPush} />

Push after Save

</label>

<label>

<input type="checkbox" bind:checked={github.importReadme} />

Import README

</label>

<label>

<input type="checkbox" bind:checked={github.detectFramework} />

Detect Framework

</label>

</div>

</section>