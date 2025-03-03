<!-- src/routes/+layout.svelte  -->

<script lang="ts">
	import '../styles.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import ConfirmationDialog from '../components/ConfirmationDialog.svelte'; // Import custom confirmation dialog
	import Icon from '@iconify/svelte';

	export let data;

	let categories: any = []; // Stores the list of categories
	let newCategory = ''; // Input for creating a new category
	let { supabase, session } = data; // Extract supabase client and session
	let errorMessage: string = ''; // Stores error messages
	let showConfirmDialog = false; // Controls visibility of the confirmation dialog
	let confirmMessage = ''; // Message displayed in the confirmation dialog
	let categoryToDelete: string | null = null; // ID of the category to delete
	let editMode = false; // Tracks if a category is being edited
	let editedCategory: { id: string; name: string } | null = null; // Stores the category being edited
	let sidebarOpen = false; // Controls visibility of the sidebar

	$: ({ supabase, session } = data); // Update supabase and session reactively

	// Fetch categories for the logged-in user
	async function fetchCategories() {
		if (!session) return;
		const { data, error } = await supabase
			.from('category')
			.select('*')
			.eq('user_id', session.user.id);
		if (!error) categories = data;
		else console.error('Error fetching categories:', error);
	}

	// Add a new category
	async function addCategory() {
		errorMessage = '';
		if (!newCategory.trim() || !session) return;

		// Check if the category name already exists
		const { data: existingCategories, error: fetchError } = await supabase
			.from('category')
			.select('category_name')
			.ilike('category_name', newCategory.trim());

		if (fetchError) {
			console.error('Error checking category:', fetchError);
			return;
		}

		if (existingCategories && existingCategories.length > 0) {
			errorMessage = `The category "${newCategory}" already exists.`;
			return;
		}

		// Insert the new category
		const { error } = await supabase.from('category').insert([
			{
				category_name: newCategory.trim(),
				user_id: session.user.id
			}
		]);

		if (!error) {
			await fetchCategories();
			newCategory = '';
		} else {
			console.error('Error adding category:', error);
			errorMessage = 'Failed to add category. Please try again.';
		}
	}

	// Enable edit mode for a category
	function enableEditMode(category: any) {
		editMode = true;
		editedCategory = { id: category.category_id, name: category.category_name };
	}

	// Update the category
	async function updateCategory() {
		errorMessage = '';
		if (!editedCategory || !editedCategory.name.trim()) return;

		// Check for duplicates
		const { data: existingCategories, error: fetchError } = await supabase
			.from('category')
			.select('category_name')
			.ilike('category_name', editedCategory.name.trim());

		if (fetchError) {
			console.error('Error checking category:', fetchError);
			return;
		}

		if (existingCategories && existingCategories.length > 0) {
			errorMessage = `The category "${editedCategory.name}" already exists.`;
			return;
		}

		// Update the category
		const { error } = await supabase
			.from('category')
			.update({ category_name: editedCategory.name.trim() })
			.eq('category_id', editedCategory.id);

		if (!error) {
			await fetchCategories();
			cancelEditMode();
		} else {
			console.error('Error updating category:', error);
			errorMessage = 'Failed to update category. Please try again.';
		}
	}

	// Cancel edit mode
	function cancelEditMode() {
		editMode = false;
		editedCategory = null;
	}

	// Show confirmation dialog before deleting a category
	function confirmDeleteCategory(categoryId: string, categoryName: string) {
		categoryToDelete = categoryId;
		confirmMessage = `Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`;
		showConfirmDialog = true;
	}

	// Delete a category
	async function deleteCategory() {
		if (!categoryToDelete) return;

		const { error } = await supabase.from('category').delete().eq('category_id', categoryToDelete);

		if (!error) {
			await fetchCategories();
		} else {
			console.error('Error deleting category:', error);
			errorMessage = 'Failed to delete category. Please try again.';
		}

		// Reset confirmation dialog state
		showConfirmDialog = false;
		categoryToDelete = null;
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

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/sw.js')
				.then((registration) => {
					console.log('Service Worker registered with scope:', registration.scope);
				})
				.catch((error) => {
					console.error('Service Worker registration failed:', error);
				});
		}
	});
</script>

<svelte:head>
	<title>User Management</title>
</svelte:head>

