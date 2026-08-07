<script>
    import DashboardLayout from "$lib/layout/DashboardLayout.svelte";
</script>


<DashboardLayout active="meter" >

<div class="flex h-full items-center justify-center mb-30 px-8">

	<div
		class="w-full max-w-2xl rounded-sm border border-[#00ff88]/10 bg-[#0b1018] overflow-hidden"
	>

		<!-- Header -->
		<div class="border-b border-white/[0.05] px-6 py-4">

			<p class="font-mono text-[10px] uppercase tracking-[0.25em] text-[#3a4154]">
				// SYSTEM NOTICE
			</p>

			<h1 class="mt-2 font-mono text-[26px] font-bold">
				<span class="text-[#3a4154]">[</span>
				<span class="text-[#00ff88]">FC</span>
				<span class="text-[#3a4154]">]</span>
				<span class="ml-2 text-white">EARLY ACCESS</span>
			</h1>

		</div>

		<!-- Body -->
		<div class="space-y-6 p-8">

			<div
				class="rounded-sm border border-[#00ff88]/10 bg-[#00ff88]/5 p-5"
			>

				<p class="font-mono text-[13px] leading-8 text-[#b8c3d6]">

					<span class="text-[#00ff88]">&gt;</span>
					You're using an early build of
					<span class="text-white">FrameCode</span>.

					<br /><br />

					<span class="text-[#00ff88]">&gt;</span>
					This feature is currently under active development
					and will become available in a future update.

					<br /><br />

					<span class="text-[#00ff88]">&gt;</span>
					Thank you for helping shape FrameCode.

				</p>

			</div>

			<div class="flex items-center justify-between">

				<div class="font-mono text-[11px] text-[#5a6478]">
					Status:
					<span class="text-[#00ff88]">Building...</span>
				</div>

				<button
					onclick={() => history.back()}
					class="border border-[#00ff88]/20 bg-[#00ff88]/5 px-5 py-2
					font-mono text-[11px] uppercase tracking-[0.18em]
					text-[#00ff88] transition-all
					hover:bg-[#00ff88] hover:text-black"
				>
					Return
				</button>

			</div>

		</div>

	</div>

</div>
 

</DashboardLayout>