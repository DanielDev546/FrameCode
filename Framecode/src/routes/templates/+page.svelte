<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = '';
	let category = 'All';
const filtered = $derived(
	data.templates.filter((template) => {
		const matchesCategory =
			category === 'All' ||
			template.category === category;

		const query = search.toLowerCase();

		const matchesSearch =
			template.name.toLowerCase().includes(query) ||
			template.description.toLowerCase().includes(query) ||
			template.tags.some((tag) =>
				tag.toLowerCase().includes(query)
			);

		return matchesCategory && matchesSearch;
	})
);
</script>

<div class="min-h-screen bg-[#070b11] text-white">

	<div class="mx-auto max-w-7xl px-8 py-10">

		<!-- Header -->

		<div class="mb-10 flex items-center justify-between">

			<div>
				<p class="text-xs uppercase tracking-[0.35em] text-emerald-400">
					// Templates
				</p>

				<h1 class="mt-3 text-5xl font-bold">
					FrameCode Templates
				</h1>

				<p class="mt-2 text-gray-400">
					Production-ready starters built for developers.
				</p>
			</div>

			<button
				class="border border-emerald-400 px-5 py-3 text-sm text-emerald-400 transition hover:bg-emerald-400 hover:text-black"
			>
				New Template
			</button>

		</div>

		<!-- Search -->

		<div class="mb-6">

			<input
				bind:value={search}
				type="text"
				placeholder="Search templates..."
				class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-400"
			/>

		</div>

		<!-- Categories -->

		<div class="mb-10 flex flex-wrap gap-3">

			{#each data.categories as item}

				<button
					on:click={() => (category = item)}
					class:selected={category === item}
					class="rounded border border-zinc-700 px-4 py-2 text-sm transition hover:border-emerald-400 hover:text-emerald-400 selected:border-emerald-400 selected:bg-emerald-400 selected:text-black"
				>
					{item}
				</button>

			{/each}

		</div>

		<!-- Grid -->

		<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

			{#each filtered as template}

				<div
					class="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 transition hover:-translate-y-1 hover:border-emerald-400"
				>

					<img
						src={template.image}
						alt={template.name}
						class="h-52 w-full object-cover"
					/>

					<div class="space-y-5 p-6">

						<div class="flex items-center justify-between">

							<h2 class="text-xl font-semibold">
								{template.name}
							</h2>

							<div
								class="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400"
							>
								AI {template.score}
							</div>

						</div>

						<p class="text-sm text-gray-400">
							{template.description}
						</p>

						<div class="flex flex-wrap gap-2">

							{#each template.tags as tag}

								<span
									class="rounded border border-zinc-700 px-2 py-1 text-xs text-gray-300"
								>
									{tag}
								</span>

							{/each}

						</div>

						<div class="flex justify-between text-sm text-gray-500">

							<span>{template.framework}</span>

							<span>{template.language}</span>

						</div>

						<div class="flex gap-3">

							<button
								class="flex-1 rounded bg-emerald-500 py-2 font-medium text-black transition hover:bg-emerald-400"
							>
								Preview
							</button>

							<button
								class="flex-1 rounded border border-zinc-700 py-2 transition hover:border-emerald-400 hover:text-emerald-400"
							>
								Fork
							</button>

						</div>

					</div>

				</div>

			{/each}

		</div>

	</div>

</div>