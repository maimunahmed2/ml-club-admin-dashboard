<script lang="ts">
	import { resolve } from '$app/paths';
	import { Loader2 } from '@lucide/svelte';
	import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

	import { db } from '$lib/firebase';

	type NavLink = {
		label: string;
		href: string;
		external?: boolean;
		highlight?: boolean;
	};

	type AboutCard = {
		title: string;
		description: string;
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

	const aboutCards: AboutCard[] = [
		{
			title: 'Weekly ML Classes',
			description: 'Weekly classes to teach students eveything from basics to advanced'
		},
		{
			title: 'Speaker Sessions',
			description: 'Regular speaker sessions with relevant people working in the field'
		},
		{
			title: 'Hackathons',
			description: "Our very own ML-based hackathon named 'Neurathon'"
		},
		{
			title: 'Paper Reading Sessions',
			description: 'Regular paper-reading sessions'
		},
		{
			title: 'Workshops',
			description: 'Hands-on community workshops to polish your practical skills'
		},
		{
			title: 'Projects',
			description: 'Development of innovative projects solving real-world issues'
		}
	];

	let projects = $state<Project[]>([]);
	let loadingProjects = $state(true);
	let projectsError = $state('');

	const visibleProjects = $derived(projects.filter((project) => project.status === 'Published'));

	$effect(() => {
		const projectsQuery = query(collection(db, 'projects'), orderBy('updatedAt', 'desc'));

		const unsubscribe = onSnapshot(
			projectsQuery,
			(snapshot) => {
				projects = snapshot.docs.map((document) => ({
					id: document.id,
					...document.data()
				})) as Project[];

				loadingProjects = false;
			},
			(error) => {
				console.error(error);
				projectsError = error.message;
				loadingProjects = false;
			}
		);

		return unsubscribe;
	});
</script>

<svelte:head>
	<title>Home | ML Club NITS</title>
	<meta name="description" content="Machine Learning Club, NIT Silchar" />

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

		<div class="drawer-content flex min-h-screen flex-col">
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
							<img src="/logo.png" height="64" alt="" class="h-full" />
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

			<main class="flex-grow">
				<section>
					<!-- Hero -->
					<section class="hero-section flex justify-center bg-black px-0 pt-20 md:px-10">
						<div class="wrapper w-full">
							<div class="image-wrapper">
								<div class="hero-image-container relative">
									<picture>
										<img
											src="/images/cyborg-black.avif"
											fetchpriority="high"
											loading="eager"
											width="1080"
											height="1350"
											alt=""
										/>
									</picture>
								</div>
							</div>

							<div class="text">
								<div class="MachineLearning text-3xl tracking-wider md:text-[3rem]">
									<div class="flex flex-col gap-3">
										<div class="flex gap-2">
											<div>
												{#each 'Machine' as char, i (`machine-${i}`)}
													<span>{char}</span>
												{/each}
											</div>

											<div>
												{#each 'Learning' as char, i (`learning-${i}`)}
													<span>{char}</span>
												{/each}
											</div>
										</div>

										<div>
											<span>Club.</span>
										</div>
									</div>
								</div>

								<div class="TagLine pt-2 text-lg opacity-75 lg:text-xl">
									Innovate beyond boundaries.
								</div>

								<div class="homeAccessorialImg">
									<img src="/images/inscribed-cropped.gif" alt="" class="mx-auto w-[8rem]" />
								</div>
							</div>
						</div>
					</section>

					<!-- Stuff We Do -->
					<section class="flex w-full justify-center pt-4">
						<section class="w-full max-w-6xl px-7 py-10 xl:max-w-7xl">
							<h2
								id="stuffWeDo"
								class="text-center text-3xl font-bold uppercase text-secondary md:text-4xl"
							>
								The stuff we do
							</h2>

							<div class="grid grid-cols-1 grid-rows-1 gap-10 py-12 lg:grid-cols-2">
								<div class="text-wrapper flex justify-center">
									<div id="stuffWeDo-content" class="max-w-[43rem] text-sm md:text-[1rem]">
										<p class="pb-4">
											Welcome to the Machine Learning Club of NIT Silchar, where we foster a vibrant
											community of students passionate about artificial intelligence and machine
											learning. If you're a student at our college with an interest in these
											cutting-edge fields, we invite you to join our dynamic club through our
											engaging classes and workshops. Our club is dedicated to educating students
											about machine learning, providing a platform for insightful discussions on AI
											trends, and offering valuable resources and guidance for hands-on learning and
											experimentation.
										</p>

										<p>
											At the Machine Learning Club, we go beyond the classroom, organizing diverse
											events like hackathons, workshops, talks, and weekly classes that are open to
											all ML enthusiasts. Whether you're a beginner or an experienced practitioner,
											our club creates an inclusive environment for everyone to explore, learn, and
											collaborate. Join us to build a strong network, stay updated on the latest
											developments, and be a part of a community that is passionate about both
											research and development in the exciting realm of artificial intelligence.
										</p>
									</div>
								</div>

								<div class="grid-wrapper flex justify-center">
									<div
										class="tiles grid snap-x snap-mandatory grid-flow-col grid-rows-[auto_auto] gap-3 overflow-x-scroll pb-[.4rem] lg:grid-rows-[auto_auto_auto] lg:gap-2 lg:overflow-x-hidden"
									>
										{#each aboutCards as card (card.title)}
											<div
												class="aboutCard wrapper relative w-[14rem] snap-center overflow-hidden rounded-md border-[.01rem] border-[#ffffff4a] p-5 lg:w-[14rem] xl:w-[14.5rem]"
											>
												<div class="absolute inset-0 -z-10 overflow-hidden">
													<picture>
														<img
															src="/images/gridGradientBlue.avif"
															alt=""
															class="h-full w-full object-cover"
															width="736"
															height="1308"
														/>
													</picture>
												</div>

												<h3 class="pb-2 text-sm font-bold uppercase text-secondary">
													{card.title}
												</h3>

												<h4 class="text-sm">{card.description}</h4>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</section>
					</section>

					<!-- Project Showcase -->
					<section class="bg-black p-7 py-16 pb-20">
						<div class="grid grid-cols-1 gap-4">
							<h2
								id="projectShowcase"
								class="pb-10 text-center text-3xl font-bold uppercase text-secondary md:text-4xl"
							>
								Project Showcase
							</h2>

							<section class="mx-auto w-full max-w-7xl px-2">
								{#if loadingProjects}
									<div class="flex flex-col items-center justify-center gap-4 py-20 text-white/70">
										<Loader2 class="h-8 w-8 animate-spin text-secondary" />
										<p class="text-xs font-bold uppercase tracking-widest">Loading projects...</p>
									</div>
								{:else if projectsError}
									<div
										class="rounded-3xl border border-dashed border-red-500/40 bg-[#111] py-20 text-center"
									>
										<h3 class="text-xl font-bold text-red-400">Firestore error</h3>
										<p class="mt-2 text-sm text-white/60">{projectsError}</p>
									</div>
								{:else if visibleProjects.length === 0}
									<div
										class="rounded-3xl border border-dashed border-white/20 bg-[#111] py-20 text-center"
									>
										<h3 class="text-xl font-bold text-white">No published projects found</h3>
										<p class="mt-2 text-sm text-white/60">
											Projects marked as Published in Firestore will appear here.
										</p>
									</div>
								{:else}
									<div class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
										{#each visibleProjects as project (project.id)}
											<div
												class="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#111] text-white transition-all duration-500 hover:-translate-y-2 hover:border-secondary/40 hover:shadow-2xl hover:shadow-secondary/10"
											>
												<div class="relative aspect-video overflow-hidden bg-[#191919]">
													<img
														src={project.imageUrl ||
															`https://picsum.photos/seed/${project.id}/600/450`}
														class="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
														alt={project.title || 'Project cover image'}
													/>

													<div
														class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
													></div>

													<div class="absolute left-4 top-4">
														<div
															class="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-secondary shadow-sm backdrop-blur-md"
														>
															{project.category || 'Project'}
														</div>
													</div>
												</div>

												<div class="space-y-4 p-8">
													<h4
														class="line-clamp-2 text-xl font-bold text-white transition-colors group-hover:text-secondary"
													>
														{project.title || 'Untitled Project'}
													</h4>

													<p class="line-clamp-2 text-sm leading-relaxed text-white/60">
														{project.shortDescription || 'No short description available.'}
													</p>

													<div class="flex items-center justify-between pt-4">
														<div class="flex -space-x-2">
															{#each project.teamMembers?.slice(0, 3) || [] as name, index (`${project.id}-${name}-${index}`)}
																<div
																	class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#111] bg-white/10 text-[10px] font-bold text-white shadow-sm"
																	title={name}
																>
																	{name.charAt(0)}
																</div>
															{/each}
														</div>

														<!-- <a
															href={resolve(`/projects/${project.id}`)}
															class="flex items-center rounded-full px-3 py-2 text-sm font-bold text-secondary transition hover:bg-white/10"
															aria-label={`View details for ${project.title || 'project'}`}
														>
															View Details
															<ArrowUpRight class="ml-1 h-4 w-4" aria-hidden="true" />
														</a> -->
													</div>
												</div>
											</div>
										{/each}
									</div>
								{/if}

								<div class="ml-auto mr-auto mt-10 flex max-w-[1280px] justify-end">
									<a
										href={resolve('/liveDemo/projects')}
										class="text-white/80 duration-300 hover:scale-105 hover:text-white md:text-lg"
									>
										<i class="ri-compass-line" aria-hidden="true"></i> | Explore
									</a>
								</div>
							</section>
						</div>
					</section>
				</section>
			</main>

			<!-- Footer -->
			<footer
				class="footer footer-center border-t border-dashed border-[#ffffff28] bg-black p-10 text-sm"
			>
				<nav>
					<div class="grid grid-flow-col gap-4">
						<a href="/">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								class="fill-base"
							>
								<path
									d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
								/>
							</svg>
						</a>

						<a href="https://www.youtube.com/@mlclubnits">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								class="fill-base"
							>
								<path
									d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
								/>
							</svg>
						</a>

						<a href="https://www.facebook.com/mlclubNITS/">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								class="fill-base"
							>
								<path
									d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"
								/>
							</svg>
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

	.hero-section {
		min-height: 100vh;
		overflow: hidden;
	}

	.hero-section .wrapper {
		position: relative;
		min-height: calc(100vh - 5rem);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.image-wrapper {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.hero-image-container {
		width: min(100%, 1080px);
		height: 100%;
		display: flex;
		justify-content: center;
	}

	.hero-image-container img {
		width: min(100%, 1080px);
		height: auto;
		object-fit: cover;
		display: block;
	}

	.text {
		position: absolute;
		inset: 0;
		z-index: 5;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: white;
		font-weight: 700;
		pointer-events: none;
	}

	.MachineLearning span {
		display: inline-block;
	}

	.homeAccessorialImg {
		margin-top: 1rem;
	}

	.aboutCard {
		min-height: 8rem;
		background-color: #111;
	}

	.slider,
	.tiles {
		scrollbar-width: thin;
		scrollbar-color: #ffffff3d transparent;
	}

	.slider::-webkit-scrollbar,
	.tiles::-webkit-scrollbar {
		height: 0.35rem;
	}

	.slider::-webkit-scrollbar-thumb,
	.tiles::-webkit-scrollbar-thumb {
		background: #ffffff3d;
		border-radius: 999px;
	}

	.project-showcase-card {
		color: white;
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

	@media (max-width: 768px) {
		.hero-section .wrapper {
			min-height: 80vh;
		}

		.hero-image-container img {
			min-height: 80vh;
			object-fit: cover;
		}
	}
</style>
