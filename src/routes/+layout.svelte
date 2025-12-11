<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>avirai file server</title>
	<meta name="description" content="A simple file server built with SvelteKit" />
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
