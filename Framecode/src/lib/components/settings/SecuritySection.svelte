<script lang="ts">
	let security = $state({
		twoFactor: false
	});

	const sessions = [
		{
			device: "Windows • Chrome",
			location: "Lagos, Nigeria",
			status: "Current Device"
		},
		{
			device: "MacBook Air • Safari",
			location: "Abuja, Nigeria",
			status: "Yesterday"
		}
	];

	const activity = [
		{
			time: "Today • 2:31 PM",
			device: "Chrome",
			location: "Nigeria"
		},
		{
			time: "Yesterday",
			device: "Edge",
			location: "Nigeria"
		},
		{
			time: "2 Days Ago",
			device: "Firefox",
			location: "Nigeria"
		}
	];

	function changePassword() {}

	function enable2FA() {}

	function logoutAll() {}

	function generateRecoveryCodes() {}
</script>
 


    <div class="px-7 py-7 border-white/[0.05]"> 

      <p class="font-mono mt-4 text-[10px] uppercase tracking-[0.25em] text-[#3a4154]">
		// Security
	 </p>
	   <h1 class="text-[30px] font-bold">Security</h1>
         <p class="mt-2 text-sm text-[#5a6478]">Manage your account security settings.</p>
         </div>

         <hr class="border-b border-white/[0.05]">

	<!-- PASSWORD -->
<div class="space-y-6 p-6">
	<section class="rounded-xl border border-white/5 bg-white/[0.02] p-6">

		<div class="flex items-center justify-between">

			<div>

				<h2 class="text-lg font-semibold">
					Password
				</h2>

				<p class="mt-1 text-sm text-[#667085]">
					Update your account password.
				</p>

			</div>

			<button
				onclick={changePassword}
				class="rounded-lg border border-[#00ff88]/20 px-4 py-2 text-sm text-[#00ff88] transition hover:bg-[#00ff88]/10">

				Change Password

			</button>

		</div>

		<div class="mt-6">

			<p class="text-sm text-[#667085]">
				Last Changed
			</p>

			<p class="mt-1">
				4 days ago
			</p>

		</div>

	</section>

	<!-- TWO FACTOR -->

	<section class="rounded-xl border border-white/5 bg-white/[0.02] p-6">

		<div class="flex items-start justify-between">

			<div>

				<h2 class="text-lg font-semibold">
					Two-Factor Authentication
				</h2>

				<p class="mt-1 text-sm text-[#667085] max-w-xl">

					Add an extra layer of protection using an authenticator app.

				</p>

			</div>

			<button
				onclick={enable2FA}
				class="rounded-lg bg-[#00ff88] px-4 py-2 text-sm font-medium text-black hover:opacity-90">

				Enable 2FA

			</button>

		</div>

		<div class="mt-5 flex items-center gap-3">

			<div
				class={`h-2.5 w-2.5 rounded-full ${
					security.twoFactor
						? "bg-[#00ff88]"
						: "bg-yellow-400"
				}`}
			/>

			<p class="text-sm">

				{security.twoFactor ? "Enabled" : "Disabled"}

			</p>

		</div>

	</section>

	<!-- ACTIVE SESSIONS -->

	<section class="rounded-xl border border-white/5 bg-white/[0.02] p-6">

		<div class="flex items-center justify-between">

			<h2 class="text-lg font-semibold">
				Active Sessions
			</h2>

			<button
				onclick={logoutAll}
				class="text-sm text-red-400 hover:text-red-300">

				Sign Out All

			</button>

		</div>

		<div class="mt-6 space-y-5">

			{#each sessions as session}

				<div class="flex items-center justify-between">

					<div>

						<p class="font-medium">

							{session.device}

						</p>

						<p class="text-sm text-[#667085]">

							{session.location}

						</p>

					</div>

					<span class="text-sm text-[#00ff88]">

						{session.status}

					</span>

				</div>

			{/each}

		</div>

	</section>

	<!-- LOGIN ACTIVITY -->

	<section class="rounded-xl border border-white/5 bg-white/[0.02] p-6">

		<div class="flex items-center justify-between">

			<h2 class="text-lg font-semibold">
				Recent Login Activity
			</h2>

			<button
				class="text-sm text-[#00ff88] hover:underline">

				View History

			</button>

		</div>

		<div class="mt-6 space-y-5">

			{#each activity as login}

				<div class="flex items-center justify-between">

					<div>

						<p>

							{login.device}

						</p>

						<p class="text-sm text-[#667085]">

							{login.location}

						</p>

					</div>

					<p class="text-sm text-[#667085]">

						{login.time}

					</p>

				</div>

			{/each}

		</div>

	</section>

	<!-- RECOVERY -->

	<section class="rounded-xl border border-white/5 bg-white/[0.02] p-6">

		<div class="flex items-center justify-between">

			<div>

				<h2 class="text-lg font-semibold">
					Recovery Codes
				</h2>

				<p class="mt-1 text-sm text-[#667085]">

					Generate backup recovery codes in case you lose access to your authenticator.

				</p>

			</div>

			<button
				onclick={generateRecoveryCodes}
				class="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5">

				Generate Codes

			</button>

		</div>

	</section>

</div>