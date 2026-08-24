<script lang="ts">
	let { data } = $props();

	let account = $state({
		id: data.user?.id ?? "",
		email: data.user?.email ?? "",
		emailVerified: data.user?.emailVerified ?? true,
		lastPasswordChange: data.user?.lastPasswordChange ?? "4 days ago",
		createdAt: data.user?.createdAt ?? "",
		githubConnected: !!data.user?.githubToken,
		githubUsername: data.user?.githubUsername ?? ""
	});

	let showEmailModal = $state(false);
	let newEmailInput = $state("");
	let emailChangeStatus = $state<"idle" | "sending" | "sent" | "error">("idle");

	function changeEmail() {
		newEmailInput = "";
		emailChangeStatus = "idle";
		showEmailModal = true;
	}

	function closeEmailModal() {
		showEmailModal = false;
	}

	async function submitEmailChange() {
		if (!newEmailInput.includes("@")) return;

		emailChangeStatus = "sending";

		try {
			const res = await fetch("/api/settings/email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ newEmail: newEmailInput })
			});

			if (!res.ok) throw new Error(await res.text());

			emailChangeStatus = "sent";
		} catch (e) {
			console.error("Failed to request email change", e);
			emailChangeStatus = "error";
		}
	}

	function changePassword() {
		console.log("change password");
	}

	function connectGithub() {
		window.location.href = "/auth/github";
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

<!-- Email Change Modal -->
{#if showEmailModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

		<div class="w-full max-w-md rounded-sm border border-white/[0.08] bg-[#0b1018] p-6">

			<h3 class="text-lg font-semibold text-white">
				Change Email Address
			</h3>

			{#if emailChangeStatus === "sent"}

				<p class="mt-4 text-sm text-[#5a6478]">
					A confirmation link has been sent to <span class="text-white">{newEmailInput}</span>.
					Click it to finish changing your email.
				</p>

				<button
					onclick={closeEmailModal}
					class="mt-6 w-full border border-white/[0.08] px-4 py-2 font-mono text-[11px] uppercase text-[#5a6478] transition hover:text-white"
				>
					Close
				</button>

			{:else}

				<p class="mt-2 text-sm text-[#5a6478]">
					We'll send a confirmation link to your new address before making the change.
				</p>

				<input
					type="email"
					bind:value={newEmailInput}
					placeholder="new@email.com"
					class="mt-4 w-full border border-white/[0.08] bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-[#00ff88]/40"
				/>

				{#if emailChangeStatus === "error"}
					<p class="mt-2 text-xs text-red-400">
						Something went wrong. Try again.
					</p>
				{/if}

				<div class="mt-6 flex gap-3">

					<button
						onclick={closeEmailModal}
						class="flex-1 border border-white/[0.08] px-4 py-2 font-mono text-[11px] uppercase text-[#5a6478] transition hover:text-white"
					>
						Cancel
					</button>

					<button
						onclick={submitEmailChange}
						disabled={emailChangeStatus === "sending" || !newEmailInput.includes("@")}
						class="flex-1 border border-[#00ff88]/20 bg-[#00ff88]/5 px-4 py-2 font-mono text-[11px] uppercase text-[#00ff88] transition hover:bg-[#00ff88] hover:text-black disabled:opacity-40"
					>
						{emailChangeStatus === "sending" ? "Sending..." : "Send Link"}
					</button>

				</div>

			{/if}

		</div>

	</div>
{/if}