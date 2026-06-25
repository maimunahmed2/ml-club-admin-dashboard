<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';
	// Only add this if you have installed sonner/toaster in shadcn-svelte
	// import { Toaster } from '$lib/components/ui/sonner';
</script>

<svelte:head>
	<title>ML Club Admin</title>
	<meta name="description" content="Production-quality Admin Portal for the ML Club Website" />
</svelte:head>
<slot />
<!-- Uncomment only if you have the toaster component installed -->
<Toaster />
