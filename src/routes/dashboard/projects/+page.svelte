<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import {
		addDoc,
		collection,
		deleteDoc,
		doc,
		onSnapshot,
		orderBy,
		query,
		serverTimestamp,
		updateDoc
	} from 'firebase/firestore';

	import { db } from '$lib/firebase';

	import Icon from '@iconify/svelte';

	import {
		ArrowLeft,
		Edit2,
		ExternalLink,
		FolderGit2,
		Globe,
		LayoutGrid,
		List as ListIcon,
		Loader2,
		Plus,
		Search,
		Star,
		Trash2
	} from '@lucide/svelte';

	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';

	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';

	type ViewMode = 'grid' | 'table';

	type Project = {
		id: string;
		title?: string;
		shortDescription?: string;
		detailedDescription?: string;
		imageUrl?: string;
		githubUrl?: string;
		demoUrl?: string;
		category?: string;
		status?: string;
		featured?: boolean;
		techStack?: string[];
		teamMembers?: string[];
		updatedAt?: {
			toDate?: () => Date;
		};
	};

	const github = `
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
		stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37
		3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54
		6.44-7A5.44 5.44 0 0 0 20 4.77
		5.07 5.07 0 0 0 19.91 1S18.73.65
		16 2.48a13.38 13.38 0 0 0-7 0C6.27.65
		5.09 1 5.09 1A5.07 5.07 0 0 0 5
		4.77a5.44 5.44 0 0 0-1.5 3.78c0
		5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0
		9 18.13V22"/>
	</svg>`;
	const categories = ['ML', 'Web', 'Computer Vision', 'NLP', 'Data Science', 'Other'];
	const statuses = ['Draft', 'Published', 'Hidden'];

	let viewMode = $state<ViewMode>('grid');

	let isFormOpen = $state(false);
	let isPreviewOpen = $state(false);
	let editingProject = $state<Project | null>(null);
	let isSubmitting = $state(false);

	let categoryFilter = $state('all');
	let statusFilter = $state('all');
	let featuredFilter = $state('all');

	let projects = $state<Project[]>([]);
	let loading = $state(true);

	let searchQuery = $derived(page.url.searchParams.get('q') || '');
	let localSearch = $state(searchQuery);

	let formData = $state({
		title: '',
		shortDescription: '',
		detailedDescription: '',
		imageUrl: '',
		githubUrl: '',
		demoUrl: '',
		category: 'ML',
		status: 'Draft',
		featured: false,
		techStack: '',
		teamMembers: ''
	});

	$effect(() => {
		localSearch = searchQuery;
	});

	$effect(() => {
		const projectsQuery = query(collection(db, 'projects'), orderBy('updatedAt', 'desc'));

		const unsubscribe = onSnapshot(
			projectsQuery,
			(snapshot) => {
				projects = snapshot.docs.map((document) => ({
					id: document.id,
					...document.data()
				}));

				loading = false;
			},
			(error) => {
				console.error(error);
				loading = false;
			}
		);

		return unsubscribe;
	});

	const filteredProjects = $derived(
		projects.filter((project) => {
			const q = searchQuery.toLowerCase();

			const matchesSearch =
				!q ||
				project.title?.toLowerCase().includes(q) ||
				project.techStack?.some((tech) => tech.toLowerCase().includes(q));

			const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
			const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

			const matchesFeatured =
				featuredFilter === 'all' ||
				(featuredFilter === 'featured' && project.featured) ||
				(featuredFilter === 'regular' && !project.featured);

			return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
		})
	);

	const previewTechStack = $derived(
		formData.techStack
			.split(',')
			.map((tech) => tech.trim())
			.filter(Boolean)
	);

	const previewTeamMembers = $derived(
		formData.teamMembers
			.split(',')
			.map((member) => member.trim())
			.filter(Boolean)
	);

	function handleSearchTrigger() {
		const params = new URLSearchParams(page.url.searchParams);

		if (localSearch.trim()) {
			params.set('q', localSearch.trim());
		} else {
			params.delete('q');
		}

		const queryString = params.toString();

		goto(queryString ? `${page.url.pathname}?${queryString}` : page.url.pathname, {
			replaceState: true
		});
	}

	function resetForm() {
		formData = {
			title: '',
			shortDescription: '',
			detailedDescription: '',
			imageUrl: '',
			githubUrl: '',
			demoUrl: '',
			category: 'ML',
			status: 'Draft',
			featured: false,
			techStack: '',
			teamMembers: ''
		};

		editingProject = null;
	}

	function handleOpenCreate() {
		resetForm();
		isFormOpen = true;
	}

	function handleOpenEdit(project: Project) {
		editingProject = project;

		formData = {
			title: project.title || '',
			shortDescription: project.shortDescription || '',
			detailedDescription: project.detailedDescription || '',
			imageUrl: project.imageUrl || '',
			githubUrl: project.githubUrl || '',
			demoUrl: project.demoUrl || '',
			category: project.category || 'ML',
			status: project.status || 'Draft',
			featured: project.featured || false,
			techStack: project.techStack?.join(', ') || '',
			teamMembers: project.teamMembers?.join(', ') || ''
		};

		isFormOpen = true;
	}

	async function handleDelete(projectId: string, title: string) {
		const confirmed = confirm(`Delete "${title}"?`);
		if (!confirmed) return;

		await deleteDoc(doc(db, 'projects', projectId));

		alert(`${title} has been removed from the archives.`);
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		isSubmitting = true;

		const payload = {
			...formData,
			techStack: formData.techStack
				.split(',')
				.map((tech) => tech.trim())
				.filter(Boolean),
			teamMembers: formData.teamMembers
				.split(',')
				.map((member) => member.trim())
				.filter(Boolean),
			updatedAt: serverTimestamp()
		};

		try {
			if (editingProject) {
				await updateDoc(doc(db, 'projects', editingProject.id), payload);
				alert(`${payload.title} updates are now live.`);
			} else {
				await addDoc(collection(db, 'projects'), {
					...payload,
					createdAt: serverTimestamp()
				});

				alert(`${payload.title} has been added to the portfolio.`);
			}

			isFormOpen = false;
			resetForm();
		} catch (error) {
			console.error(error);
			alert('Something went wrong while saving this project.');
		} finally {
			isSubmitting = false;
		}
	}

	function clearSearchParameters() {
		localSearch = '';
		categoryFilter = 'all';
		statusFilter = 'all';
		featuredFilter = 'all';

		goto(page.url.pathname, {
			replaceState: true
		});
	}
