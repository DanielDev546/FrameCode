<script lang="ts">
	let { data } = $props();

	let account = $state({
		email: data.user?.email ?? "daniel@framecode.dev",
		emailVerified: data.user?.emailVerified ?? true,
		lastPasswordChange: data.user?.lastPasswordChange ?? "4 days ago"
	});

	function changePassword() {
		console.log("change password");
	}
</script>

<div class="border border-white/[0.05] rounded-xl overflow-hidden bg-[#070b12]">

	<!-- Header -->
	<div class="px-8 py-8 border-b border-white/[0.05]">
		<p class="font-mono text-[10px] tracking-[0.22em] uppercase text-[#3a4154] mb-2">
			// ACCOUNT
		</p>

		<h1 class="text-[22px] font-bold text-[#e8edf5]">
			Account Settings
		</h1>
		
		<p class="mt-2 text-[#5a6478]">
			Manage your email address and login credentials.
		</p>
	</div>

	<div class="p-8 space-y-6">

		<!-- Email Card -->
		<div class="border border-white/[0.05] rounded-sm p-6 bg-[#0b1018]">

			<div class="flex items-start justify-between">

				<div>

					<p class="font-mono text-[10px] uppercase tracking-[0.18em] text-[#3a4154]">
						Primary Email
					</p>

					<p class="mt-3 text-[18px] font-semibold text-white">
						{account.email}
					</p>

				</div>

				{#if account.emailVerified}
					<span
						class="px-3 py-1 rounded-full
						bg-[#00ff88]/10
						border border-[#00ff88]/20
						text-[#00ff88]
						font-mono
						text-[10px]
						uppercase"
					>
						Verified
					</span>
				{:else}
					<span
						class="px-3 py-1 rounded-full
						bg-yellow-500/10
						border border-yellow-500/20
						text-yellow-400
						font-mono
						text-[10px]
						uppercase"
					>
						Unverified
					</span>
				{/if}

			</div>

		</div>

		<!-- Password Card -->
		<div class="border border-white/[0.05] rounded-sm p-6 bg-[#0b1018]">

			<div class="flex justify-between items-center">

				<div>

					<p class="font-mono text-[10px] uppercase tracking-[0.18em] text-[#3a4154]">
						Password
					</p>

					<p class="mt-3 text-[20px] tracking-[0.3em]">
						••••••••••••
					</p>

					<p class="mt-2 text-[#5a6478] text-sm">
						Last changed {account.lastPasswordChange}
					</p>

				</div>

				<button
					onclick={changePassword}
					class="px-5 py-2
					font-mono
					text-[11px]
					uppercase
					border border-[#00ff88]/20
					bg-[#00ff88]/5
					text-[#00ff88]
					hover:bg-[#00ff88]
					hover:text-black
					transition-all"
				>
					Change Password
				</button>

			</div>

		</div>

	</div>

</div>