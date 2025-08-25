import type { LayoutServerLoad } from './$types';

// Since we're using localStorage (client-side only),
// we'll handle authentication checks in the client-side layout
export const load: LayoutServerLoad = async () => {
	return {};
};
