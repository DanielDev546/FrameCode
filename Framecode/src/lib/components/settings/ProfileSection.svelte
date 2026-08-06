<script lang="ts">
    import { invalidateAll } from "$app/navigation";
	let { data } = $props();

	let profile = $state({
		name: data.user?.name ?? "",
		username: data.user?.username ?? "",
		bio: data.user?.bio ?? "",
		website: data.user?.website ?? "",
		location: data.user?.location ?? ""
	});



	// Reference to the hidden file input
	let fileInput = $state<HTMLInputElement | null>(null);

	function triggerFileInput() {
		fileInput?.click();
	}

	let avatarPreview = $state(data.user?.avatar ?? "/default-avatar.png");

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    avatarPreview = URL.createObjectURL(file);
}

	async function saveProfile() {
	try {
		const response = await fetch("/api/settings/profile", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(profile)
		});

		const result = await response.json();

		if (!response.ok) {
			console.error(result.message);
			return;
		}

		// Update local UI immediately
		profile = {
			name: result.user.name,
			username: result.user.username,
			bio: result.user.bio ?? "",
			website: result.user.website ?? "",
			location: result.user.location ?? ""
		};

		await invalidateAll();

		console.log("Profile saved successfully.");

	} catch (error) {
		console.error(error);
	}
}
		
	
</script>

<!-- Hidden native file input for picking photos/taking camera shots -->
<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	onchange={handleFileChange}
	class="hidden"
/>

<div class="border-b border-white/[0.05] p-8">
	<p class="font-mono text-[10px] uppercase tracking-[0.25em] text-[#3a4154]">
		// Profile
	</p>

	<h1 class="mt-2 text-[30px] font-bold">Your Profile</h1>

	<p class="mt-2 text-sm text-[#5a6478]">Update your public information.</p>
</div>

<div class="p-8">
	<div class="flex items-center gap-5">
		<!-- Clickable Avatar Container with Hover Overlay -->
		<button
			type="button"
			onclick={triggerFileInput}
			class="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]"
			aria-label="Change your avatar"
		>
		<img
    src={avatarPreview}
    alt="Avatar"
    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

			<!-- Dark overlay with text on hover -->
			<div
				class="absolute inset-0 flex items-center justify-center bg-black/65 px-1 text-center opacity-0 backdrop-blur-[1px] transition-all duration-200 group-hover:opacity-100"
			>
				<span class="font-mono text-[9px] font-semibold uppercase leading-tight tracking-wider text-[#00ff88]">
					Change Avatar
				</span>
			</div>
		</button>

		<div>
			<h2 class="text-xl font-semibold">
				{profile.name}
			</h2>

			<p class="text-sm text-[#5a6478]">
				@{profile.username || "DevLion"}
			</p>
		</div>
	</div>

	<div class="max-w-2xl mt-10 space-y-6">
		<div>
			<label class="mb-2 block font-mono text-[11px] text-[#5a6478]">
				Display Name
			</label>

			<input
				bind:value={profile.name}
				class="w-full rounded-sm border border-white/[0.08] bg-[#0d1420] px-4 py-3 outline-none focus:border-[#00ff88]"
			/>
		</div>


		<div>
			<label class="mb-2 block font-mono text-[11px] text-[#5a6478]">
				Bio
			</label>

			<textarea
				bind:value={profile.bio}
				class="w-full rounded-sm border border-white/[0.08] bg-[#0d1420] px-4 py-3 outline-none focus:border-[#00ff88]"
				rows="4"
			></textarea>

		</div>

	
		<div>
			<label class="mb-2 block font-mono text-[11px] text-[#5a6478]">
				Username
			</label>

			<input
				bind:value={profile.username}
				class="w-full rounded-sm border border-white/[0.08] bg-[#0d1420] px-4 py-3 outline-none focus:border-[#00ff88]"
			/>
		</div>

		<div>
			<label class="mb-2 block font-mono text-[11px] text-[#5a6478]">
				Website <img src="web.png"  alt="web-image" class="inline-block  w-5 h-5 ml-1"/>
			</label>

			<input
				bind:value={profile.website}
				class="w-full rounded-sm border border-white/[0.08] bg-[#0d1420] px-4 py-3 outline-none focus:border-[#00ff88]"
			/>
		</div>

		<div>
			<label class="mb-2 block font-mono text-[11px] text-[#5a6478]">
				Location <img src="location.png"  alt="location-image" class="inline-block  w-5 h-5 mr-2"/>
			</label>

			<input
				bind:value={profile.location}
				class="w-full rounded-sm border border-white/[0.08] bg-[#0d1420] px-4 py-3 outline-none focus:border-[#00ff88]"
			/>
		</div>

		<div class="mt-10">
			<button
				onclick={saveProfile}
				class="rounded-lg bg-[#00ff88] px-6 py-3 font-mono font-semibold text-black transition hover:scale-[1.02]"
			>
				Save Changes
			</button>
		</div>
	</div>
</div>