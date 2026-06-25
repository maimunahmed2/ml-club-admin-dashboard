<script lang="ts">
	import {
		CheckCircle2,
		ChevronRight,
		FileEdit,
		FolderGit2,
		PenTool,
		Plus,
		UserPlus,
		Users
	} from '@lucide/svelte';
	import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
	import { onMount } from 'svelte';

	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { db } from '$lib/firebase';

	let members = $state<any[]>([]);
	let projects = $state<any[]>([]);
	let blogs = $state<any[]>([]);
	let latestMember = $state<any | null>(null);

	let loading = $state(true);

	onMount(async () => {
		try {
			const membersSnap = await getDocs(collection(db, 'members'));
			const projectsSnap = await getDocs(collection(db, 'projects'));
			const blogsSnap = await getDocs(collection(db, 'blogs'));

			members = membersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			projects = projectsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			blogs = blogsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

			const latestMemberSnap = await getDocs(
				query(collection(db, 'members'), orderBy('createdAt', 'desc'), limit(1))
			);

			latestMember = latestMemberSnap.docs[0]
				? { id: latestMemberSnap.docs[0].id, ...latestMemberSnap.docs[0].data() }
				: null;
		} catch (error) {
			console.error('Dashboard load error:', error);
		} finally {
			loading = false;
		}
	});

	const activeMembers = $derived(members.filter((m) => m.status === 'Active'));

	const publishedProjects = $derived(projects.filter((p) => p.status === 'Published'));

	const publishedBlogs = $derived(blogs.filter((b) => b.status === 'Published'));

	const draftBlogs = $derived(blogs.filter((b) => b.status === 'Draft'));

	const stats = $derived([
		{
			id: 'total-members',
			title: 'Total Members',
			value: loading ? '...' : members.length.toString(),
			icon: Users,
			color: 'text-blue-500',
			trend: 'Total registered'
		},
		{
			id: 'active-members',
			title: 'Active Members',
			value: loading ? '...' : activeMembers.length.toString(),
			icon: CheckCircle2,
			color: 'text-green-500',
			trend: `${members.length > 0 ? Math.round((activeMembers.length / members.length) * 100) : 0}% ratio`
		},
		{
			id: 'total-projects',
			title: 'Total Projects',
			value: loading ? '...' : projects.length.toString(),
			icon: FolderGit2,
			color: 'text-primary',
			trend: `${publishedProjects.length} published`
		},
		{
			id: 'published-blogs',
			title: 'Published Blogs',
			value: loading ? '...' : publishedBlogs.length.toString(),
			icon: PenTool,
			color: 'text-purple-500',
			trend: `${draftBlogs.length} in draft`
		}
	]);

	const quickActions = [
		{
			id: 'member',
			label: 'Add Member',
			icon: UserPlus,
			color: 'bg-blue-500/10 text-blue-500',
			href: '/dashboard/members'
		},
		{
			id: 'project',
			label: 'Add Project',
			icon: Plus,
			color: 'bg-primary/10 text-primary',
			href: '/dashboard/projects'
		},
		{
			id: 'blog',
			label: 'Write Blog',
			icon: FileEdit,
			color: 'bg-orange-500/10 text-orange-500',
			href: '/dashboard/blogs'
		}
	];
</script>

<div class="space-y-8">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="font-headline text-3xl font-bold tracking-tight">Overview</h1>
			<p class="text-muted-foreground">Quick insights into the ML Club's activity.</p>
		</div>

		<div class="flex items-center gap-3">
			{#each quickActions as action (action.id)}
				<Button
					variant="outline"
					class="border-border/50 bg-card hover:bg-sidebar-accent transition-all"
					href={action.href}
				>
					<svelte:component this={action.icon} class="mr-2 h-4 w-4" />
					{action.label}
				</Button>
			{/each}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat (stat.id)}
			<Card.Root
				class="border border-border/50 bg-card hover:border-primary/50 group cursor-default transition-colors"
			>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title
						class="text-muted-foreground group-hover:text-primary text-sm font-medium transition-colors"
					>
						{stat.title}
					</Card.Title>

					<svelte:component this={stat.icon} class={`h-4 w-4 ${stat.color}`} />
				</Card.Header>

				<Card.Content>
					<div class="font-headline text-2xl font-bold">{stat.value}</div>

					<p class="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
						<ChevronRight class="text-primary h-3 w-3" />
						{stat.trend}
					</p>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- <Card.Root class="border-border/50 bg-card">
			<Card.Header>
				<Card.Title class="font-headline">Quick Toggles</Card.Title>
				<Card.Description>Instant visibility controls.</Card.Description>
			</Card.Header>

			<Card.Content class="space-y-4">
				<div class="flex flex-col gap-3">
					<div
						class="bg-sidebar-accent border-border/50 flex items-center justify-between rounded-lg border p-3 cursor-not-allowed"
					>
						<span class="text-sm font-medium">Recruitment Portal</span>
						<Badge variant="outline" class="border-green-500/50 text-green-500">LIVE</Badge>
					</div>

					<div
						class="bg-sidebar-accent border-border/50 flex items-center justify-between rounded-lg border p-3 cursor-not-allowed"
					>
						<span class="text-sm font-medium">Draft Projects</span>
						<Badge variant="outline" class="border-orange-500/50 text-orange-500">HIDDEN</Badge>
					</div>

					<div
						class="bg-sidebar-accent border-border/50 flex items-center justify-between rounded-lg border p-3 cursor-not-allowed"
					>
						<span class="text-sm font-medium">Public Blog API</span>
						<Badge variant="outline" class="border-blue-500/50 text-blue-500 cursor-not-allowed"
							>READ-ONLY</Badge
						>
					</div>
				</div>
			</Card.Content>
		</Card.Root> -->

		<Card.Root class="border-border/50 bg-card">
			<Card.Header>
				<Card.Title class="font-headline">Latest Member</Card.Title>
				<Card.Description>Recently verified operative.</Card.Description>
			</Card.Header>

			<Card.Content>
				{#if loading}
					<div class="flex animate-pulse items-center gap-4">
						<div class="bg-muted h-12 w-12 rounded-full"></div>
						<div class="space-y-2">
							<div class="bg-muted h-4 w-24 rounded"></div>
							<div class="bg-muted h-3 w-32 rounded"></div>
						</div>
					</div>
				{:else if latestMember}
					<div class="flex items-center gap-4">
						<Avatar.Root class="border-primary/20 h-12 w-12 border-2">
							<Avatar.Image src={latestMember.avatar} />
							<Avatar.Fallback>
								{latestMember.name?.charAt(0)}
							</Avatar.Fallback>
						</Avatar.Root>

						<div>
							<p class="text-sm font-semibold">{latestMember.name}</p>
							<p class="text-muted-foreground text-xs">{latestMember.position}</p>
						</div>

						<Button
							size="sm"
							variant="ghost"
							class="text-primary ml-auto"
							href="/dashboard/members"
						>
							View Registry
						</Button>
					</div>
				{:else}
					<div class="text-muted-foreground py-4 text-center text-sm italic">
						No personnel records found.
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
