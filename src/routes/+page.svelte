<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		const auth = localStorage.getItem('synthetix_admin');

		if (auth) {
			goto('/dashboard');
		} else {
			goto('/auth');
		}
	});
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
</div>
