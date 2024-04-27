import {writable} from "svelte/store";

export const tooltip = writable<string | null>(null);
export const openOverlay = writable<string | null>(null);
