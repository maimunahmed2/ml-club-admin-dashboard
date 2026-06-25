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

	type Blog = {
		id: string;
		title?: string;
		excerpt?: string;
		content?: string;
		coverImage?: string;
		imageUrl?: string;
		category?: string;
		author?: string;
		status?: string;
		featured?: boolean;
		tags?: string[];
		slug?: string;
		externalUrl?: string;
		createdAt?: {
			toDate?: () => Date;
		};
		updatedAt?: {
			toDate?: () => Date;
		};
		publishedAt?: {
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

	let blogs = $state<Blog[]>([]);
	let loadingBlogs = $state(true);
	let blogsError = $state('');

	const visibleBlogs = $derived(
		blogs.filter((blog) => {
			const status = blog.status?.trim().toLowerCase();

			// Keep this flexible while testing.
			// Later you can change this to: return status === 'published';
			return !status || status === 'published';
		})
	);

	$effect(() => {
		const blogsRef = collection(db, 'blogs');

		const unsubscribe = onSnapshot(
			blogsRef,
			(snapshot) => {
				blogs = snapshot.docs.map((document) => ({
					id: document.id,
					...document.data()
				})) as Blog[];

				blogs = blogs.sort((a, b) => {
					const aTime =
						a.publishedAt?.toDate?.()?.getTime() ??
						a.updatedAt?.toDate?.()?.getTime() ??
						a.createdAt?.toDate?.()?.getTime() ??
						0;

					const bTime =
						b.publishedAt?.toDate?.()?.getTime() ??
						b.updatedAt?.toDate?.()?.getTime() ??
						b.createdAt?.toDate?.()?.getTime() ??
						0;

					return bTime - aTime;
				});

				loadingBlogs = false;
			},
			(error) => {
				console.error('Firestore blogs error:', error);
				blogsError = error.message;
				loadingBlogs = false;
			}
		);

		return unsubscribe;
	});

	function getBlogDate(blog: Blog) {
		const date =
			blog.publishedAt?.toDate?.() || blog.updatedAt?.toDate?.() || blog.createdAt?.toDate?.();

		if (!date) return 'N/A';

		return date.toLocaleDateString('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function getBlogHref(blog: Blog) {
		if (blog.externalUrl) return blog.externalUrl;
		return resolve(`/blogs/${blog.slug || blog.id}`);
	}
</script>

<svelte:head>
	<title>Blogs | ML Club NITS</title>

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

				<section class="blogs-page px-6 pb-20">
					<div class="mx-auto max-w-7xl">
						<div class="mb-14 text-center">
							<p class="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-secondary">
								Knowledge Base
							</p>

							<h1 class="text-4xl font-bold text-[#FFFCE1] md:text-5xl">Blogs & Articles</h1>

							<p
								class="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#FFFCE1]/60 md:text-base"
							>
								Explore thoughts, research notes, tutorials, and updates from the Machine Learning
								Club, NIT Silchar.
							</p>
						</div>

						{#if loadingBlogs}
							<div class="flex flex-col items-center justify-center gap-4 py-24 text-[#FFFCE1]/70">
								<Loader2 class="h-8 w-8 animate-spin text-secondary" />
								<p class="text-xs font-bold uppercase tracking-widest">Loading blogs...</p>
							</div>
						{:else if blogsError}
							<div
								class="mx-auto max-w-[700px] rounded-sm border border-dashed border-red-500/40 p-10 text-center"
							>
								<h2 class="text-xl font-bold text-red-400">Firestore error</h2>
								<p class="mt-2 text-sm text-[#FFFCE1]/60">{blogsError}</p>
							</div>
						{:else if visibleBlogs.length === 0}
							<div
								class="mx-auto max-w-[700px] rounded-sm border border-dashed border-[#FFFCE1]/30 p-10 text-center"
							>
								<h2 class="text-xl font-bold text-[#FFFCE1]">No blogs found</h2>
								<p class="mt-2 text-sm text-[#FFFCE1]/60">
									Blogs added in Firestore will appear here.
								</p>
							</div>
						{:else}
							<div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
								{#each visibleBlogs as blog (blog.id)}
									<article
										class="blog-card group overflow-hidden rounded-sm border border-dashed border-[#FFFCE1]/30 bg-[#0f0f0f] transition duration-300 hover:-translate-y-1 hover:border-[#FFFCE1]/70"
									>
										<div class="relative aspect-video overflow-hidden bg-[#191919]">
											<img
												src={blog.coverImage ||
													blog.imageUrl ||
													`https://picsum.photos/seed/${blog.id}/700/420`}
												alt={blog.title || 'Blog cover image'}
												class="h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
												loading="lazy"
											/>

											<div
												class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
											></div>

											<div class="absolute left-4 top-4">
												<span
													class="rounded-full border border-[#FFFCE1]/20 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary backdrop-blur-md"
												>
													{blog.category || 'Blog'}
												</span>
											</div>

											{#if blog.featured}
												<div class="absolute right-4 top-4">
													<span
														class="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black"
													>
														Featured
													</span>
												</div>
											{/if}
										</div>

										<div class="flex min-h-[17rem] flex-col p-5">
											<div
												class="mb-3 flex items-center justify-between gap-3 text-[11px] uppercase tracking-widest text-[#FFFCE1]/50"
											>
												<span>{blog.author || 'ML Club NITS'}</span>
												<span>{getBlogDate(blog)}</span>
											</div>

											<h2
												class="line-clamp-2 text-2xl font-bold leading-tight text-[#FFFCE1] transition group-hover:text-secondary"
											>
												{blog.title || 'Untitled Blog'}
											</h2>

											<p
												class="mt-4 line-clamp-3 flex-grow text-sm leading-relaxed text-[#FFFCE1]/65"
											>
												{blog.excerpt || blog.content || 'No blog excerpt available.'}
											</p>

											{#if blog.tags && blog.tags.length > 0}
												<div class="mt-5 flex flex-wrap gap-2">
													{#each blog.tags.slice(0, 3) as tag (`${blog.id}-${tag}`)}
														<span
															class="rounded-full border border-[#FFFCE1]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FFFCE1]/60"
														>
															{tag}
														</span>
													{/each}
												</div>
											{/if}

											<!-- <div class="mt-6 border-t border-dashed border-[#FFFCE1]/20 pt-4">
												<a
													href={getBlogHref(blog)}
													target={blog.externalUrl ? '_blank' : undefined}
													rel={blog.externalUrl ? 'noreferrer' : undefined}
													class="inline-flex items-center gap-2 text-sm font-bold text-secondary transition hover:text-white"
													aria-label={`Read ${blog.title || 'blog'}`}
												>
													Read Blog
													<i class="ri-arrow-right-up-line text-lg" aria-hidden="true"></i>
												</a>
											</div> -->
										</div>
									</article>
								{/each}
							</div>
						{/if}
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

	.blogs-page {
		min-height: calc(100vh - 7rem);
	}

	.blog-card {
		background:
			radial-gradient(circle at top left, rgba(255, 255, 255, 0.06), transparent 35%), #0f0f0f;
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
