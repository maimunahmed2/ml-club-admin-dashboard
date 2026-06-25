<script lang="ts">
	import { goto } from '$app/navigation';
	import { X } from '@lucide/svelte';

	let { children } = $props();

	function closeSimulation() {
		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>Live Website Preview</title>
</svelte:head>

<div class="simulation-root">
	<div class="simulation-window">
		<div class="simulation-topbar">
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded-full bg-red-500"></div>
					<div class="h-3 w-3 rounded-full bg-yellow-500"></div>
					<div class="h-3 w-3 rounded-full bg-green-500"></div>
				</div>

				<div class="h-4 w-px bg-white/10"></div>

				<span class="font-code text-[10px] uppercase tracking-widest text-white/40">
					Public Site Simulation
				</span>
			</div>

			<button
				type="button"
				class="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
				onclick={closeSimulation}
				aria-label="Close simulation"
				title="Close simulation"
			>
				<X class="h-4 w-4" />
			</button>
		</div>

		<div class="simulation-content custom-scrollbar">
			{@render children()}
		</div>
	</div>
</div>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		background: black;
		overflow: hidden;
	}

	.simulation-root {
		height: 100vh;
		width: 100vw;
		background: black;
		overflow: hidden;
	}

	.simulation-window {
		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
		overflow: hidden;
		border: none;
		background: black;
	}

	.simulation-topbar {
		position: relative;
		z-index: 100000;
		display: flex;
		height: 3.5rem;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		background: black;
		padding-inline: 1.5rem;
	}

	.simulation-content {
		position: relative;
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		background: black;

		/* keeps fixed navbars inside this preview window */
		transform: translateZ(0);
	}

	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 0.45rem;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.25);
		border-radius: 999px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.4);
	}

	@media (max-width: 640px) {
		.simulation-topbar {
			height: 3.75rem;
			padding-inline: 1rem;
		}

		.simulation-topbar span {
			display: none;
		}
	}
</style>
