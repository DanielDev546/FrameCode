<script lang="ts">
	async function deleteProjects() {
		console.log("Delete projects");
	}

	async function deleteAccount() {
		console.log("Delete account");
	}
</script>

<div class="space-y-6 p-8 ">

	<div>
		<p class="font-mono text-[10px] uppercase tracking-[0.25em] text-red-400">
			// Danger Zone
		</p>

		<h2 class="text-2xl font-bold mt-2">
			Permanent Actions
		</h2>

		<p class="text-[#5a6478] mt-2 max-w-xl">
			These actions cannot be undone. Please proceed carefully.
		</p>
	</div>

	<!-- Delete Projects -->

	<div class="border border-red-500/20 rounded-xl p-6">

		<div class="flex justify-between items-center">

			<div>

				<h3 class="font-semibold">
					Delete All Projects
				</h3>

				<p class="text-[#5a6478] text-sm mt-1">
					Remove every project inside your FrameCode workspace.
				</p>

			</div>

			<button
				onclick={deleteProjects}
				class="px-5 py-2 rounded-lg
				bg-red-500/10
				text-red-400
				border border-red-500/30
				hover:bg-red-500/20 transition"
			>

				Delete Projects

			</button>

		</div>

	</div>

	<!-- Delete Account -->

	<div class="border border-red-500/20 rounded-xl p-6">

		<div class="flex justify-between items-center">

			<div>

				<h3 class="font-semibold">
					Delete Account
				</h3>

				<p class="text-[#5a6478] text-sm mt-1">
					Permanently remove your FrameCode account and every piece of data.
				</p>

			</div>

			<button
				onclick={deleteAccount}
				class="px-5 py-2 rounded-lg
				bg-red-500
				text-white
				hover:bg-red-600 transition"
			>

				Delete Account

			</button>

		</div>

	</div>

</div>