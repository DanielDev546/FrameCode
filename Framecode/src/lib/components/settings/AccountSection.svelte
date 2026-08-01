<script lang="ts">
	let { data } = $props();

	const account = {
		email: data.user?.email ?? "",
		verified: data.user?.emailVerified ?? false,
		role: data.user?.role ?? "Free",
		createdAt: data.user?.createdAt ?? null,
		id: data.user?.id ?? ""
	};

	function formatDate(date: string | Date | null) {
		if (!date) return "Unknown";

		return new Date(date).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric"
		});
	}
</script>
<div class="p-8 border-b border-white/[0.05]">

	<p class="font-mono text-[10px] uppercase tracking-[0.25em] text-[#3a4154]">
		// Account
	</p>

	<h1 class="mt-2 text-[30px] font-bold">
		Account
	</h1>

	<p class="mt-2 text-[#5a6478] text-sm">
		View your account details.
	</p>

</div>
<div class="p-8 space-y-5">

	<div class="border border-white/[0.06] rounded-xl p-5">

		<p class="font-mono text-[10px] text-[#5a6478] uppercase">
			Email Address
		</p>

		<div class="mt-2 flex items-center justify-between">

			<p>{account.email}</p>

			{#if account.verified}
				<span class="text-[#00ff88] text-sm">
					✓ Verified
				</span>
			{:else}
				<span class="text-yellow-400 text-sm">
					Pending
				</span>
			{/if}

		</div>

    </div>

	</div>
    <div class="border border-white/[0.06] rounded-xl p-5">

	<p class="font-mono text-[10px] text-[#5a6478] uppercase">
		Member Since
	</p>

	<p class="mt-2">
		{formatDate(account.createdAt)}
	</p>

</div>
<div class="border border-white/[0.06] rounded-xl p-5">

	<p class="font-mono text-[10px] text-[#5a6478] uppercase">
		Account Type
	</p>

	<p class="mt-2 text-[#00ff88]">
		{account.role}
	</p>

</div>
<div class="border border-white/[0.06] rounded-xl p-5">

	<p class="font-mono text-[10px] text-[#5a6478] uppercase">
		User ID
	</p>

	<p class="mt-2 font-mono text-[12px] break-all">
		{account.id}
	</p>

</div>
<div class="flex gap-3 mt-8">

	<button
		class="px-5 py-3 border border-white/[0.08]
		hover:border-[#00ff88]
		font-mono text-[11px]
		transition"
	>
		Change Email
	</button>

	<button
		class="px-5 py-3 bg-[#00ff88]
		text-black
		font-mono
		font-semibold
		rounded-lg
	"
	>
		Upgrade Plan
	</button>

</div>