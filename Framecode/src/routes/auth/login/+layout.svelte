<script>
	import { onMount } from 'svelte';
	import LoadingScreen from '$lib/LoadingScreen.svelte';

	let loading = $state(true);

	onMount(() => {
		setTimeout(() => {
			loading = false;
		}, 2500);
	});
</script>

<LoadingScreen visible={loading} />

{#if !loading}
	<slot />
{/if}