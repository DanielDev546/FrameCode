<script lang="ts">

	let { data } = $props();

	let profile = $state({
		name: data.user?.name ?? "",
		username: data.user?.username ?? "",
		bio: data.user?.bio ?? "",
		website: data.user?.website ?? "",
		location: data.user?.location ?? ""
	});

	async function saveProfile() {
		console.log(profile);

		// later:
		// await fetch("/api/settings/profile")
	}

</script>
<div class="p-8 border-b border-white/[0.05]">

	<p class="font-mono text-[10px] uppercase tracking-[0.25em] text-[#3a4154]">
		// Profile
	</p>

	<h1 class="mt-2 text-[30px] font-bold">
		Your Profile
	</h1>

	<p class="mt-2 text-[#5a6478] text-sm">
		Update your public information.
	</p>

</div>
<div class="p-8">

<div class="flex items-center gap-5">

	<img
		src={data.user?.avatarUrl ?? "/default-avatar.png"}
		class="w-20 h-20 rounded-full border border-white/10"
	/>

	<div>

		<h2 class="text-xl font-semibold">

			{profile.name}

		</h2>

		<p class="text-[#5a6478] text-sm">

			@DevLion

		</p>

	</div>

</div>
<div class="mt-10 space-y-6">

 
<div>

<label class="block font-mono text-[11px] text-[#5a6478] mb-2">

Display Name

</label>


<input
	bind:value={profile.name}
	class="w-full bg-[#0d1420]
	border border-white/[0.08]
	rounded-sm
	px-4
	py-3
	focus:border-[#00ff88]
	outline-none"
/>

</div>
 
<div>

<label class="block font-mono text-[11px] text-[#5a6478] mb-2">

Username

</label>


<input
	bind:value={profile.username}
	class="w-full bg-[#0d1420]
	border border-white/[0.08]
	rounded-sm
	px-4
	py-3
	focus:border-[#00ff88]
	outline-none"
/>

</div>

<div>

<label class="block font-mono text-[11px] text-[#5a6478] mb-2">

Website

</label>


<input
	bind:value={profile.website}
	class="w-full bg-[#0d1420]
	border border-white/[0.08]
	rounded-sm
	px-4
	py-3
	focus:border-[#00ff88]
	outline-none"
/>

</div>

<div class="mt-10">

<button
	onclick={saveProfile}
	class="
	bg-[#00ff88]
	text-black
	font-mono
	px-6
	py-3
	rounded-lg
	font-semibold
	hover:scale-[1.02]
	transition
	"
>

Save Changes

</button>

</div>


</div>
</div>