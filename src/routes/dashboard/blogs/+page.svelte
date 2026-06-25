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

	import {
		ArrowLeft,
		Calendar,
		CheckCircle2,
		Clock,
		Eye,
		Hash,
		Loader2,
		PenTool,
		Plus,
		Search,
		Sparkles,
		Trash2,
		User,
		XCircle
	} from '@lucide/svelte';

	import { db } from '$lib/firebase';

	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import * as Tabs from '$lib/components/ui/tabs';

	let isFormOpen = $state(false);
	let isPreviewOpen = $state(false);
	let isAiLoading = $state(false);
	let isSubmitting = $state(false);
	let editingBlog = $state<any>(null);

	let blogs = $state<any[]>([]);
	let loading = $state(true);

	let statusFilter = $state('all');
	let authorFilter = $state('all');

	let searchQuery = $derived(page.url.searchParams.get('q') || '');
	let localSearch = $derived(searchQuery);

	let formData = $state({
		title: '',
		slug: '',
		excerpt: '',
		content: '',
		author: 'Lead Admin',
		status: 'Draft',
		tags: '',
		featuredImage: '',
		seoTitle: '',
		seoDescription: '',
		readingTime: ''
	});

	$effect(() => {
		const blogsQuery = query(collection(db, 'blogs'), orderBy('updatedAt', 'desc'));

		const unsubscribe = onSnapshot(
			blogsQuery,
			(snapshot) => {
				blogs = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
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

	const filteredBlogs = $derived(
		blogs.filter((blog) => {
			const q = searchQuery.toLowerCase();

			const matchesSearch =
				!q ||
				blog.title?.toLowerCase().includes(q) ||
				blog.tags?.some((tag: string) => tag.toLowerCase().includes(q));

			const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
			const matchesAuthor = authorFilter === 'all' || blog.author === authorFilter;

			return matchesSearch && matchesStatus && matchesAuthor;
		})
	);

	const previewParagraphs = $derived(
		formData.content
			.split('\n')
			.map((para) => para.trim())
			.filter(Boolean)
	);

	const previewTags = $derived(
		formData.tags
			.split(',')
			.map((tag) => tag.trim())
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

	function handleTitleChange(title: string) {
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		formData.title = title;
		formData.slug = slug;
	}

	function resetForm() {
		formData = {
			title: '',
			slug: '',
			excerpt: '',
			content: '',
			author: 'Lead Admin',
			status: 'Draft',
			tags: '',
			featuredImage: '',
			seoTitle: '',
			seoDescription: '',
			readingTime: ''
		};

		editingBlog = null;
	}

	async function handleAiSynthesis() {
		if (!formData.content || !formData.title) {
			alert('Please provide a title and content for AI analysis.');
			return;
		}

		isAiLoading = true;

		setTimeout(() => {
			formData.seoTitle = formData.title;
			formData.seoDescription = formData.excerpt || formData.content.slice(0, 150);
			formData.readingTime = `${Math.max(1, Math.ceil(formData.content.split(' ').length / 200))} min`;

			if (!formData.tags) {
				formData.tags = 'AI, ML, Research';
			}

			isAiLoading = false;
			alert('SEO metadata, tags, and reading time generated.');
		}, 1000);
	}

	function handleOpenEdit(blog: any) {
		editingBlog = blog;

		formData = {
			title: blog.title || '',
			slug: blog.slug || '',
			excerpt: blog.excerpt || '',
			content: blog.content || '',
			author: blog.author || 'Lead Admin',
			status: blog.status || 'Draft',
			tags: blog.tags?.join(', ') || '',
			featuredImage: blog.featuredImage || '',
			seoTitle: blog.seoTitle || '',
			seoDescription: blog.seoDescription || '',
			readingTime: blog.readingTime || ''
		};

		isFormOpen = true;
	}

	async function handleTogglePublish(blog: any) {
		const newStatus = blog.status === 'Published' ? 'Draft' : 'Published';

		await updateDoc(doc(db, 'blogs', blog.id), {
			status: newStatus,
			updatedAt: serverTimestamp(),
			publishedAt: newStatus === 'Published' ? serverTimestamp() : null
		});

		alert(`${blog.title} status updated.`);
	}

	async function handleDelete(blogId: string, title: string) {
		const confirmed = confirm(`Delete "${title}"?`);
		if (!confirmed) return;

		await deleteDoc(doc(db, 'blogs', blogId));
		alert(`${title} removed from registry.`);
	}

	async function handleSubmit() {
		isSubmitting = true;

		const payload = {
			...formData,
			tags: formData.tags
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean),
			updatedAt: serverTimestamp(),
			publishedAt: formData.status === 'Published' ? serverTimestamp() : null
		};

		try {
			if (editingBlog) {
				await updateDoc(doc(db, 'blogs', editingBlog.id), payload);
				alert('Blog updated.');
			} else {
				await addDoc(collection(db, 'blogs'), {
					...payload,
					createdAt: serverTimestamp()
				});
				alert('Article added.');
			}

			isFormOpen = false;
			resetForm();
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-8">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="font-headline text-3xl font-bold tracking-tight">Blog Posts</h1>
			<p class="text-muted-foreground">Manage club news, articles, and research posts.</p>
		</div>

		<Dialog.Root
			bind:open={isFormOpen}
			onOpenChange={(open) => {
				if (!open) resetForm();
			}}
		>
			<Dialog.Trigger>
				<Button class="cursor-pointer shadow-primary/20 font-semibold shadow-lg w-full">
					<Plus class="mr-2 h-4 w-4" />
					Write Blog
				</Button>
			</Dialog.Trigger>

			<Dialog.Content class="max-h-[90vh] max-w-4xl overflow-y-auto">
				<Dialog.Header>
					<Dialog.Title class="font-headline flex items-center gap-2 text-2xl">
						<PenTool class="text-purple-500 h-6 w-6" />
						{editingBlog ? 'Modify Editorial' : 'New Editorial Manuscript'}
					</Dialog.Title>

					<Dialog.Description>
						Compose your research or news post. Use the Intelligence Tool for SEO optimization.
					</Dialog.Description>
				</Dialog.Header>

				<Tabs.Root value="editor" class="mt-4">
					<Tabs.List class="bg-muted w-full justify-start rounded-lg p-1">
						<Tabs.Trigger value="editor" class="flex-1">Post Content</Tabs.Trigger>
						<Tabs.Trigger value="intelligence" class="flex-1">AI Tools</Tabs.Trigger>
						<Tabs.Trigger value="settings" class="flex-1">Settings</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="editor" class="space-y-4 pt-4">
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<label class="text-sm font-semibold" for="title">Manuscript Title</label>
								<Input
									id="title"
									placeholder="Enter a compelling title..."
									class="bg-background/50 font-headline text-lg"
									value={formData.title}
									oninput={(e) => handleTitleChange(e.currentTarget.value)}
								/>
							</div>

							<div class="space-y-2">
								<label class="text-sm font-semibold" for="slug">URL Slug</label>
								<Input
									id="slug"
									placeholder="auto-generated-slug"
									class="bg-background/50 font-code"
									bind:value={formData.slug}
								/>
							</div>
						</div>

						<div class="space-y-2">
							<label class="text-sm font-semibold" for="excerpt">Short Excerpt</label>
							<Textarea
								id="excerpt"
								placeholder="Brief abstract of the article..."
								class="bg-background/50 h-20"
								bind:value={formData.excerpt}
							/>
						</div>

						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label class="text-sm font-semibold" for="content">Body Content Markdown</label>
								<Badge variant="outline" class="font-code text-[10px]">GFM SUPPORTED</Badge>
							</div>

							<Textarea
								id="content"
								placeholder="Write your research findings..."
								class="bg-background/50 min-h-[300px] font-code"
								bind:value={formData.content}
							/>
						</div>
					</Tabs.Content>

					<Tabs.Content value="intelligence" class="space-y-4 pt-4">
						<div class="bg-primary/5 border-primary/20 space-y-4 rounded-xl border p-6 text-center">
							<Sparkles class="text-primary mx-auto h-12 w-12" />
							<h3 class="font-headline text-xl font-bold">AI Metadata Generator</h3>
							<p class="text-muted-foreground mx-auto max-w-md text-sm">
								Let AI analyze your post to generate optimized SEO titles, descriptions, and tags.
							</p>

							<Button
								type="button"
								onclick={handleAiSynthesis}
								disabled={isAiLoading}
								class="bg-primary text-primary-foreground font-bold"
							>
								{#if isAiLoading}
									<div class="flex items-center gap-2">
										<Loader2 class="h-4 w-4 animate-spin" />
										Analyzing...
									</div>
								{:else}
									Generate SEO Metadata
								{/if}
							</Button>
						</div>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<label class="text-sm font-semibold" for="seoTitle">SEO Title</label>
								<Input id="seoTitle" bind:value={formData.seoTitle} class="bg-background/50" />
							</div>

							<div class="space-y-2">
								<label class="text-sm font-semibold" for="readingTime">Reading Time</label>
								<Input
									id="readingTime"
									bind:value={formData.readingTime}
									class="bg-background/50"
								/>
							</div>

							<div class="space-y-2 md:col-span-2">
								<label class="text-sm font-semibold" for="seoDescription">SEO Description</label>
								<Textarea
									id="seoDescription"
									bind:value={formData.seoDescription}
									class="bg-background/50"
								/>
							</div>
						</div>
					</Tabs.Content>

					<Tabs.Content value="settings" class="space-y-4 pt-4">
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<label class="text-sm font-semibold" for="author">Author</label>
								<Input id="author" bind:value={formData.author} class="bg-background/50" />
							</div>

							<div class="space-y-2">
								<label class="text-sm font-semibold" for="tags">Tags (comma separated)</label>
								<Input
									id="tags"
									bind:value={formData.tags}
									placeholder="AI, ML, Research"
									class="bg-background/50"
								/>
							</div>

							<div class="col-span-2 space-y-2">
								<label class="text-sm font-semibold" for="featuredImage">Featured Image URL</label>
								<Input
									id="featuredImage"
									bind:value={formData.featuredImage}
									placeholder="https://..."
									class="bg-background/50"
								/>
							</div>

							<div class="space-y-2">
								<label class="text-sm font-semibold">Status</label>

								<Select.Root type="single" bind:value={formData.status}>
									<Select.Trigger class="bg-background/50">
										{formData.status || 'Select status'}
									</Select.Trigger>

									<Select.Content>
										<Select.Item value="Draft" label="Draft">Draft</Select.Item>
										<Select.Item value="Published" label="Published">Published</Select.Item>
										<Select.Item value="Hidden" label="Hidden">Hidden</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						</div>
					</Tabs.Content>
				</Tabs.Root>

				<Dialog.Footer class="border-border mt-8 gap-2 border-t pt-6">
					<!-- <Button type="button" variant="outline" onclick={() => (isPreviewOpen = true)}>
						<Eye class="mr-2 h-4 w-4" />
						Preview Simulation
					</Button> -->

					<Button onclick={handleSubmit} disabled={isSubmitting} class="font-bold">
						{#if isSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						{editingBlog ? 'Update Post' : 'Create Post'}
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<div
		class="bg-card/50 border-border/50 flex flex-col items-center gap-4 rounded-xl border p-2 md:flex-row"
	>
		<div class="relative flex-1 w-full">
			<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
			<Input
				placeholder="Search manuscripts (Press Enter)..."
				class="border-none bg-transparent pl-9 focus-visible:ring-0"
				bind:value={localSearch}
				onkeydown={(e) => {
					if (e.key === 'Enter') handleSearchTrigger();
				}}
			/>
		</div>

		<div class="flex items-center gap-2">
			<Select.Root type="single" bind:value={statusFilter}>
				<Select.Trigger class="bg-background/50 w-[140px]">
					{statusFilter === 'all' ? 'All Status' : statusFilter}
				</Select.Trigger>

				<Select.Content>
					<Select.Item value="all" label="All Status">All Status</Select.Item>
					<Select.Item value="Published" label="Published">Published</Select.Item>
					<Select.Item value="Draft" label="Draft">Draft</Select.Item>
					<Select.Item value="Hidden" label="Hidden">Hidden</Select.Item>
				</Select.Content>
			</Select.Root>

			<!-- <Button variant="ghost" size="icon">
				<Settings2 class="h-4 w-4" />
			</Button> -->
		</div>
	</div>

	<div class="border-border/50 bg-card overflow-hidden rounded-xl border">
		<Table.Root>
			<Table.Header class="bg-muted/50">
				<Table.Row>
					<Table.Head class="font-headline">Manuscript Title</Table.Head>
					<Table.Head class="font-headline">Controller</Table.Head>
					<Table.Head class="font-headline">State</Table.Head>
					<Table.Head class="font-headline">Metrics</Table.Head>
					<Table.Head class="font-headline text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>

			<Table.Body>
				{#if loading}
					<Table.Row>
						<Table.Cell colspan={5} class="h-32 text-center">
							<div class="flex flex-col items-center gap-2">
								<Loader2 class="text-primary h-6 w-6 animate-spin" />
								<span class="font-code text-xs opacity-50 uppercase">
									Accessing Editorial Registry...
								</span>
							</div>
						</Table.Cell>
					</Table.Row>
				{:else if filteredBlogs.length === 0}
					<Table.Row>
						<Table.Cell colspan={5} class="text-muted-foreground h-32 text-center">
							No manuscripts found matching filter.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each filteredBlogs as blog (blog.id)}
						<Table.Row class="hover:bg-sidebar-accent/50 group transition-colors">
							<Table.Cell class="font-medium">
								<div class="flex items-center gap-3">
									<div
										class="bg-muted border-border h-10 w-14 shrink-0 overflow-hidden rounded border"
									>
										<img
											src={blog.featuredImage || `https://picsum.photos/seed/${blog.id}/100/100`}
											class="h-full w-full object-cover"
											alt=""
										/>
									</div>

									<div class="flex flex-col">
										<span class="line-clamp-1">{blog.title}</span>
										<span class="font-code text-muted-foreground text-[10px]">/{blog.slug}</span>
									</div>
								</div>
							</Table.Cell>

							<Table.Cell>{blog.author}</Table.Cell>

							<Table.Cell>
								<Badge
									variant="outline"
									class={blog.status === 'Published'
										? 'border-green-500/50 bg-green-500/5 text-green-500'
										: 'border-orange-500/50 bg-orange-500/5 text-orange-500'}
								>
									{blog.status}
								</Badge>
							</Table.Cell>

							<Table.Cell class="text-muted-foreground font-code text-xs">
								<div class="flex flex-col gap-1">
									<div class="flex items-center gap-1.5">
										<Clock class="h-3 w-3" />
										{blog.readingTime || '0 min'}
									</div>

									<div class="flex items-center gap-1.5">
										<Calendar class="h-3 w-3" />
										{blog.updatedAt?.toDate?.()
											? blog.updatedAt.toDate().toLocaleDateString()
											: 'Pending'}
									</div>
								</div>
							</Table.Cell>

							<Table.Cell class="text-right">
								<div
									class="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-blue-500 hover:bg-blue-500/10"
										onclick={() => {
											handleOpenEdit(blog);
											isFormOpen = false;
											isPreviewOpen = true;
										}}
										title="Preview"
									>
										<Eye class="h-4 w-4" />
									</Button>

									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-green-500 hover:bg-green-500/10"
										onclick={() => handleTogglePublish(blog)}
										title={blog.status === 'Published' ? 'Unpublish' : 'Publish'}
									>
										{#if blog.status === 'Published'}
											<XCircle class="h-4 w-4" />
										{:else}
											<CheckCircle2 class="h-4 w-4" />
										{/if}
									</Button>

									<Button
										variant="ghost"
										size="icon"
										class="text-purple-500 hover:bg-primary/10 h-8 w-8"
										onclick={() => handleOpenEdit(blog)}
										title="Edit"
									>
										<PenTool class="h-4 w-4" />
									</Button>

									<Button
										variant="ghost"
										size="icon"
										class="text-destructive hover:bg-destructive/10 h-8 w-8"
										onclick={() => handleDelete(blog.id, blog.title)}
										title="Delete"
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<Dialog.Root bind:open={isPreviewOpen}>
		<Dialog.Content class="border-primary/20 max-w-4xl overflow-hidden bg-[#0a0a0c] p-0 text-white">
			<Dialog.Header class="sr-only">
				<Dialog.Title>Editorial Preview Simulation</Dialog.Title>
				<Dialog.Description>
					A simulation of how the article will appear on the public network.
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
						<span class="text-sm font-medium">Exit Preview</span>
					</Button>

					<div class="mx-1 hidden h-4 w-px bg-white/10 sm:block"></div>

					<!-- <div class="flex items-center gap-2">
						<div class="h-3 w-3 rounded-full bg-red-500"></div>
						<div class="h-3 w-3 rounded-full bg-yellow-500"></div>
						<div class="h-3 w-3 rounded-full bg-green-500"></div>
					</div> -->
				</div>

				<span class="font-code hidden text-[10px] tracking-widest uppercase opacity-50 sm:block">
					Public Site Simulation
				</span>
			</div>

			<div class="custom-scrollbar max-h-[70vh] overflow-y-auto p-8 md:p-12">
				<div class="mx-auto max-w-3xl space-y-8">
					<div class="space-y-4">
						<div class="flex items-center gap-3">
							<Badge
								class="bg-primary/20 text-primary border-primary/30 font-code text-[10px] uppercase"
							>
								Editorial Manuscript
							</Badge>

							<span
								class="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-white/40 uppercase"
							>
								<Clock class="h-3 w-3" />
								{formData.readingTime || 'Calculating...'}
							</span>
						</div>

						<h2 class="font-headline text-4xl leading-tight font-bold text-white md:text-5xl">
							{formData.title || 'Manuscript Title'}
						</h2>

						<div class="flex items-center gap-4 pt-2">
							<div
								class="bg-primary/20 border-primary/30 flex h-10 w-10 items-center justify-center rounded-full border"
							>
								<User class="text-primary h-5 w-5" />
							</div>

							<div>
								<p class="text-sm font-bold text-white">
									{formData.author || 'Lead Intelligence Controller'}
								</p>
								<p class="font-code text-[10px] text-white/50 uppercase">
									Published {new Date().toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>

					<div
						class="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-white/10"
					>
						<img
							src={formData.featuredImage || 'https://picsum.photos/seed/editorial/1200/600'}
							class="h-full w-full object-cover grayscale-[0.2] transition-all duration-700 hover:grayscale-0"
							alt="Feature"
						/>
					</div>

					<div class="space-y-6">
						<p
							class="border-primary/50 pl-6 text-xl leading-relaxed font-medium text-white/70 italic"
						>
							{formData.excerpt ||
								'Manuscript abstract describing the primary vector of research or intelligence update.'}
						</p>

						<div class="prose prose-invert max-w-none space-y-4 leading-loose text-white/80">
							{#if previewParagraphs.length > 0}
								{#each previewParagraphs as para, i (`para-${i}`)}
									<p>{para}</p>
								{/each}
							{:else}
								<p class="opacity-30 italic">No content initialized in editor...</p>
							{/if}
						</div>

						<div class="flex flex-wrap gap-2 border-t border-white/10 pt-8">
							{#each previewTags as tag (tag)}
								<div
									class="flex cursor-default items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/60 transition-colors hover:text-primary"
								>
									<Hash class="h-3 w-3" />
									{tag.toUpperCase()}
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div
				class="bg-primary text-primary-foreground p-4 text-center text-[10px] font-bold tracking-widest uppercase"
			>
				ML Club NIT Silchar
			</div>
		</Dialog.Content>
	</Dialog.Root>
</div>
