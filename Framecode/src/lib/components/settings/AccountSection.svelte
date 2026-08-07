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

<!-- Header -->
<div class="px-8 py-8 border-b border-white/[0.05]">
	<p class="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a4154]">
		// ACCOUNT
	</p>

	<h1 class="text-[30px] font-bold text-[#e8edf5]">
		Account Settings
	</h1>

	<p class="mt-2 text-[#5a6478]">
		Manage your login methods and account identity.
	</p>
</div>

<div class="space-y-6 p-8">

	<!-- Primary Email -->
	<div class="rounded-sm border border-white/[0.05] bg-[#0b1018] p-6">

		<div class="flex items-start justify-between">

			<div>

				<p class="font-mono text-[10px] uppercase tracking-[0.18em] text-[#3a4154]">
					Primary Email
				</p>

				<p class="mt-3 text-lg font-semibold text-white">
					{account.email}
				</p>

				<p class="mt-2 text-sm text-[#5a6478]">
					Used for login, notifications and account recovery.
				</p>

			</div>

			<div class="flex items-center gap-3">

				{#if account.emailVerified}
					<span
						class="rounded-full border border-[#00ff88]/20 bg-[#00ff88]/10 px-3 py-1 font-mono text-[10px] uppercase text-[#00ff88]"
					>
						Verified
					</span>
				{:else}
					<span
						class="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 font-mono text-[10px] uppercase text-yellow-400"
					>
						Unverified
					</span>
				{/if}

				<button
					onclick={changeEmail}
					class="border border-[#00ff88]/20 bg-[#00ff88]/5 px-4 py-2 font-mono text-[11px] uppercase text-[#00ff88] transition hover:bg-[#00ff88] hover:text-black"
				>
					Change Email
				</button>

			</div>

		</div>

	</div>

	<!-- Authentication -->
	<div class="rounded-sm border border-white/[0.05] bg-[#0b1018]">

		<div class="border-b border-white/[0.05] p-6">

			<h2 class="text-lg font-semibold text-white">
				Authentication
			</h2>

			<p class="mt-1 text-sm text-[#5a6478]">
				Manage how you sign in to FrameCode.
			</p>

		</div>

		<!-- Email -->
		<div class="flex items-center justify-between border-b border-white/[0.05] p-6">

			<div>

				<p class="font-medium text-white">
					Email & Password
				</p>

				<p class="mt-1 text-sm text-[#5a6478]">
					Traditional sign in using your email.
				</p>

			</div>

			<button
				onclick={changePassword}
				class="border border-[#00ff88]/20 bg-[#00ff88]/5 px-5 py-2 font-mono text-[11px] uppercase text-[#00ff88] transition hover:bg-[#00ff88] hover:text-black"
			>
				Change Password
			</button>

		</div>

		<!-- GitHub -->
		<div class="flex items-center justify-between p-6">

			<div>

				<p class="font-medium text-white">
					GitHub
				</p>

				<p class="mt-1 text-sm text-[#5a6478]">
					{#if account.githubConnected}
						Connected as @{account.githubUsername}
					{:else}
						No GitHub account connected.
					{/if}
				</p>

			</div>

			{#if account.githubConnected}

				<span
					class="rounded-full border border-[#00ff88]/20 bg-[#00ff88]/10 px-3 py-1 font-mono text-[10px] uppercase text-[#00ff88]"
				>
					Connected
				</span>

			{:else}

				<button
					onclick={connectGithub}
					class="border border-[#00ff88]/20 bg-[#00ff88]/5 px-5 py-2 font-mono text-[11px] uppercase text-[#00ff88] transition hover:bg-[#00ff88] hover:text-black"
				>
					Connect GitHub
				</button>

			{/if}

		</div>

	</div>

	<!-- Account Information -->
	<div class="rounded-sm border border-white/[0.05] bg-[#0b1018] p-6">

		<p class="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#3a4154]">
			Account Information
		</p>

		<div class="grid grid-cols-3 gap-8">

			<div>
				<p class="text-xs uppercase text-[#5a6478]">
					Member Since
				</p>

				<p class="mt-2 text-white">
					{account.createdAt}
				</p>
			</div>

			<div>
				<p class="text-xs uppercase text-[#5a6478]">
					Plan
				</p>

				<p class="mt-2 text-white">
					Free
				</p>
			</div>

			<div>
				<p class="text-xs uppercase text-[#5a6478]">
					Account ID
				</p>

				<p class="mt-2 font-mono text-[#00ff88]">
					{account.id}
				</p>
			</div>

		</div>

	</div>

</div>