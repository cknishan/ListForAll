<!-- src/routes/+layout.svelte  -->

<script lang="ts">
	import '../styles.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import ConfirmationDialog from '../components/ConfirmationDialog.svelte'; // Import custom confirmation dialog

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
      navigator.serviceWorker.register('/sw.js')
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

<div class="flex h-screen">
	<!-- Sidebar -->
	{#if session}
	<section>
		<button
			class="fixed right-4 top-4 z-50 rounded-md bg-theme-primary p-2 text-white md:hidden"
			on:click={() => (sidebarOpen = !sidebarOpen)}
		>
			{#if sidebarOpen}
				&times; <!-- Close Icon -->
			{:else}
				&#9776; <!-- Hamburger Icon -->
			{/if}
		</button>

		<nav class="w-64 border-r border-gray-200 bg-gray-100 max-md:fixed max-md:inset-y-0 max-md:left-0 transform transition-transform duration-300 ease-in-out w-64 bg-white border-r border-gray-200 p-4 
		{sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0">
			<!-- New Category Input -->
			<div class="mb-6">
				<input
					type="text"
					placeholder="New list..."
					bind:value={newCategory}
					class="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
				/>
				<button on:click={addCategory} class="mt-2 w-full rounded bg-blue-500 py-2 text-white">
					➕ Add List
				</button>
				<!-- Display Error Message -->
				{#if errorMessage}
					<p class="mt-2 text-sm text-red-600">{errorMessage}</p>
				{/if}
			</div>

			<!-- Category List -->
			<ul>
				<li>
					<a href="/" class="block rounded px-3 py-2 hover:bg-gray-200"> All Tasks </a>
				</li>
				{#each categories as category}
					<li class="group flex items-center justify-between">
						<a href="/{category.category_id}" class="block rounded px-3 py-2 hover:bg-gray-200">
							{category.category_name}
						</a>
						<div class="hidden space-x-2 group-hover:flex">
							<button
								class="text-blue-500 hover:text-blue-700"
								on:click={() => enableEditMode(category)}
							>
								✏️
							</button>
							<button
								class="text-red-500 hover:text-red-700"
								on:click={() => confirmDeleteCategory(category.category_id, category.category_name)}
							>
								🗑️
							</button>
						</div>
					</li>
				{/each}
			</ul>

			<!-- Edit Category -->
			{#if editMode && editedCategory}
				<div class="mt-4">
					<h3 class="text-lg font-semibold">Edit Category</h3>
					<input
						type="text"
						bind:value={editedCategory.name}
						class="mt-2 w-full rounded border px-3 py-2 focus:outline-none focus:ring"
					/>
					<div class="mt-2 flex justify-between">
						<button class="rounded bg-blue-500 px-4 py-2 text-white" on:click={updateCategory}>
							Update
						</button>
						<button class="rounded bg-gray-300 px-4 py-2 text-gray-700" on:click={cancelEditMode}>
							Cancel
						</button>
					</div>
				</div>
			{/if}

			<!-- Settings -->
			<div class="mt-6">
				<a href="/account" class="block rounded bg-gray-200 px-3 py-2 hover:bg-gray-300">
					⚙️ Account Settings
				</a>
			</div>
		</nav>
	</section>
	{/if}

	<!-- Main Content -->
	<main class="flex-1 overflow-y-auto transition-all duration-300 ease-in-out {sidebarOpen ? 'ml-64' : 'ml-0'}">
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
