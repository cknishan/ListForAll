<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../styles.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;

	let categories = [];
	let newCategory = '';
	let { supabase, session } = data;

	$: ({ supabase, session } = data);

	// Fetch categories from Supabase
	async function fetchCategories() {
		const { data, error } = await supabase.from('category').select('*');
		if (!error) categories = data;
	}

	// Add a new category
	async function addCategory() {
		if (!newCategory.trim()) return;
		const { error } = await supabase.from('category').insert([{ category_name: newCategory }]);
		if (!error) {
			await fetchCategories();
			newCategory = '';
		}
	}

	onMount(() => {
		fetchCategories();

		const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>User Management</title>
</svelte:head>

<div class="flex h-screen">
	<!-- Sidebar -->
	<nav class="w-64 bg-gray-100 border-r border-gray-200 p-4">
		<!-- New Category Input -->
		<div class="mb-6">
			<input
				type="text"
				placeholder="New list..."
				bind:value={newCategory}
				class="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
			/>
			<button
				on:click={addCategory}
				class="mt-2 w-full bg-blue-500 text-white rounded py-2"
			>
				➕ Add List
			</button>
		</div>

		<!-- Category List -->
		<ul>
			<li>
				<a href="/" class="block py-2 px-3 rounded hover:bg-gray-200">
					All Tasks
				</a>
			</li>
			{#each categories as category}
				<li>
					<a href="/{category.category_id}" class="block py-2 px-3 rounded hover:bg-gray-200">
						{category.category_name}
					</a>
				</li>
			{/each}
		</ul>

		<!-- Settings -->
		<div class="mt-6">
			<a href="/account" class="block py-2 px-3 rounded bg-gray-200 hover:bg-gray-300">
				⚙️ Account Settings
			</a>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="flex-1 p-6 bg-gray-50 overflow-y-auto">
		<slot />
	</main>
</div>
