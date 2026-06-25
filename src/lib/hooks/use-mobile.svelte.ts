import { onMount } from 'svelte';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
	let isMobile = $state(false);

	onMount(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

		const update = () => {
			isMobile = mql.matches;
		};

		update();

		mql.addEventListener('change', update);

		return () => {
			mql.removeEventListener('change', update);
		};
	});

	return {
		get value() {
			return isMobile;
		}
	};
}