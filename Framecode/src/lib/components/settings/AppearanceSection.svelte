<script lang="ts">
	let appearance = $state({
		theme: "terminal",
		fontSize: 14,
		fontFamily: "JetBrains Mono",
		tabSize: 2,
		lineNumbers: true,
		wordWrap: true,
		minimap: true,
		cursorAnimation: true,
		animations: true,
		compact: false,
		grid: true,
		accent: "#00ff88"
	});

	async function saveAppearance() {
		console.log(appearance);

		// POST /api/settings/appearance
	}
</script>

<!-- Header -->
<div class="p-8 border-b border-white/[0.05]">
	<p class="font-mono text-[10px] tracking-[0.25em] uppercase text-[#3a4154]">
		// Appearance
	</p>

	<h1 class="mt-2 text-[30px] font-bold">
		Appearance
	</h1>

	<p class="mt-2 text-[#5a6478]">
		Customize your FrameCode experience.
	</p>
</div>

<!-- Content -->
<div class="p-8">

	<!-- Theme -->
	<p class="font-mono text-[11px] uppercase text-[#5a6478] mb-4">
		Theme
	</p>

	<div class="grid grid-cols-2 gap-4">

		<button
			onclick={() => appearance.theme = "terminal"}
			class={`border rounded-xl p-5 text-left transition ${
				appearance.theme === "terminal"
					? "border-[#00ff88] bg-[#00ff88]/5"
					: "border-white/[0.06] hover:border-white/20"
			}`}
		>
			<h3 class="font-semibold">Dark Terminal</h3>
			<p class="text-[#5a6478] text-sm mt-1">
				FrameCode default.
			</p>
		</button>

		<button
			onclick={() => appearance.theme = "midnight"}
			class={`border rounded-xl p-5 text-left transition ${
				appearance.theme === "midnight"
					? "border-[#00ff88] bg-[#00ff88]/5"
					: "border-white/[0.06] hover:border-white/20"
			}`}
		>
			<h3 class="font-semibold">Midnight</h3>
			<p class="text-[#5a6478] text-sm mt-1">
				FrameCode preferred dark theme.
			</p>
		</button>

		<button
			onclick={() => appearance.theme = "oled"}
			class={`border rounded-xl p-5 text-left transition ${
				appearance.theme === "oled"
					? "border-[#00ff88] bg-[#00ff88]/5"
					: "border-white/[0.06] hover:border-white/20"
			}`}
		>
			<h3 class="font-semibold">OLED</h3>
			<p class="text-[#5a6478] text-sm mt-1">
				Best for OLED displays.
			</p>
		</button>

		<button
			onclick={() => appearance.theme = "light"}
			class={`border rounded-xl p-5 text-left transition ${
				appearance.theme === "light"
					? "border-[#00ff88] bg-[#00ff88]/5"
					: "border-white/[0.06] hover:border-white/20"
			}`}
		>
			<h3 class="font-semibold">Light</h3>
			<p class="text-[#5a6478] text-sm mt-1">
				FrameCode light theme.
			</p>
		</button>

	</div>

	<!-- Editor -->
	<div class="mt-10">

		<p class="font-mono text-[11px] uppercase text-[#5a6478] mb-5">
			Editor
		</p>

		<div class="flex gap-4 mb-6">

			<select bind:value={appearance.fontSize}>
				<option value={12}>12</option>
				<option value={14}>14</option>
				<option value={16}>16</option>
				<option value={18}>18</option>
			</select>

			<select bind:value={appearance.tabSize}>
				<option value={2}>2</option>
				<option value={4}>4</option>
				<option value={8}>8</option>
			</select>

		</div>

		<div class="flex justify-between items-center py-4 border-b border-white/[0.05]">

			<div>
				<p>Line Numbers</p>
				<p class="text-[#5a6478] text-sm">
					Show editor line numbers.
				</p>
			</div>

			<input
				type="checkbox"
				bind:checked={appearance.lineNumbers}
			/>

		</div>

	</div>

	<!-- Accent Color -->
	<div class="mt-10">

		<p class="font-mono text-[11px] uppercase text-[#5a6478] mb-4">
			Accent Color
		</p>

		<div class="flex gap-4">

			{#each ["#00ff88", "#3b82f6", "#8b5cf6", "#f97316"] as color}

				<button
					onclick={() => appearance.accent = color}
					style={`background:${color}`}
					class={`w-9 h-9 rounded-full border-2 ${
						appearance.accent === color
							? "border-white"
							: "border-transparent"
					}`}
				/>

			{/each}

		</div>

	</div>

	<!-- Save -->
	<div class="mt-12">

		<button
			onclick={saveAppearance}
			class="px-7 py-3 rounded-lg bg-[#00ff88] text-black font-semibold hover:scale-[1.02] transition"
		>
			Save Preferences
		</button>

	</div>

</div>