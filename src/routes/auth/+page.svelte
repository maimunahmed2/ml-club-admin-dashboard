<script lang="ts">
	import { goto } from '$app/navigation';
	import { BrainCircuit, Lock } from '@lucide/svelte';

	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let isLoading = $state(false);

	let formData = $state({
		userId: 'admin',
		password: 'password'
	});

	function handleLogin(event: SubmitEvent) {
		event.preventDefault();
		isLoading = true;

		setTimeout(() => {
			if (formData.userId === 'admin' && formData.password === 'password') {
				localStorage.setItem('synthetix_admin', 'true');

				alert('Login Successful. Welcome back to the ML Club Admin Portal.');
				goto('/dashboard');
			} else {
				alert('Invalid credentials.');
				isLoading = false;
			}
		}, 1200);
	}
</script>

<div
	class="flex min-h-screen w-full items-center justify-center bg-[url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center p-4"
>
	<div class="bg-background/80 absolute inset-0 backdrop-blur-sm"></div>

	<Card.Root class="border-primary/20 bg-card/50 relative z-10 w-full max-w-md backdrop-blur-xl">
		<Card.Header class="space-y-1 text-center">
			<div
				class="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
			>
				<BrainCircuit class="text-primary h-6 w-6" />
			</div>

			<Card.Title class="font-headline text-2xl tracking-tight">ML Club Admin</Card.Title>

			<Card.Description class="text-muted-foreground">
				Sign in to manage your club's website <br />
				<span class="font-code text-[10px] opacity-70">(Demo: admin / password)</span>
			</Card.Description>
		</Card.Header>

		<form onsubmit={handleLogin}>
			<Card.Content class="space-y-4">
				<div class="space-y-2">
					<Label for="userId">Username</Label>

					<Input
						id="userId"
						placeholder="Enter admin username"
						class="bg-background/50"
						bind:value={formData.userId}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="password">Password</Label>

					<Input
						id="password"
						placeholder="Enter password"
						type="password"
						class="bg-background/50"
						bind:value={formData.password}
						required
					/>
				</div>
			</Card.Content>

			<Card.Footer>
				<Button type="submit" class="cursor-pointer mt-4 w-full font-semibold" disabled={isLoading}>
					{#if isLoading}
						<div class="flex items-center gap-2">
							<div
								class="border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
							></div>
							Authenticating...
						</div>
					{:else}
						<div class="flex items-center gap-2">
							<Lock class="h-4 w-4" />
							Sign in
						</div>
					{/if}
				</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</div>
