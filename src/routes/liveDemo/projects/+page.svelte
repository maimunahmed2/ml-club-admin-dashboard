<script lang="ts">
	import { resolve } from '$app/paths';
	import { Loader2 } from '@lucide/svelte';
	import { collection, onSnapshot } from 'firebase/firestore';

	import { db } from '$lib/firebase';

	type NavLink = {
		label: string;
		href: string;
		external?: boolean;
		highlight?: boolean;
	};

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

	const navLinks: NavLink[] = [
		{ label: 'Home', href: resolve('/liveDemo') },
		{ label: 'Members', href: resolve('/liveDemo/members') },
		{ label: 'Projects', href: resolve('/liveDemo/projects') },
		{ label: 'Blogs', href: resolve('/liveDemo/blogs') },
		{ label: 'Resources', href: 'https://www.mlclubnits.com/resources', external: true },
		{ label: 'Neurathon', href: 'https://neurathon.mlclubnits.com/', external: true },
		{
			label: 'Recruitment',
			href: 'https://www.mlclubnits.com/recruit',
			highlight: true,
			external: true
		}
	];

	let projects = $state<Project[]>([]);
	let loadingProjects = $state(true);
	let projectsError = $state('');

	const visibleProjects = $derived(
		projects.filter((project) => {
			const status = project.status?.trim().toLowerCase();

			// Keep this flexible while testing.
			// Later you can change it to: return status === 'published';
			return !status || status === 'published';
		})
	);

	$effect(() => {
		const projectsRef = collection(db, 'projects');

		const unsubscribe = onSnapshot(
			projectsRef,
			(snapshot) => {
				projects = snapshot.docs.map((document) => ({
					id: document.id,
					...document.data()
				})) as Project[];

				projects = projects.sort((a, b) => {
					const aTime = a.updatedAt?.toDate?.()?.getTime() ?? 0;
					const bTime = b.updatedAt?.toDate?.()?.getTime() ?? 0;

					return bTime - aTime;
				});

				loadingProjects = false;
			},
			(error) => {
				console.error('Firestore projects error:', error);
				projectsError = error.message;
				loadingProjects = false;
			}
		);

		return unsubscribe;
	});
</script>

<svelte:head>
	<title>Projects | ML Club NITS</title>

	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.0.1/remixicon.css"
		integrity="sha512-ZH3KB6wI5ADHaLaez5ynrzxR6lAswuNfhlXdcdhxsvOUghvf02zU1dAsOC6JrBTWbkE1WNDNs5Dcfz493fDMhA=="
		crossorigin="anonymous"
		referrerpolicy="no-referrer"
	/>
</svelte:head>

