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

	let members = $state<Member[]>([]);
	let loadingMembers = $state(true);
	let membersError = $state('');

	const visibleMembers = $derived(
		members.filter((member) => {
			const type = member.type?.trim().toLowerCase();
			const status = member.status?.trim().toLowerCase();

			// Keeps the public page as "Members" only.
			// Alumni will not show here.
			const isNotAlumni = type !== 'alumni';

			// Shows Active members. Also allows missing status temporarily.
			const isActive = !status || status === 'active';

			return isNotAlumni && isActive;
		})
	);

	$effect(() => {
		const membersRef = collection(db, 'members');

		const unsubscribe = onSnapshot(
			membersRef,
			(snapshot) => {
				members = snapshot.docs.map((document) => ({
					id: document.id,
					...document.data()
				})) as Member[];

				loadingMembers = false;
			},
			(error) => {
				console.error('Firestore members error:', error);
				membersError = error.message;
				loadingMembers = false;
			}
		);

		return unsubscribe;
	});
</script>

<svelte:head>
	<title>Members | ML Club NITS</title>

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

			<main class="flex-grow bg-black pt-16">
				<div>
					<h1 class="heading text-2xl text-secondary">MEET THE TEAM</h1>
					<hr class="team-divider" />
				</div>

				<section class="members-section relative overflow-hidden pt-16">
					<div class="members-container">
						{#if loadingMembers}
							<div class="flex flex-col items-center justify-center gap-4 py-20 text-white/70">
								<Loader2 class="h-8 w-8 animate-spin text-secondary" />
								<p class="text-xs font-bold uppercase tracking-widest">Loading members...</p>
							</div>
						{:else if membersError}
							<div
								class="mx-auto max-w-2xl rounded-3xl border border-dashed border-red-500/40 bg-white/[0.03] py-20 text-center"
							>
								<h2 class="text-xl font-bold text-red-400">Firestore error</h2>
								<p class="mt-2 text-sm text-white/60">{membersError}</p>
							</div>
						{:else if visibleMembers.length === 0}
							<div
								class="mx-auto max-w-2xl rounded-3xl border border-dashed border-white/20 bg-white/[0.03] py-20 text-center"
							>
								<h2 class="text-xl font-bold text-white">No members found</h2>
								<p class="mt-2 text-sm text-white/60">
									Members added in Firestore will appear here.
								</p>
							</div>
						{:else}
							<div class="grid-container">
								{#each visibleMembers as member (member.id)}
									<div class="grid-item">
										<div class="member-card card aspect-[5/6] min-w-[20rem]">
											<div class="member-image">
												<img
													src={member.avatar || `https://picsum.photos/seed/${member.id}/500/600`}
													class="object-cover"
													alt={member.name || 'ML Club member'}
													loading="lazy"
												/>
											</div>

											<div class="member-name">
												<p>{member.name || 'Unnamed Member'}</p>
											</div>

											<div class="member-role">
												<p>{member.position || member.type || 'MEMBER'}</p>
											</div>

											<div class="member-contacts">
												<div>
													{#if member.github}
														<a
															href={member.github}
															target="_blank"
															rel="noreferrer"
															aria-label={`GitHub profile for ${member.name || 'member'}`}
															title={`GitHub profile for ${member.name || 'member'}`}
															class="text-[whitesmoke]/70 hover:cursor-pointer hover:text-white"
														>
															<i class="ri-github-fill" aria-hidden="true"></i>
														</a>
													{/if}

													{#if member.linkedin}
														<a
															href={member.linkedin}
															target="_blank"
															rel="noreferrer"
															aria-label={`LinkedIn profile for ${member.name || 'member'}`}
															title={`LinkedIn profile for ${member.name || 'member'}`}
															class="text-[whitesmoke]/70 hover:cursor-pointer hover:text-white"
														>
															<i class="ri-linkedin-box-fill" aria-hidden="true"></i>
														</a>
													{/if}

													{#if member.facebook}
														<a
															href={member.facebook}
															target="_blank"
															rel="noreferrer"
															aria-label={`Facebook profile for ${member.name || 'member'}`}
															title={`Facebook profile for ${member.name || 'member'}`}
															class="text-[whitesmoke]/70 hover:cursor-pointer hover:text-white"
														>
															<i class="ri-facebook-circle-fill" aria-hidden="true"></i>
														</a>
													{/if}
												</div>
											</div>
										</div>
									</div>
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

	.member-card {
		position: relative;
	}

	.member-card::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(circle at top left, rgba(255, 255, 255, 0.08), transparent 35%),
			linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.2));
		z-index: 1;
	}

	.member-card > * {
		position: relative;
		z-index: 2;
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

	.heading {
		text-align: center;
		font-weight: 700;
		padding-top: 4rem;
		letter-spacing: 0.15em;
	}

	.team-divider {
		margin: 1rem auto 0;
		width: 6rem;
		border-color: hsl(var(--s));
		opacity: 0.7;
	}

	.members-section {
		background: black;
		min-height: 100vh;
		padding-bottom: 6rem;
	}

	.tabs {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 4rem;
	}

	.tabs button {
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 999px;
		padding: 0.55rem 1.4rem;
		color: rgba(245, 245, 245, 0.7);
		background: rgba(255, 255, 255, 0.04);
		transition:
			background 0.25s ease,
			color 0.25s ease,
			border-color 0.25s ease;
	}

	.tabs button:hover,
	.tabs button.active-tab {
		color: white;
		border-color: rgba(255, 255, 255, 0.45);
		background: rgba(255, 255, 255, 0.12);
	}

	.members-container {
		width: 100%;
		display: flex;
		justify-content: center;
		padding-inline: 1.5rem;
	}

	.grid-container {
		width: 100%;
		max-width: 92rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		justify-items: center;
		gap: 3rem 2rem;
	}

	.grid-item {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.member-card {
		position: relative;
		overflow: hidden;
		background: #111;
		color: white;
		border-radius: 0.35rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
		transition:
			transform 0.3s ease,
			border-color 0.3s ease;
	}

	.member-card:hover {
		transform: translateY(-0.35rem);
		border-color: rgba(255, 255, 255, 0.32);
	}

	.member-image {
		width: 100%;
		height: 70%;
		overflow: hidden;
		background: #191919;
	}

	.member-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		filter: grayscale(8%);
		transition: transform 0.45s ease;
	}

	.member-card:hover .member-image img {
		transform: scale(1.04);
	}

	.member-name {
		height: 10%;
		display: flex;
		align-items: end;
		justify-content: center;
		text-align: center;
		padding-inline: 1rem;
		font-weight: 700;
		font-size: 1rem;
	}

	.member-role {
		height: 8%;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding-inline: 1rem;
		color: hsl(var(--s));
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
	}

	.member-contacts {
		height: 12%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.member-contacts > div {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		font-size: 1.45rem;
	}

	.member-contacts button,
	.member-contacts a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 0;
		padding: 0;
		line-height: 1;
		transition: color 0.2s ease;
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
		.grid-container {
			grid-template-columns: 1fr;
		}

		.member-card {
			min-width: 18rem;
			max-width: 20rem;
		}
	}
</style>
