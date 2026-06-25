<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import {
		BrainCircuit,
		FolderGit2,
		LayoutDashboard,
		LogOut,
		Menu,
		PenTool,
		Users
	} from '@lucide/svelte';

	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { useIsMobile } from '$lib/hooks/use-mobile.svelte';
	import { Monitor } from 'lucide-svelte';

	let mounted = $state(false);
	let collapsed = $state(false);
	let mobileSidebarOpen = $state(false);

	const isMobile = useIsMobile();

	const navigation = [
		{ name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
		{ name: 'Members', icon: Users, href: '/dashboard/members' },
		{ name: 'Projects', icon: FolderGit2, href: '/dashboard/projects' },
		{ name: 'Blogs', icon: PenTool, href: '/dashboard/blogs' }
		// { name: 'Settings', icon: Settings, href: '/dashboard/settings' }
	];

	const adminAvatar = 'https://picsum.photos/seed/admin-avatar/100/100';

	const pathname = $derived(page.url.pathname);
	const isCollapsed = $derived(!isMobile.value && collapsed);

	onMount(() => {
		const auth = localStorage.getItem('synthetix_admin');

		if (!auth) {
			goto('/auth');
			return;
		}

		mounted = true;
	});

	function handleLogout() {
		localStorage.removeItem('synthetix_admin');
		goto('/auth');
	}

	function toggleSidebar() {
		if (isMobile.value) {
			mobileSidebarOpen = !mobileSidebarOpen;
		} else {
			collapsed = !collapsed;
		}
	}

	function closeMobileSidebar() {
		if (isMobile.value) {
			mobileSidebarOpen = false;
		}
	}
</script>

{#if mounted}
	<div class="flex min-h-screen w-full bg-background">
		{#if isMobile.value && mobileSidebarOpen}
			<button
				class="fixed inset-0 z-40 bg-black/50 md:hidden"
				aria-label="Close sidebar"
				onclick={() => (mobileSidebarOpen = false)}
			></button>
		{/if}

		<aside
			class={`flex min-h-screen shrink-0 flex-col border-r border-border bg-background transition-all duration-300 ${
				isMobile.value
					? `fixed inset-y-0 left-0 z-50 w-64 transform ${
							mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
						}`
					: isCollapsed
						? 'w-16'
						: 'w-64'
			}`}
		>
			<div class={`p-4 ${isCollapsed ? 'p-2' : ''}`}>
				<div class={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
					<div class="flex shrink-0 items-center justify-center rounded-lg bg-primary/20 p-2">
						<BrainCircuit
							onclick={() => goto('/dashboard')}
							class="h-6 w-6 text-primary cursor-pointer"
						/>
					</div>

					{#if !isCollapsed}
						<span
							onclick={() => goto('/dashboard')}
							class="font-headline overflow-hidden whitespace-nowrap text-xl font-bold tracking-tight cursor-pointer"
						>
							Synthetix
						</span>
					{/if}
				</div>
			</div>

			<div class="border-t border-border"></div>

			<nav class={`flex-1 p-2 ${isCollapsed ? 'p-1' : ''}`}>
				<ul class="space-y-1">
					{#each navigation as item (item.name)}
						{@const Icon = item.icon}
						{@const isActive = pathname === item.href}

						<li>
							<a
								href={item.href}
								title={item.name}
								aria-current={isActive ? 'page' : undefined}
								onclick={closeMobileSidebar}
								class={`flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent hover:text-primary ${
									isActive ? 'bg-sidebar-accent text-primary' : 'text-muted-foreground'
								} ${isCollapsed ? 'justify-center px-0' : ''}`}
							>
								<Icon class={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />

								{#if !isCollapsed}
									<span>{item.name}</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<footer class={`p-4 ${isCollapsed ? 'p-2' : ''}`}>
				<div
					class={`mb-4 flex cursor-not-allowed items-center gap-3 rounded-xl border border-border/50 bg-sidebar-accent p-4 ${
						isCollapsed ? 'justify-center border-none bg-transparent p-0' : ''
					}`}
				>
					<Avatar.Root class="h-9 w-9 shrink-0 border border-primary/20">
						<Avatar.Image src={adminAvatar} alt="Admin avatar" />
						<Avatar.Fallback>AD</Avatar.Fallback>
					</Avatar.Root>

					{#if !isCollapsed}
						<div class="flex flex-col overflow-hidden">
							<span class="truncate text-sm font-semibold">Lead Admin</span>
							<span class="font-code truncate text-[10px] text-muted-foreground uppercase">
								System Manager
							</span>
						</div>
					{/if}
				</div>

				<Button
					variant="ghost"
					class={`cursor-pointer w-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive ${
						isCollapsed ? 'justify-center px-0' : 'justify-start'
					}`}
					onclick={handleLogout}
					title="Logout"
				>
					<LogOut class="h-4 w-4 shrink-0" />

					{#if !isCollapsed}
						<span class="ml-2">Logout</span>
					{/if}
				</Button>
			</footer>
		</aside>

		<div class="flex min-w-0 flex-1 flex-col">
			<header
				class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/50 px-4 backdrop-blur-md md:px-6"
			>
				<div class="flex w-full items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						class="cursor-e-resize text-muted-foreground transition-colors hover:text-primary"
						onclick={toggleSidebar}
						title="Toggle sidebar"
					>
						<Menu class="h-5 w-5" />
					</Button>

					<Badge
						variant="outline"
						class="hidden border-primary/20 bg-primary/5 px-2 text-[10px] font-bold tracking-widest text-primary uppercase sm:flex"
					>
						Admin Portal
					</Badge>

					<div class="relative ml-auto hidden sm:block">
						<span
							class="pointer-events-none absolute -top-2 -left-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[9px] font-black tracking-widest text-primary-foreground uppercase shadow-md shadow-primary/30"
						>
							New
						</span>

						<Button
							variant="outline"
							size="sm"
							class="cursor-pointer flex items-center gap-2 rounded-full border-primary/40 bg-primary/10 px-4 font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/20 hover:shadow-primary/30"
							onclick={() => goto('/liveDemo')}
						>
							<Monitor class="h-4 w-4" />

							<span>Live Preview</span>

							<span class="relative flex h-2.5 w-2.5">
								<span
									class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60"
								></span>
								<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
							</span>
						</Button>
					</div>
				</div>

				<!-- <div class="flex items-center gap-4">
					<div class="hidden flex-col items-end sm:flex">
						<span class="text-xs font-medium">System Status</span>
						<span class="font-code text-[10px] font-bold tracking-widest text-green-500 uppercase">
							Operational
						</span>
					</div>
				</div> -->
			</header>

			<main class="flex-1 overflow-y-auto bg-background p-4 md:p-10">
				<slot />
			</main>
		</div>
	</div>
{/if}
