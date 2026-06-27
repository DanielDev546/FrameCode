 <script>
  let { visible = false } = $props();
</script>

{#if visible}
<div class="loader">
	<img src="/icon (31).svg" alt="logo" class="logo" />
</div>
{/if}

<style>
	.loader {
		position: fixed;
		inset: 0;
		background: #0f0f0f;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
		animation: fadeIn 0.9s ease;
	}

	.logo {
		width: 90px;
		animation: pulse 6s infinite;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 0.7;
		}
		50% {
			transform: scale(1.1);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 0.7;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>