<div class="app">
	<div class="drawer">
		<input id="my-drawer-3" type="checkbox" class="drawer-toggle" />

		<div class="drawer-content flex min-h-screen flex-col bg-black text-white">
			<!-- Navbar -->
			<div class="navbar fixed z-[9999] flex w-full justify-center bg-base-300/50 backdrop-blur-lg">
				<div class="flex w-full max-w-[92rem] justify-between">
					<div class="flex-none lg:hidden">
						<label for="my-drawer-3" aria-label="open sidebar" class="btn btn-square btn-ghost">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								class="inline-block h-6 w-6 stroke-current"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</label>
					</div>

					<div class="mx-2 flex items-center font-bold text-primary">
						<div class="h-14">
							<img src="/logo.png" height="64" alt="ML Club NITS logo" class="h-full" />
						</div>

						<div class="hidden lg:block text-orange-500">
							Machine Learning Club, <span class="text-white">NIT Silchar</span>
						</div>
					</div>

					<div class="hidden lg:block">
						<ul class="menu menu-horizontal">
							{#each navLinks as link (link.href)}
								<li>
									<a
										href={link.href}
										target={link.external ? '_blank' : undefined}
										rel={link.external ? 'noreferrer' : undefined}
									>
										{#if link.highlight}
											<span class="recruitment-live">
												<span class="text-[#ff7700]">{link.label}</span>
											</span>
										{:else}
											{link.label}
										{/if}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>

			<main class="flex-grow bg-black">
				<div class="h-24 md:h-28"></div>
				<section class="projects-page pt-10">
					<div class="wrapper mx-auto max-w-[1040px]">
						<div class="w-full px-4">
							{#if loadingProjects}
								<div
									class="flex flex-col items-center justify-center gap-4 py-24 text-[#FFFCE1]/70"
								>
									<Loader2 class="h-8 w-8 animate-spin text-secondary" />
									<p class="text-xs font-bold uppercase tracking-widest">Loading projects...</p>
								</div>
							{:else if projectsError}
								<div
									class="mx-auto max-w-[700px] rounded-sm border border-dashed border-red-500/40 p-10 text-center"
								>
									<h2 class="text-xl font-bold text-red-400">Firestore error</h2>
									<p class="mt-2 text-sm text-[#FFFCE1]/60">{projectsError}</p>
								</div>
							{:else if visibleProjects.length === 0}
								<div
									class="mx-auto max-w-[700px] rounded-sm border border-dashed border-[#FFFCE1]/30 p-10 text-center"
								>
									<h2 class="text-xl font-bold text-[#FFFCE1]">No projects found</h2>
									<p class="mt-2 text-sm text-[#FFFCE1]/60">
										Projects added in Firestore will appear here.
									</p>
								</div>
							{:else}
								{#each visibleProjects as project, index (project.id)}
									<div
										class={`projectCard mb-10 w-full max-w-[700px] overflow-hidden rounded-sm border border-dashed p-4 ${
											index % 2 === 0 ? 'mx-auto lg:ml-0 lg:mr-auto' : 'mx-auto lg:ml-auto lg:mr-0'
										}`}
									>
										<div class="flex h-full flex-col">
											<p class="break-words pb-2 text-2xl font-bold text-[#FFFCE1]">
												{project.title || 'Untitled Project'}
											</p>

											<p class="flex-grow overflow-auto pb-2 text-[#FFFCE1]/70">
												{project.detailedDescription ||
													project.shortDescription ||
													'No project description available.'}
											</p>

											<div class="grid grid-cols-[auto_1fr] gap-2 pb-3">
												<p class="text-[#FFFCE1]/70">Members:</p>

												<p class="break-words italic text-[#FFFCE1]/80">
													{project.teamMembers && project.teamMembers.length > 0
														? project.teamMembers.join(', ')
														: 'ML Club NIT Silchar'}
												</p>
											</div>

											<div class="flex gap-3 text-[#FFFCE1]/80">
												{#if project.githubUrl}
													<a
														href={project.githubUrl}
														target="_blank"
														rel="noreferrer"
														aria-label={`GitHub repository for ${project.title || 'project'}`}
														title={`GitHub repository for ${project.title || 'project'}`}
														class="duration-300 hover:cursor-pointer hover:text-white"
													>
														<i class="ri-github-fill text-xl" aria-hidden="true"></i>
													</a>
												{/if}

												{#if project.demoUrl}
													<a
														href={project.demoUrl}
														target="_blank"
														rel="noreferrer"
														aria-label={`Live demo for ${project.title || 'project'}`}
														title={`Live demo for ${project.title || 'project'}`}
														class="duration-300 hover:cursor-pointer hover:text-white"
													>
														<i class="ri-external-link-line text-xl" aria-hidden="true"></i>
													</a>
												{/if}

												{#if project.category?.toLowerCase().includes('paper')}
													<span
														aria-label={`Research paper for ${project.title || 'project'}`}
														title={`Research paper for ${project.title || 'project'}`}
														class="duration-300 hover:cursor-pointer hover:text-white"
													>
														<i class="ri-file-list-3-fill text-xl" aria-hidden="true"></i>
													</span>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				</section>
			</main>

			<footer
				class="footer footer-center border-t border-dashed border-[#ffffff28] bg-black p-10 text-sm"
			>
				<nav>
					<div class="grid grid-flow-col gap-4">
						<a href={resolve('/')} aria-label="Twitter" title="Twitter">
							<i class="ri-twitter-x-fill text-lg" aria-hidden="true"></i>
						</a>

						<a href="https://www.youtube.com/@mlclubnits" aria-label="YouTube" title="YouTube">
							<i class="ri-youtube-fill text-lg" aria-hidden="true"></i>
						</a>

						<a href="https://www.facebook.com/mlclubNITS/" aria-label="Facebook" title="Facebook">
							<i class="ri-facebook-fill text-lg" aria-hidden="true"></i>
						</a>
					</div>
				</nav>

				<aside>
					<p>
						Copyright © 2026 - All right reserved by
						<span class="font-medium text-primary">Machine Learning Club, NIT Silchar</span>.
					</p>
				</aside>
			</footer>
		</div>

		<!-- Mobile Drawer -->
		<div class="drawer-side z-[9999]">
			<label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>

			<ul
				class="menu flex min-h-full w-64 gap-4 rounded-lg border-r-2 border-gray bg-base-200/80 p-4 pt-20 backdrop-blur-lg md:w-96"
			>
				{#each navLinks as link (link.href)}
					<li class="drawer-text font-semibold">
						<a
							href={link.href}
							target={link.external ? '_blank' : undefined}
							rel={link.external ? 'noreferrer' : undefined}
						>
							{#if link.highlight}
								<span class="recruitment-live">
									<span class="text-[#ff7700]">{link.label}</span>
								</span>
							{:else}
								{link.label}
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body) {
		background: black;
		color: white;
	}

	.projects-page {
		min-height: calc(100vh - 7rem);
		padding-bottom: 5rem;
	}

	.projectCard {
		min-height: 15rem;
		background:
			radial-gradient(circle at top left, rgba(255, 255, 255, 0.06), transparent 35%), #0f0f0f;
		color: #fffce1;
		border-color: rgba(255, 252, 225, 0.35);
		transition:
			transform 0.3s ease,
			border-color 0.3s ease,
			background 0.3s ease;
	}

	.projectCard:hover {
		transform: translateY(-0.25rem);
		border-color: rgba(255, 252, 225, 0.7);
		background:
			radial-gradient(circle at top left, rgba(255, 255, 255, 0.09), transparent 35%), #131313;
	}

	.recruitment-live {
		animation: recruitmentPulse 1.2s ease-in-out infinite;
	}

	@keyframes recruitmentPulse {
		0%,
		100% {
			opacity: 1;
		}

		50% {
			opacity: 0.45;
		}
	}
</style>