</script>

<div class="space-y-8 pb-20">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="font-headline text-3xl font-bold tracking-tight">Projects</h1>
			<p class="text-muted-foreground">Manage the club's research and development portfolio.</p>
		</div>

		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="icon"
				onclick={() => (viewMode = viewMode === 'grid' ? 'table' : 'grid')}
				class="border-border/50"
			>
				{#if viewMode === 'grid'}
					<ListIcon class="h-4 w-4" />
				{:else}
					<LayoutGrid class="h-4 w-4" />
				{/if}
			</Button>

			<Button
				onclick={handleOpenCreate}
				class="cursor-pointer shadow-primary/20 font-bold shadow-lg"
			>
				<Plus class="mr-2 h-4 w-4" />
				Add Project
			</Button>
		</div>
	</div>

	<Dialog.Root
		open={isFormOpen}
		onOpenChange={(open) => {
			isFormOpen = open;
			if (!open) resetForm();
		}}
	>
		<Dialog.Content class="max-h-[90vh] max-w-2xl overflow-y-auto">
			<Dialog.Header>
				<Dialog.Title>
					{editingProject ? 'Modify Intelligence' : 'Project Initialization'}
				</Dialog.Title>

				<Dialog.Description>Enter the project details below.</Dialog.Description>
			</Dialog.Header>

			<form onsubmit={handleSubmit} class="space-y-6 py-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="col-span-2 space-y-2">
						<Label for="title">Project Title</Label>
						<Input
							id="title"
							placeholder="e.g., VisionAI Hub"
							bind:value={formData.title}
							required
						/>
					</div>

					<div class="col-span-2 space-y-2">
						<Label for="shortDescription">Short Abstract</Label>
						<Input
							id="shortDescription"
							placeholder="One-line project summary"
							bind:value={formData.shortDescription}
							required
						/>
					</div>

					<div class="space-y-2">
						<Label>Category</Label>

						<Select.Root type="single" bind:value={formData.category}>
							<Select.Trigger>
								{formData.category}
							</Select.Trigger>

							<Select.Content>
								{#each categories as category (category)}
									<Select.Item value={category}>{category}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div class="space-y-2">
						<Label>Classification State</Label>

						<Select.Root type="single" bind:value={formData.status}>
							<Select.Trigger>
								{formData.status}
							</Select.Trigger>

							<Select.Content>
								{#each statuses as status (status)}
									<Select.Item value={status}>{status}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div class="col-span-2 space-y-2">
						<Label for="imageUrl">Cover Asset URL</Label>
						<Input id="imageUrl" placeholder="https://..." bind:value={formData.imageUrl} />
					</div>

					<div class="space-y-2">
						<Label for="githubUrl">GitHub Repository</Label>
						<Input
							id="githubUrl"
							placeholder="https://github.com/..."
							bind:value={formData.githubUrl}
						/>
					</div>

					<div class="space-y-2">
						<Label for="demoUrl">Live Deployment</Label>
						<Input id="demoUrl" placeholder="https://..." bind:value={formData.demoUrl} />
					</div>
				</div>

				<div class="space-y-2">
					<Label for="detailedDescription">Detailed Research Findings</Label>
					<Textarea
						id="detailedDescription"
						placeholder="Provide in-depth documentation..."
						class="min-h-[100px]"
						bind:value={formData.detailedDescription}
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="techStack">Tech Stack Comma Separated</Label>
						<Input
							id="techStack"
							placeholder="React, TensorFlow, PyTorch"
							bind:value={formData.techStack}
						/>
					</div>

					<div class="space-y-2">
						<Label for="teamMembers">Operatives Comma Separated</Label>
						<Input
							id="teamMembers"
							placeholder="Dr. Neural, Jane Doe"
							bind:value={formData.teamMembers}
						/>
					</div>
				</div>

				<div
					class="bg-muted/50 border-border flex items-center justify-between rounded-xl border p-4"
				>
					<div class="space-y-0.5">
						<Label>Featured Venture</Label>
						<p class="text-muted-foreground text-xs">
							Prioritize this in the primary network feed.
						</p>
					</div>

					<Switch
						checked={formData.featured}
						onCheckedChange={(checked) => {
							formData.featured = checked;
						}}
					/>
				</div>

				<Dialog.Footer class="gap-2">
					<!-- <Button type="button" variant="outline" onclick={() => (isPreviewOpen = true)}>
						<Eye class="mr-2 h-4 w-4" />
						Preview Simulation
					</Button> -->

					<Button type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{:else}
							<FolderGit2 class="mr-2 h-4 w-4" />
						{/if}

						{editingProject ? 'Update Project' : 'Add Project'}
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<Card.Root class="border-border/50 bg-card/50 backdrop-blur-md">
		<Card.Content class="grid grid-cols-1 gap-4 p-4 md:grid-cols-4">
			<div class="relative col-span-1 md:col-span-1">
				<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<Input
					placeholder="Search projects (Press Enter)..."
					class="bg-background/50 border-border pl-9"
					bind:value={localSearch}
					onkeydown={(event) => {
						if (event.key === 'Enter') handleSearchTrigger();
					}}
				/>
			</div>

			<Select.Root type="single" bind:value={categoryFilter}>
				<Select.Trigger class="bg-background/50 border-border w-full">
					{categoryFilter === 'all' ? 'All Categories' : categoryFilter}
				</Select.Trigger>

				<Select.Content>
					<Select.Item value="all">All Categories</Select.Item>

					{#each categories as category (category)}
						<Select.Item value={category}>{category}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<Select.Root type="single" bind:value={statusFilter}>
				<Select.Trigger class="bg-background/50 border-border w-full">
					{statusFilter === 'all' ? 'All Status' : statusFilter}
				</Select.Trigger>

				<Select.Content>
					<Select.Item value="all">All Status</Select.Item>

					{#each statuses as status (status)}
						<Select.Item value={status}>{status}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<Select.Root type="single" bind:value={featuredFilter}>
				<Select.Trigger class="bg-background/50 border-border w-full">
					{featuredFilter === 'all'
						? 'All Projects'
						: featuredFilter === 'featured'
							? 'Featured Only'
							: 'Regular Only'}
				</Select.Trigger>

				<Select.Content>
					<Select.Item value="all">All Projects</Select.Item>
					<Select.Item value="featured">Featured Only</Select.Item>
					<Select.Item value="regular">Regular Only</Select.Item>
				</Select.Content>
			</Select.Root>
		</Card.Content>
	</Card.Root>

	{#if loading}
		<div class="flex flex-col items-center justify-center gap-4 py-20">
			<Loader2 class="text-primary h-8 w-8 animate-spin" />
			<p class="text-muted-foreground font-code text-xs tracking-widest uppercase">
				Accessing Venture Registry...
			</p>
		</div>
	{:else if filteredProjects.length === 0}
		<div class="border-border bg-muted/20 rounded-2xl border-2 border-dashed py-20 text-center">
			<FolderGit2 class="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
			<h3 class="font-headline text-xl font-bold">No Records Found</h3>
			<p class="text-muted-foreground mt-2">No projects match the current intelligence filter.</p>

			<Button variant="link" onclick={clearSearchParameters}>Clear Search Parameters</Button>
		</div>
	{:else if viewMode === 'grid'}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredProjects as project (project.id)}
				<Card.Root
					class="border border-border/50 bg-card hover:border-primary/50 group overflow-hidden transition-all duration-300"
				>
					<div class="bg-muted relative aspect-video overflow-hidden">
						<img
							src={project.imageUrl || `https://picsum.photos/seed/${project.id}/600/400`}
							alt={project.title}
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
						/>

						<div
							class="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<div class="flex w-full gap-2">
								<Button
									size="sm"
									variant="secondary"
									class="flex-1"
									onclick={() => handleOpenEdit(project)}
								>
									<Edit2 class="mr-2 h-3 w-3" />
									Edit
								</Button>

								<Button
									size="sm"
									variant="destructive"
									onclick={() => handleDelete(project.id, project.title || 'Untitled Project')}
								>
									<Trash2 class="h-3 w-3" />
								</Button>
							</div>
						</div>

						{#if project.featured}
							<Badge
								class="bg-primary text-primary-foreground absolute top-3 left-3 border-none font-bold"
							>
								<Star class="mr-1 h-3 w-3 fill-current" />
								FEATURED
							</Badge>
						{/if}

						<Badge
							variant="outline"
							class={`absolute top-3 right-3 backdrop-blur-md ${
								project.status === 'Published'
									? 'border-green-500/50 bg-green-500/20 text-green-400'
									: project.status === 'Draft'
										? 'border-orange-500/50 bg-orange-500/20 text-orange-400'
										: 'border-gray-500/50 bg-gray-500/20 text-gray-400'
							}`}
						>
							{project.status}
						</Badge>
					</div>

					<Card.Content class="space-y-4 p-5">
						<div>
							<div class="mb-1 flex items-center justify-between">
								<span class="text-primary text-[10px] font-bold tracking-widest uppercase">
									{project.category}
								</span>

								<span class="text-muted-foreground font-code text-[10px]">
									{project.updatedAt?.toDate?.()
										? project.updatedAt.toDate().toLocaleDateString()
										: 'N/A'}
								</span>
							</div>

							<h3 class="font-headline line-clamp-1 text-xl font-bold">
								{project.title}
							</h3>

							<p class="text-muted-foreground mt-2 line-clamp-2 text-sm">
								{project.shortDescription}
							</p>
						</div>

						<div class="flex flex-wrap gap-1.5">
							{#each project.techStack?.slice(0, 3) || [] as tech (tech)}
								<Badge variant="secondary" class="font-code px-1.5 py-0 text-[9px]">
									{tech}
								</Badge>
							{/each}

							{#if project.techStack && project.techStack.length > 3}
								<Badge variant="outline" class="font-code px-1.5 py-0 text-[9px]">
									+{project.techStack.length - 3}
								</Badge>
							{/if}
						</div>

						<div class="border-border/50 flex items-center justify-between border-t pt-4">
							<div class="flex -space-x-2">
								{#each project.teamMembers?.slice(0, 3) || [] as name, index (`${name}-${index}`)}
									<div
										class="border-card bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold"
										title={name}
									>
										{name.charAt(0)}
									</div>
								{/each}
							</div>

							<div class="flex gap-2">
								{#if project.githubUrl}
									<a href={project.githubUrl} target="_blank" rel="noreferrer">
										<!-- <span
											class="text-muted-foreground hover:text-foreground text-xs font-bold transition-colors"
										> -->
										<Icon
											class="text-muted-foreground hover:text-foreground h-4 w-4 transition-colors"
											icon="mdi:github"
											width="20"
										/>
										<!-- </span> -->
									</a>
								{/if}

								{#if project.demoUrl}
									<a href={project.demoUrl} target="_blank" rel="noreferrer">
										<Globe
											class="text-muted-foreground hover:text-foreground h-4 w-4 transition-colors"
										/>
									</a>
								{/if}
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else}
		<Card.Root class="border-border/50 bg-card overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-muted/50 border-border border-b">
						<tr>
							<th class="font-headline p-4 text-left">Project Entity</th>
							<th class="font-headline p-4 text-left">Category</th>
							<th class="font-headline p-4 text-left">Status</th>
							<th class="font-headline p-4 text-left">Featured</th>
							<th class="font-headline p-4 text-left">Last Updated</th>
							<th class="font-headline p-4 text-right">Actions</th>
						</tr>
					</thead>

					<tbody class="divide-border/50 divide-y">
						{#each filteredProjects as project (project.id)}
							<tr class="hover:bg-sidebar-accent/30 group transition-colors">
								<td class="p-4">
									<div class="flex items-center gap-3">
										<div class="bg-muted border-border h-10 w-14 overflow-hidden rounded border">
											<img
												src={project.imageUrl || `https://picsum.photos/seed/${project.id}/100/100`}
												class="h-full w-full object-cover"
												alt=""
											/>
										</div>

										<div>
											<p class="font-bold">{project.title}</p>
											<p class="text-muted-foreground line-clamp-1 max-w-[200px] text-xs">
												{project.shortDescription}
											</p>
										</div>
									</div>
								</td>

								<td class="p-4">
									<Badge variant="outline" class="text-[10px]">
										{project.category}
									</Badge>
								</td>

								<td class="p-4">
									<Badge
										class={project.status === 'Published'
											? 'bg-green-500/20 text-green-400'
											: 'bg-orange-500/20 text-orange-400'}
									>
										{project.status}
									</Badge>
								</td>

								<td class="p-4">
									{#if project.featured}
										<Star class="text-primary h-4 w-4 fill-current" />
									{:else}
										<Star class="text-muted-foreground/30 h-4 w-4" />
									{/if}
								</td>

								<td class="text-muted-foreground font-code p-4 text-xs">
									{project.updatedAt?.toDate?.()
										? project.updatedAt.toDate().toLocaleDateString()
										: 'N/A'}
								</td>

								<td class="p-4 text-right">
									<div class="flex items-center justify-end gap-2">
										<Button
											variant="ghost"
											size="icon"
											class="text-primary h-8 w-8"
											onclick={() => handleOpenEdit(project)}
										>
											<Edit2 class="h-4 w-4" />
										</Button>

										<Button
											variant="ghost"
											size="icon"
											class="text-destructive h-8 w-8"
											onclick={() => handleDelete(project.id, project.title || 'Untitled Project')}
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card.Root>
	{/if}

	<Dialog.Root bind:open={isPreviewOpen}>
		<Dialog.Content class="border-primary/20 max-w-2xl overflow-hidden bg-[#0a0a0c] p-0 text-white">
			<Dialog.Header class="sr-only">
				<Dialog.Title>Project Preview Simulation</Dialog.Title>
				<Dialog.Description>
					A simulation of how the project will appear on the public network.
				</Dialog.Description>
			</Dialog.Header>

			<div class="flex items-center justify-between border-b border-white/10 p-6">
				<div class="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						class="flex h-8 items-center gap-1.5 px-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
						onclick={() => (isPreviewOpen = false)}
					>
						<ArrowLeft class="h-4 w-4" />
						<span class="text-sm font-medium">Back to Editor</span>
					</Button>

					<div class="mx-1 hidden h-4 w-px bg-white/10 sm:block"></div>

					<div class="flex items-center gap-2">
						<div class="h-3 w-3 rounded-full bg-red-500"></div>
						<div class="h-3 w-3 rounded-full bg-yellow-500"></div>
						<div class="h-3 w-3 rounded-full bg-green-500"></div>
					</div>
				</div>

				<span class="font-code hidden text-[10px] tracking-widest uppercase opacity-50 sm:block">
					Live Simulation Preview
				</span>
			</div>

			<div class="space-y-8 p-8">
				<div class="bg-muted relative aspect-video w-full overflow-hidden rounded-2xl">
					<img
						src={formData.imageUrl || 'https://picsum.photos/seed/preview/800/400'}
						class="h-full w-full object-cover"
						alt="Preview"
					/>

					<div class="absolute top-4 right-4 flex gap-2">
						<Badge class="bg-primary/90 text-primary-foreground font-bold backdrop-blur-md">
							{formData.category}
						</Badge>

						{#if formData.featured}
							<Badge class="bg-yellow-500 font-bold text-black">FEATURED</Badge>
						{/if}
					</div>
				</div>

				<div class="space-y-4">
					<h2
						class="font-headline from-primary to-secondary bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent"
					>
						{formData.title || 'Project Title'}
					</h2>

					<p class="text-muted-foreground text-xl leading-relaxed">
						{formData.shortDescription ||
							"A short abstract describing the project's core intelligence and purpose."}
					</p>

					<div class="flex flex-wrap gap-2 pt-4">
						{#each previewTechStack as tech (tech)}
							<Badge
								variant="outline"
								class="font-code border-white/10 bg-white/5 px-3 py-1 text-xs"
							>
								{tech}
							</Badge>
						{/each}
					</div>

					<div class="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
						<div class="space-y-3">
							<h4 class="text-primary text-[10px] font-bold tracking-widest uppercase">
								Team Operatives
							</h4>

							<div class="flex items-center gap-2">
								{#each previewTeamMembers as name, index (`${name}-${index}`)}
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-bold"
										title={name}
									>
										{name.charAt(0)}
									</div>
								{/each}
							</div>
						</div>

						<div class="space-y-3">
							<h4 class="text-primary text-[10px] font-bold tracking-widest uppercase">Connect</h4>

							<div class="flex items-center gap-4">
								{#if formData.githubUrl}
									<span
										class="text-muted-foreground hover:text-foreground text-xs font-bold transition-colors"
									>
										<SiGithub size={24} color="currentColor" />
									</span>
								{/if}

								{#if formData.demoUrl}
									<Globe class="h-5 w-5 cursor-pointer opacity-50 hover:opacity-100" />
								{/if}

								<ExternalLink class="h-5 w-5 cursor-pointer opacity-50 hover:opacity-100" />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-primary text-primary-foreground p-4 text-center text-xs font-bold">
				SIMULATION MODE ACTIVE • ASSETS READY FOR DEPLOYMENT
			</div>
		</Dialog.Content>
	</Dialog.Root>
</div>
