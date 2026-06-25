<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import {
		addDoc,
		collection,
		deleteDoc,
		doc,
		onSnapshot,
		serverTimestamp,
		updateDoc
	} from 'firebase/firestore';

	import {
		Building2,
		Edit2,
		GraduationCap,
		Loader2,
		Plus,
		Search,
		Trash2,
		User
	} from '@lucide/svelte';

	import { db } from '$lib/firebase';

	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	import * as Avatar from '$lib/components/ui/avatar';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';

	type Member = {
		id: string;
		name?: string;
		position?: string;
		type?: string;
		batch?: string;
		dept?: string;
		status?: string;
		avatar?: string;
		linkedin?: string;
		github?: string;
		facebook?: string;
	};

	const memberTypes = ['Executive', 'Senior', 'Junior', 'Alumni'];

	let members = $state<Member[]>([]);
	let loading = $state(true);

	let isAddDialogOpen = $state(false);
	let isEditDialogOpen = $state(false);
	let editingMember = $state<Member | null>(null);
	let isSubmitting = $state(false);

	let typeFilter = $state('all');

	let searchQuery = $derived(page.url.searchParams.get('q') || '');
	let localSearch = $state(searchQuery);

	let addForm = $state({
		name: '',
		position: '',
		type: 'Junior',
		batch: '',
		dept: '',
		linkedin: '',
		github: '',
		facebook: ''
	});

	let editForm = $state({
		name: '',
		position: '',
		type: 'Junior',
		batch: '',
		dept: '',
		linkedin: '',
		github: '',
		facebook: ''
	});

	$effect(() => {
		localSearch = searchQuery;
	});

	$effect(() => {
		const membersRef = collection(db, 'members');

		const unsubscribe = onSnapshot(
			membersRef,
			(snapshot) => {
				members = snapshot.docs.map((document) => ({
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

	const filteredMembers = $derived(
		members.filter((member) => {
			const q = searchQuery.toLowerCase();

			const matchesSearch =
				!q ||
				member.name?.toLowerCase().includes(q) ||
				member.dept?.toLowerCase().includes(q) ||
				member.position?.toLowerCase().includes(q) ||
				member.batch?.toLowerCase().includes(q);

			const matchesType =
				typeFilter === 'all' || member.type?.toLowerCase() === typeFilter.toLowerCase();

			return matchesSearch && matchesType;
		})
	);

	function resetAddForm() {
		addForm = {
			name: '',
			position: '',
			type: 'Junior',
			batch: '',
			dept: '',
			linkedin: '',
			github: '',
			facebook: ''
		};
	}

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

	async function handleDelete(memberId: string, name: string) {
		const confirmed = confirm(`Remove "${name}" from the registry?`);
		if (!confirmed) return;

		try {
			await deleteDoc(doc(db, 'members', memberId));
			alert(`${name} has been removed from the registry.`);
		} catch (error) {
			console.error(error);
			alert('Could not delete this member. Check your Firestore permissions.');
		}
	}

	async function handleAddMember(event: SubmitEvent) {
		event.preventDefault();

		isSubmitting = true;

		const newMember = {
			name: addForm.name,
			position: addForm.position,
			type: addForm.type,
			batch: addForm.batch,
			dept: addForm.dept,
			status: 'Active',
			avatar: `https://picsum.photos/seed/${addForm.name}/100/100`,
			linkedin: addForm.linkedin,
			github: addForm.github,
			facebook: addForm.facebook,
			createdAt: serverTimestamp()
		};

		try {
			await addDoc(collection(db, 'members'), newMember);

			alert(`${newMember.name} is now part of the registry.`);
			isAddDialogOpen = false;
			resetAddForm();
		} catch (error) {
			console.error(error);
			alert('Could not add this member. Check your Firestore permissions.');
		} finally {
			isSubmitting = false;
		}
	}

	function openEditDialog(member: Member) {
		editingMember = member;

		editForm = {
			name: member.name || '',
			position: member.position || '',
			type: member.type || 'Junior',
			batch: member.batch || '',
			dept: member.dept || '',
			linkedin: member.linkedin || '',
			github: member.github || '',
			facebook: member.facebook || ''
		};

		isEditDialogOpen = true;
	}

	async function handleEditMember(event: SubmitEvent) {
		event.preventDefault();

		if (!editingMember) return;

		isSubmitting = true;

		const updatedData = {
			name: editForm.name,
			position: editForm.position,
			type: editForm.type,
			batch: editForm.batch,
			dept: editForm.dept,
			linkedin: editForm.linkedin,
			github: editForm.github,
			facebook: editForm.facebook,
			updatedAt: serverTimestamp()
		};

		try {
			await updateDoc(doc(db, 'members', editingMember.id), updatedData);

			alert(`Credentials for ${updatedData.name} have been updated.`);
			isEditDialogOpen = false;
			editingMember = null;
		} catch (error) {
			console.error(error);
			alert('Could not update this member. Check your Firestore permissions.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-8">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="font-headline text-3xl font-bold tracking-tight">Members</h1>
			<p class="text-muted-foreground">Manage club members and their roles.</p>
		</div>

		<Dialog.Root bind:open={isAddDialogOpen}>
			<Button
				class="cursor-pointer shadow-primary/20 font-bold shadow-lg"
				onclick={() => {
					resetAddForm();
					isAddDialogOpen = true;
				}}
			>
				<Plus class="mr-2 h-4 w-4" />
				Add Member
			</Button>

			<Dialog.Content class="sm:max-w-[500px]">
				<Dialog.Header>
					<Dialog.Title>Add New Member</Dialog.Title>
					<Dialog.Description>
						Fill in the details below to register a new member.
					</Dialog.Description>
				</Dialog.Header>

				<form onsubmit={handleAddMember}>
					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="name" class="text-right">Name</Label>
							<Input
								id="name"
								placeholder="Full Name"
								class="col-span-3"
								bind:value={addForm.name}
								required
							/>
						</div>

						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="position" class="text-right">Position</Label>
							<Input
								id="position"
								placeholder="Lead Researcher"
								class="col-span-3"
								bind:value={addForm.position}
								required
							/>
						</div>

						<div class="grid grid-cols-4 items-center gap-4">
							<Label class="text-right">Level</Label>

							<Select.Root type="single" bind:value={addForm.type}>
								<Select.Trigger class="col-span-3">
									{addForm.type}
								</Select.Trigger>

								<Select.Content>
									{#each memberTypes as type (type)}
										<Select.Item value={type}>{type}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>

						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="dept" class="text-right">Dept</Label>
							<Input
								id="dept"
								placeholder="CS, IT, etc."
								class="col-span-3"
								bind:value={addForm.dept}
								required
							/>
						</div>

						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="batch" class="text-right">Batch</Label>
							<Input
								id="batch"
								placeholder="2024"
								class="col-span-3"
								bind:value={addForm.batch}
								required
							/>
						</div>

						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="linkedin" class="text-right">LinkedIn</Label>
							<Input
								id="linkedin"
								placeholder="https://linkedin.com/in/..."
								class="col-span-3"
								bind:value={addForm.linkedin}
							/>
						</div>

						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="github" class="text-right">GitHub</Label>
							<Input
								id="github"
								placeholder="https://github.com/..."
								class="col-span-3"
								bind:value={addForm.github}
							/>
						</div>

						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="facebook" class="text-right">Facebook</Label>
							<Input
								id="facebook"
								placeholder="https://facebook.com/..."
								class="col-span-3"
								bind:value={addForm.facebook}
							/>
						</div>
					</div>

					<Dialog.Footer>
						<Button type="submit" disabled={isSubmitting}>
							{#if isSubmitting}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							Add Member
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>

		<Dialog.Root bind:open={isEditDialogOpen}>
			<Dialog.Content class="sm:max-w-[500px]">
				<Dialog.Header>
					<Dialog.Title>Modify Member Intelligence</Dialog.Title>
					<Dialog.Description>
						Update the professional credentials for this operative.
					</Dialog.Description>
				</Dialog.Header>

				{#if editingMember}
					<form onsubmit={handleEditMember}>
						<div class="grid gap-4 py-4">
							<div class="grid grid-cols-4 items-center gap-4">
								<Label for="edit-name" class="text-right">Name</Label>
								<Input id="edit-name" class="col-span-3" bind:value={editForm.name} required />
							</div>

							<div class="grid grid-cols-4 items-center gap-4">
								<Label for="edit-position" class="text-right">Position</Label>
								<Input
									id="edit-position"
									class="col-span-3"
									bind:value={editForm.position}
									required
								/>
							</div>

							<div class="grid grid-cols-4 items-center gap-4">
								<Label class="text-right">Level</Label>

								<Select.Root type="single" bind:value={editForm.type}>
									<Select.Trigger class="col-span-3">
										{editForm.type}
									</Select.Trigger>

									<Select.Content>
										{#each memberTypes as type (type)}
											<Select.Item value={type}>{type}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>

							<div class="grid grid-cols-4 items-center gap-4">
								<Label for="edit-dept" class="text-right">Dept</Label>
								<Input id="edit-dept" class="col-span-3" bind:value={editForm.dept} required />
							</div>

							<div class="grid grid-cols-4 items-center gap-4">
								<Label for="edit-batch" class="text-right">Batch</Label>
								<Input id="edit-batch" class="col-span-3" bind:value={editForm.batch} required />
							</div>

							<div class="grid grid-cols-4 items-center gap-4">
								<Label for="edit-linkedin" class="text-right">LinkedIn</Label>
								<Input id="edit-linkedin" class="col-span-3" bind:value={editForm.linkedin} />
							</div>

							<div class="grid grid-cols-4 items-center gap-4">
								<Label for="edit-github" class="text-right">GitHub</Label>
								<Input id="edit-github" class="col-span-3" bind:value={editForm.github} />
							</div>

							<div class="grid grid-cols-4 items-center gap-4">
								<Label for="edit-facebook" class="text-right">Facebook</Label>
								<Input id="edit-facebook" class="col-span-3" bind:value={editForm.facebook} />
							</div>
						</div>

						<Dialog.Footer>
							<Button type="submit" disabled={isSubmitting}>
								{#if isSubmitting}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								Update Member
							</Button>
						</Dialog.Footer>
					</form>
				{/if}
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<Card.Root class="border-border/50 bg-card/50 overflow-hidden backdrop-blur-md">
		<Card.Content class="flex flex-col items-center gap-4 p-4 md:flex-row">
			<div class="relative w-full flex-1">
				<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

				<Input
					placeholder="Filter by name, department or batch (Press Enter)..."
					class="bg-background/50 border-border pl-9"
					bind:value={localSearch}
					onkeydown={(event) => {
						if (event.key === 'Enter') handleSearchTrigger();
					}}
				/>
			</div>

			<div class="flex w-full items-center gap-3 md:w-auto">
				<Select.Root type="single" bind:value={typeFilter}>
					<Select.Trigger class="bg-background/50 border-border w-full md:w-40">
						{typeFilter === 'all'
							? 'All Types'
							: typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
					</Select.Trigger>

					<Select.Content>
						<Select.Item value="all">All Types</Select.Item>
						<Select.Item value="executive">Executive</Select.Item>
						<Select.Item value="senior">Senior</Select.Item>
						<Select.Item value="junior">Junior</Select.Item>
						<Select.Item value="alumni">Alumni</Select.Item>
					</Select.Content>
				</Select.Root>

				<!-- <Button variant="outline" size="icon" class="border-border shrink-0">
					<Filter class="h-4 w-4" />
				</Button> -->
			</div>
		</Card.Content>
	</Card.Root>

	{#if loading}
		<div class="flex flex-col items-center justify-center gap-4 py-20">
			<Loader2 class="text-primary h-8 w-8 animate-spin" />

			<p class="text-muted-foreground font-code text-xs tracking-widest uppercase">
				Accessing Intelligence Registry...
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
			{#each filteredMembers as member (member.id)}
				<Card.Root
					class="border-border/50 bg-card hover:border-primary/50 group relative overflow-hidden transition-all duration-300"
				>
					<div
						class="absolute top-0 right-0 z-10 flex gap-2 p-4 opacity-0 transition-opacity group-hover:opacity-100"
					>
						<Button
							variant="secondary"
							size="icon"
							class="h-8 w-8 rounded-full shadow-md"
							onclick={() => openEditDialog(member)}
						>
							<Edit2 class="h-3 w-3" />
						</Button>

						<Button
							variant="destructive"
							size="icon"
							class="h-8 w-8 rounded-full shadow-md"
							onclick={() => handleDelete(member.id, member.name || 'Unknown Member')}
						>
							<Trash2 class="h-3 w-3" />
						</Button>
					</div>

					<Card.Content class="p-6">
						<div class="flex items-start gap-5">
							<div class="relative">
								<Avatar.Root
									class="border-primary/20 bg-background h-20 w-20 border-2 p-1 shadow-inner"
								>
									<Avatar.Image src={member.avatar} alt={member.name || 'Member avatar'} />
									<Avatar.Fallback>{member.name?.charAt(0) || 'M'}</Avatar.Fallback>
								</Avatar.Root>

								<div
									class="border-background absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-green-500"
								>
									<div class="h-2 w-2 animate-pulse rounded-full bg-white"></div>
								</div>
							</div>

							<div class="flex-1 space-y-2">
								<div>
									<h3 class="font-headline text-lg leading-none font-bold">
										{member.name}
									</h3>

									<p class="text-primary mt-1 text-xs font-medium tracking-wider uppercase">
										{member.position}
									</p>
								</div>

								<div class="flex flex-wrap gap-2">
									<Badge
										variant="outline"
										class="font-code border-border/50 bg-sidebar-accent text-[10px]"
									>
										{member.type}
									</Badge>

									<Badge
										variant="outline"
										class="font-code border-border/50 bg-sidebar-accent text-[10px]"
									>
										{member.dept}
									</Badge>

									<Badge
										variant="outline"
										class="font-code border-border/50 bg-sidebar-accent text-[10px]"
									>
										Batch {member.batch}
									</Badge>
								</div>
							</div>
						</div>

						<div class="mt-6 grid grid-cols-3 gap-3">
							<a
								href={member.linkedin || '#'}
								target="_blank"
								rel="noreferrer"
								class={`bg-sidebar-accent/50 border-border/50 hover:bg-primary/5 group/link flex flex-col items-center justify-center rounded-lg border p-2 transition-colors ${
									!member.linkedin ? 'cursor-not-allowed opacity-50' : ''
								}`}
								onclick={(event) => {
									if (!member.linkedin) event.preventDefault();
								}}
							>
								<svg
									class="mb-1 h-4 w-4 text-blue-500 transition-transform group-hover/link:scale-110"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.32 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.1 20.45H3.54V9H7.1v11.45Z"
									/>
								</svg>

								<span class="text-muted-foreground text-[10px] font-bold uppercase">
									LINKEDIN
								</span>
							</a>

							<a
								href={member.github || '#'}
								target="_blank"
								rel="noreferrer"
								class={`bg-sidebar-accent/50 border-border/50 hover:bg-primary/5 group/link flex flex-col items-center justify-center rounded-lg border p-2 transition-colors ${
									!member.github ? 'cursor-not-allowed opacity-50' : ''
								}`}
								onclick={(event) => {
									if (!member.github) event.preventDefault();
								}}
							>
								<svg
									class="text-foreground mb-1 h-4 w-4 transition-transform group-hover/link:scale-110"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.99c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.49A10.1 10.1 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
									/>
								</svg>

								<span class="text-muted-foreground text-[10px] font-bold uppercase"> GITHUB </span>
							</a>

							<a
								href={member.facebook || '#'}
								target="_blank"
								rel="noreferrer"
								class={`bg-sidebar-accent/50 border-border/50 hover:bg-primary/5 group/link flex flex-col items-center justify-center rounded-lg border p-2 transition-colors ${
									!member.facebook ? 'cursor-not-allowed opacity-50' : ''
								}`}
								onclick={(event) => {
									if (!member.facebook) event.preventDefault();
								}}
							>
								<svg
									class="mb-1 h-4 w-4 text-blue-600 transition-transform group-hover/link:scale-110"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.25c-1.24 0-1.63.77-1.63 1.56v1.9h2.77l-.44 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z"
									/>
								</svg>

								<span class="text-muted-foreground text-[10px] font-bold uppercase">
									FACEBOOK
								</span>
							</a>
						</div>

						<div class="border-border/50 mt-4 flex items-center justify-between border-t pt-4">
							<div class="text-muted-foreground flex items-center gap-1.5 text-xs">
								<Building2 class="h-3 w-3" />
								<span>Synthetix HQ</span>
							</div>

							<div class="text-muted-foreground flex items-center gap-1.5 text-xs">
								<GraduationCap class="h-3 w-3" />
								<span>Verified Member</span>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}

			<button
				onclick={() => {
					resetAddForm();
					isAddDialogOpen = true;
				}}
				class="border-border/50 hover:border-primary/50 hover:bg-primary/5 group flex min-h-[250px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all"
			>
				<div
					class="bg-sidebar-accent mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110"
				>
					<User class="text-muted-foreground group-hover:text-primary h-6 w-6 transition-colors" />
				</div>

				<span
					class="text-muted-foreground group-hover:text-primary text-sm font-semibold transition-colors"
				>
					Add New Personnel
				</span>

				<span class="text-muted-foreground mt-1 text-[10px] uppercase"> Registry Expansion </span>
			</button>
		</div>
	{/if}
</div>