<div class="flex max-h-screen">
	<!-- Sidebar -->
	{#if session}
		<section class="min-h-screen bg-theme-bg-dark">
			<div class="fixed right-0 top-0 pt-2 pr-4 pl-6 pb-4 z-50 bg-theme-bg-dark text-theme-primary md:hidden rounded-bl-full">
				<button
					
					on:click={() => (sidebarOpen = !sidebarOpen)}
				>
					{#if sidebarOpen}
						<Icon icon="mdi:close" class="h-6 w-6" /> <!-- Close Icon -->
					{:else}
						<Icon icon="mdi:menu" class="h-6 w-6" /> <!-- Hamburger Icon -->
					{/if}
				</button>
			</div>

			<!-- Sidebar Navigation -->
			<nav
				class="w-64 transform border-r border-gray-200 p-4 transition-transform duration-300 ease-in-out max-md:fixed max-md:inset-y-0 max-md:left-0
			{sidebarOpen
					? 'translate-x-0'
					: '-translate-x-full'} flex min-h-screen flex-col bg-theme-bg-dark md:translate-x-0"
			>
				<div class="flex items-center justify-center space-x-2 py-2">
					<img src="/logo.png" alt="Logo" class="h-10 w-10" />
					<h1 class="text-3xl font-bold text-theme-primary">ListForAll</h1>
				</div>
				<!-- New Category Input -->
				<div class="mb-4">
					<input
						type="text"
						placeholder="New list..."
						bind:value={newCategory}
						class="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
					/>
					<button
						on:click={addCategory}
						class="mt-2 w-full rounded bg-theme-primary px-4 py-2 text-white"
					>
						+ Add List
					</button>
					<!-- Display Error Message -->
					{#if errorMessage}
						<p class="mt-2 text-sm text-red-600">{errorMessage}</p>
					{/if}
				</div>

				<!-- Category List (Fixed height & Scrollable) -->
				<ul class="h-64 overflow-y-auto rounded-md border border-l-2 border-theme-primary p-2">
					<li>
						<a
							href="/"
							class="block rounded px-3 py-2 font-bold text-theme-primary hover:bg-gray-200"
							>All Tasks</a
						>
					</li>
					{#each categories as category}
						<li>
							<a
								href="/{category.category_id}"
								class=" flex w-full justify-between rounded px-3 py-2 hover:bg-gray-200"
							>
								<p class="text-theme-primary">{category.category_name}</p>

								<div class="flex space-x-2">
									<button class="text-blue-500" on:click={() => enableEditMode(category)}>
										<Icon icon="mdi:pencil" class="h-5 w-5" />
									</button>
									<button
										class="text-red-500"
										on:click={() =>
											confirmDeleteCategory(category.category_id, category.category_name)}
									>
										<Icon icon="mdi:trash-can" class="h-5 w-5" />
									</button>
								</div>
							</a>
						</li>
					{/each}
				</ul>
				<!-- Settings -->
				<div class="rounded bg-gray-200">
					<a href="/account" class="block px-3 py-2 hover:bg-gray-300">
						⚙️ Account and Settings
					</a>
					<a href="/about" class="block px-3 py-2 hover:bg-gray-300">
						About
					</a>
				</div>

				<!-- Edit Category -->
				{#if editMode && editedCategory}
					<div class="mt-4 text-white">
						<h3>Edit Category</h3>
						<input
							type="text"
							bind:value={editedCategory.name}
							class="mt-2 w-full rounded border px-3 py-2 text-theme-bg-dark focus:outline-none focus:ring"
						/>
						<div class="mt-2 flex justify-between">
							<button
								class="rounded bg-theme-primary px-2 py-2 text-white"
								on:click={updateCategory}
							>
								Update
							</button>
							<button class="rounded bg-gray-300 px-2 py-2 text-gray-700" on:click={cancelEditMode}>
								Cancel
							</button>
						</div>
					</div>
				{/if}
			</nav>
		</section>
	{/if}

	<!-- Main Content -->
	<main
		class="flex-1 overflow-y-auto transition-all duration-300 ease-in-out {sidebarOpen
			? 'ml-64'
			: 'ml-0'}"
	>
		<slot />
	</main>

	<!-- Confirmation Dialog -->
	{#if session}
		<ConfirmationDialog
			bind:show={showConfirmDialog}
			message={confirmMessage}
			onConfirm={deleteCategory}
			onCancel={() => {
				showConfirmDialog = false;
				categoryToDelete = null;
			}}
		/>
	{/if}
</div>
