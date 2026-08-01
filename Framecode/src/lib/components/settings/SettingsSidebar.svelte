<script lang="ts">
	let {
		active = "profile",
		onSelect
	}: {
		active?: string;
		onSelect: (section: string) => void;
	} = $props();

	const items = [
		{ id: "profile", label: "Profile" },
		{ id: "account", label: "Account" },
		{ id: "appearance", label: "Appearance" },
		{ id: "github", label: "GitHub" },
		{ id: "security", label: "Security" },
		{ id: "danger", label: "Danger Zone" }
	];
</script>

<aside class="w-[240px] border-r border-white/[0.05]">

	<div class="px-6 py-6 border-b border-white/[0.05]">
		<p class="font-mono text-[10px] uppercase tracking-[0.25em] text-[#3a4154]">
			Settings
		</p>
	</div>

	<nav class="py-3">

		{#each items as item}

			<button
				onclick={() => onSelect(item.id)}
				class="w-full flex items-center justify-between px-6 py-3
				font-mono text-[11px] transition-all
				{active===item.id
					? 'text-white bg-white/[0.04] border-l border-[#00ff88]'
					: 'text-[#5a6478] hover:text-white border-l border-transparent'}"
			>

				{item.label}

				{#if active===item.id}
					<div class="w-[4px] h-[4px] rounded-full bg-[#00ff88]"></div>
				{/if}

			</button>

		{/each}

	</nav>

</aside>