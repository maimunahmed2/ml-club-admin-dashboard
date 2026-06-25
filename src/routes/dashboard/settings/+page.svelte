<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

	import {
		Camera,
		Eye,
		EyeOff,
		Globe,
		Loader2,
		LogOut,
		Mail,
		Palette,
		Save,
		Share2,
		ShieldCheck,
		User
	} from '@lucide/svelte';

	import { db } from '$lib/firebase';

	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';

	import * as Avatar from '$lib/components/ui/avatar';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';

	let isSubmitting = $state(false);
	let showPassword = $state(false);
	let loadingClub = $state(true);
	let analyticsLiveFeed = $state(true);

	let clubForm = $state({
		name: '',
		tagline: '',
		logo: '',
		description: '',
		websiteUrl: ''
	});

	let socialForm = $state({
		github: '',
		linkedin: '',
		instagram: '',
		facebook: '',
		twitter: '',
		youtube: '',
		email: ''
	});

	let adminForm = $state({
		name: 'Lead Admin',
		email: 'admin@synthetix.ml',
		avatar: 'https://picsum.photos/seed/admin123/200/200'
	});

	let prefs = $state({
		theme: 'dark',
		defaultPage: '/dashboard',
		rowsPerPage: '10'
	});

	let securityForm = $state({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	onMount(() => {
		const savedTheme = localStorage.getItem('synthetix_theme') || 'dark';
		prefs.theme = savedTheme;

		const clubRef = doc(db, 'settings', 'club');

		const unsubscribe = onSnapshot(
			clubRef,
			(snapshot) => {
				if (snapshot.exists()) {
					const clubSettings = snapshot.data();

					clubForm = {
						name: clubSettings.name || '',
						tagline: clubSettings.tagline || '',
						logo: clubSettings.logo || '',
						description: clubSettings.description || '',
						websiteUrl: clubSettings.websiteUrl || ''
					};

					if (clubSettings.socials) {
						socialForm = {
							github: clubSettings.socials.github || '',
							linkedin: clubSettings.socials.linkedin || '',
							instagram: clubSettings.socials.instagram || '',
							facebook: clubSettings.socials.facebook || '',
							twitter: clubSettings.socials.twitter || '',
							youtube: clubSettings.socials.youtube || '',
							email: clubSettings.socials.email || ''
						};
					}
				}

				loadingClub = false;
			},
			(error) => {
				console.error(error);
				loadingClub = false;
			}
		);

		return unsubscribe;
	});

	function applyTheme(theme: string) {
		const root = document.documentElement;

		const isDark =
			theme === 'dark' ||
			(theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

		if (isDark) {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}

		localStorage.setItem('synthetix_theme', theme);
	}

	async function handleClubSubmit(event: SubmitEvent) {
		event.preventDefault();

		isSubmitting = true;

		try {
			await setDoc(
				doc(db, 'settings', 'club'),
				{
					...clubForm,
					updatedAt: serverTimestamp()
				},
				{ merge: true }
			);

			alert('Club profile synchronized. Global settings have been updated.');
		} catch (error) {
			console.error(error);
			alert('Could not synchronize club settings.');
		} finally {
			isSubmitting = false;
		}
	}

	async function handleSocialSubmit(event: SubmitEvent) {
		event.preventDefault();

		isSubmitting = true;

		try {
			await setDoc(
				doc(db, 'settings', 'club'),
				{
					socials: socialForm,
					updatedAt: serverTimestamp()
				},
				{ merge: true }
			);

			alert('Social matrix updated. Connectivity endpoints have been reconfigured.');
		} catch (error) {
			console.error(error);
			alert('Could not synchronize social links.');
		} finally {
			isSubmitting = false;
		}
	}

	function handleAdminSubmit(event: SubmitEvent) {
		event.preventDefault();
		alert('Identity updated. Your administrative profile has been locally cached.');
	}

	function handleSecuritySubmit(event: SubmitEvent) {
		event.preventDefault();

		if (securityForm.newPassword !== securityForm.confirmPassword) {
			alert('New password confirmation does not match.');
			return;
		}

		alert('Security protocols rotated. Administrative credentials have been updated.');

		securityForm = {
			currentPassword: '',
			newPassword: '',
			confirmPassword: ''
		};
	}

	function handleApplyPreferences() {
		applyTheme(prefs.theme);
		alert('Preferences cached. Workspace parameters have been updated.');
	}

	function handleLogout() {
		localStorage.removeItem('synthetix_admin');
		goto('/auth');
	}
</script>

<div class="space-y-8 pb-10">
	<div>
		<h1 class="font-headline text-3xl font-bold tracking-tight">System Configuration</h1>
		<p class="text-muted-foreground">
			Manage network parameters, security protocols, and administrative profiles.
		</p>
	</div>

	<Tabs.Root value="club" class="space-y-6">
		<Tabs.List class="bg-muted flex h-auto flex-wrap gap-1 rounded-xl p-1">
			<Tabs.Trigger value="club" class="flex items-center gap-2 px-4 py-2">
				<Globe class="h-4 w-4" />
				Club Profile
			</Tabs.Trigger>

			<Tabs.Trigger value="social" class="flex items-center gap-2 px-4 py-2">
				<Share2 class="h-4 w-4" />
				Social Matrix
			</Tabs.Trigger>

			<Tabs.Trigger value="admin" class="flex items-center gap-2 px-4 py-2">
				<User class="h-4 w-4" />
				Admin Identity
			</Tabs.Trigger>

			<Tabs.Trigger value="security" class="flex items-center gap-2 px-4 py-2">
				<ShieldCheck class="h-4 w-4" />
				Security
			</Tabs.Trigger>

			<Tabs.Trigger value="prefs" class="flex items-center gap-2 px-4 py-2">
				<Palette class="h-4 w-4" />
				Preferences
			</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="club">
			<Card.Root class="border-border/50 bg-card/50 backdrop-blur-md">
				<Card.Header>
					<Card.Title class="font-headline">Club Intelligence</Card.Title>
					<Card.Description>Primary public-facing identity settings.</Card.Description>
				</Card.Header>

				<form onsubmit={handleClubSubmit}>
					<Card.Content class="space-y-6">
						{#if loadingClub}
							<div class="flex items-center gap-2 text-sm text-muted-foreground">
								<Loader2 class="h-4 w-4 animate-spin" />
								Loading club settings...
							</div>
						{/if}

						<div class="flex flex-col gap-8 md:flex-row">
							<div class="space-y-4">
								<Label>Club Logo</Label>

								<div class="group relative">
									<div
										class="border-border bg-muted flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed"
									>
										{#if clubForm.logo}
											<img
												src={clubForm.logo}
												alt="Logo Preview"
												class="h-full w-full object-cover"
											/>
										{:else}
											<Globe class="text-muted-foreground h-12 w-12 opacity-20" />
										{/if}
									</div>

									<Button
										variant="secondary"
										size="sm"
										class="absolute -right-2 -bottom-2 shadow-lg"
										type="button"
									>
										<Camera class="mr-2 h-4 w-4" />
										Change
									</Button>
								</div>
							</div>

							<div class="flex-1 space-y-4">
								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div class="space-y-2">
										<Label for="clubName">Club Name</Label>
										<Input
											id="clubName"
											placeholder="Synthetix ML"
											bind:value={clubForm.name}
											required
										/>
									</div>

									<div class="space-y-2">
										<Label for="tagline">Official Tagline</Label>
										<Input
											id="tagline"
											placeholder="Synthesizing Intelligence"
											bind:value={clubForm.tagline}
										/>
									</div>
								</div>

								<div class="space-y-2">
									<Label for="websiteUrl">Website URL</Label>
									<Input
										id="websiteUrl"
										placeholder="https://synthetix.ml"
										bind:value={clubForm.websiteUrl}
									/>
								</div>

								<div class="space-y-2">
									<Label for="description">About the Club</Label>
									<Textarea
										id="description"
										placeholder="Core mission and background..."
										class="min-h-[120px]"
										bind:value={clubForm.description}
									/>
								</div>
							</div>
						</div>
					</Card.Content>

					<Card.Footer class="border-border mt-6 border-t pt-6">
						<Button type="submit" disabled={isSubmitting} class="font-bold">
							{#if isSubmitting}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{:else}
								<Save class="mr-2 h-4 w-4" />
							{/if}
							Save Profile Changes
						</Button>
					</Card.Footer>
				</form>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="social">
			<Card.Root class="border-border/50 bg-card/50 backdrop-blur-md">
				<Card.Header>
					<Card.Title class="font-headline">Social Matrix</Card.Title>
					<Card.Description>
						Configure external connectivity endpoints for the public network.
					</Card.Description>
				</Card.Header>

				<form onsubmit={handleSocialSubmit}>
					<Card.Content class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div class="space-y-2">
							<Label class="flex items-center gap-2">
								<span class="text-sm font-bold">GH</span>
								GitHub
							</Label>
							<Input bind:value={socialForm.github} placeholder="https://github.com/..." />
						</div>

						<div class="space-y-2">
							<Label class="flex items-center gap-2">
								<span class="text-sm font-bold text-blue-500">IN</span>
								LinkedIn
							</Label>
							<Input
								bind:value={socialForm.linkedin}
								placeholder="https://linkedin.com/company/..."
							/>
						</div>

						<div class="space-y-2">
							<Label class="flex items-center gap-2">
								<span class="text-sm font-bold text-pink-500">IG</span>
								Instagram
							</Label>
							<Input bind:value={socialForm.instagram} placeholder="https://instagram.com/..." />
						</div>

						<div class="space-y-2">
							<Label class="flex items-center gap-2">
								<span class="text-sm font-bold text-blue-600">FB</span>
								Facebook
							</Label>
							<Input bind:value={socialForm.facebook} placeholder="https://facebook.com/..." />
						</div>

						<div class="space-y-2">
							<Label class="flex items-center gap-2">
								<span class="text-sm font-bold">X</span>
								X / Twitter
							</Label>
							<Input bind:value={socialForm.twitter} placeholder="https://x.com/..." />
						</div>

						<div class="space-y-2">
							<Label class="flex items-center gap-2">
								<span class="text-sm font-bold text-red-500">YT</span>
								YouTube
							</Label>
							<Input bind:value={socialForm.youtube} placeholder="https://youtube.com/..." />
						</div>

						<div class="space-y-2 md:col-span-2">
							<Label class="flex items-center gap-2">
								<Mail class="h-4 w-4" />
								Contact Email
							</Label>
							<Input bind:value={socialForm.email} placeholder="contact@synthetix.ml" />
						</div>
					</Card.Content>

					<Card.Footer class="border-border mt-6 border-t pt-6">
						<Button type="submit" disabled={isSubmitting} class="font-bold">
							{#if isSubmitting}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{:else}
								<Save class="mr-2 h-4 w-4" />
							{/if}
							Save Social Matrix
						</Button>
					</Card.Footer>
				</form>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="admin">
			<Card.Root class="border-border/50 bg-card/50 backdrop-blur-md">
				<Card.Header>
					<Card.Title class="font-headline">Admin Identity</Card.Title>
					<Card.Description>
						Personal credentials for the current administrative session.
					</Card.Description>
				</Card.Header>

				<form onsubmit={handleAdminSubmit}>
					<Card.Content class="space-y-6">
						<div class="flex items-center gap-6">
							<div class="group relative">
								<Avatar.Root class="border-primary/20 h-24 w-24 border-2 p-1">
									<Avatar.Image src={adminForm.avatar} alt="Admin avatar" />
									<Avatar.Fallback>AD</Avatar.Fallback>
								</Avatar.Root>

								<Button
									variant="secondary"
									size="icon"
									class="absolute -right-1 -bottom-1 h-8 w-8 rounded-full shadow-lg"
									type="button"
								>
									<Camera class="h-4 w-4" />
								</Button>
							</div>

							<div class="space-y-1">
								<h3 class="font-headline text-xl font-bold">{adminForm.name}</h3>
								<p class="font-code text-muted-foreground text-xs tracking-widest uppercase">
									Controller Access Level: 10
								</p>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="adminName">Full Name</Label>
								<Input id="adminName" bind:value={adminForm.name} />
							</div>

							<div class="space-y-2">
								<Label for="adminEmail">Email Address</Label>
								<Input id="adminEmail" type="email" bind:value={adminForm.email} />
							</div>

							<div class="space-y-2">
								<Label>User ID Immutable</Label>
								<Input value="admin_82741" disabled class="bg-muted/50 font-code" />
							</div>
						</div>
					</Card.Content>

					<Card.Footer class="border-border mt-6 border-t pt-6">
						<Button type="submit" class="font-bold">
							<Save class="mr-2 h-4 w-4" />
							Update Profile
						</Button>
					</Card.Footer>
				</form>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="security">
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<Card.Root class="border-border/50 bg-card/50 backdrop-blur-md lg:col-span-2">
					<Card.Header>
						<Card.Title class="font-headline">Security Protocol Rotation</Card.Title>
						<Card.Description>Update your administrative access credentials.</Card.Description>
					</Card.Header>

					<form onsubmit={handleSecuritySubmit}>
						<Card.Content class="space-y-4">
							<div class="space-y-2">
								<Label for="currentPassword">Current System Password</Label>

								<div class="relative">
									<Input
										id="currentPassword"
										type={showPassword ? 'text' : 'password'}
										bind:value={securityForm.currentPassword}
										required
									/>

									<Button
										variant="ghost"
										size="icon"
										class="absolute top-0 right-0 h-full px-3"
										type="button"
										onclick={() => (showPassword = !showPassword)}
									>
										{#if showPassword}
											<EyeOff class="h-4 w-4" />
										{:else}
											<Eye class="h-4 w-4" />
										{/if}
									</Button>
								</div>
							</div>

							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="space-y-2">
									<Label for="newPassword">New Encryption Key</Label>
									<Input
										id="newPassword"
										type="password"
										bind:value={securityForm.newPassword}
										required
									/>
								</div>

								<div class="space-y-2">
									<Label for="confirmPassword">Confirm New Key</Label>
									<Input
										id="confirmPassword"
										type="password"
										bind:value={securityForm.confirmPassword}
										required
									/>
								</div>
							</div>
						</Card.Content>

						<Card.Footer class="border-border mt-6 border-t pt-6">
							<Button type="submit" class="font-bold">
								<ShieldCheck class="mr-2 h-4 w-4" />
								Rotate Credentials
							</Button>
						</Card.Footer>
					</form>
				</Card.Root>

				<Card.Root class="border-destructive/20 bg-destructive/5">
					<Card.Header>
						<Card.Title class="font-headline text-destructive">Termination</Card.Title>
						<Card.Description>De-authorize this session and terminate access.</Card.Description>
					</Card.Header>

					<Card.Content>
						<p class="text-muted-foreground text-sm leading-relaxed">
							Logging out will immediately invalidate your current session tokens and return you to
							the authentication gate.
						</p>
					</Card.Content>

					<Card.Footer class="pt-6">
						<Button variant="destructive" class="w-full font-bold" onclick={handleLogout}>
							<LogOut class="mr-2 h-4 w-4" />
							Terminate Session
						</Button>
					</Card.Footer>
				</Card.Root>
			</div>
		</Tabs.Content>

		<Tabs.Content value="prefs">
			<Card.Root class="border-border/50 bg-card/50 backdrop-blur-md">
				<Card.Header>
					<Card.Title class="font-headline">Dashboard Preferences</Card.Title>
					<Card.Description>Personalize your administrative workspace experience.</Card.Description>
				</Card.Header>

				<Card.Content class="space-y-6">
					<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
						<div class="space-y-4">
							<Label>UI Theme Protocol</Label>

							<Select.Root type="single" bind:value={prefs.theme}>
								<Select.Trigger>{prefs.theme}</Select.Trigger>
								<Select.Content>
									<Select.Item value="light">Light Spectrum</Select.Item>
									<Select.Item value="dark">Dark Matter Recommended</Select.Item>
									<Select.Item value="system">Sync with OS</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>

						<div class="space-y-4">
							<Label>Default Entry Point</Label>

							<Select.Root type="single" bind:value={prefs.defaultPage}>
								<Select.Trigger>{prefs.defaultPage}</Select.Trigger>
								<Select.Content>
									<Select.Item value="/dashboard">System Overview</Select.Item>
									<Select.Item value="/dashboard/projects">Venture Registry</Select.Item>
									<Select.Item value="/dashboard/blogs">Editorial Suite</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>

						<div class="space-y-4">
							<Label>Registry Rows Per Segment</Label>

							<Select.Root type="single" bind:value={prefs.rowsPerPage}>
								<Select.Trigger>{prefs.rowsPerPage} Entities</Select.Trigger>
								<Select.Content>
									<Select.Item value="10">10 Entities</Select.Item>
									<Select.Item value="25">25 Entities</Select.Item>
									<Select.Item value="50">50 Entities</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>

						<div
							class="bg-muted/50 border-border flex items-center justify-between rounded-xl border p-4"
						>
							<div class="space-y-0.5">
								<Label>Analytics Live Feed</Label>
								<p class="text-muted-foreground text-[10px]">
									Enable real-time data streaming on dashboard.
								</p>
							</div>

							<Switch
								checked={analyticsLiveFeed}
								onCheckedChange={(checked) => {
									analyticsLiveFeed = checked;
								}}
							/>
						</div>
					</div>
				</Card.Content>

				<Card.Footer class="border-border mt-6 border-t pt-6">
					<Button onclick={handleApplyPreferences} class="font-bold">
						<Save class="mr-2 h-4 w-4" />
						Apply Preferences
					</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>
