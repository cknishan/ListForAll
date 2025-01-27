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
</script>

<svelte:head>
	<title>User Management</title>
</svelte:head>

<div class="flex h-screen">
	
	<!-- Sidebar -->
	 {#if session}

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
			<!-- Display Error Message -->
			{#if errorMessage}
				<p class="mt-2 text-sm text-red-600">{errorMessage}</p>
			{/if}
		</div>

		<!-- Category List -->
		<ul>
			<li>
				<a href="/" class="block py-2 px-3 rounded hover:bg-gray-200">
					All Tasks
				</a>
			</li>
			{#each categories as category}
				<li class="flex justify-between items-center group">
					<a href="/{category.category_id}" class="block py-2 px-3 rounded hover:bg-gray-200">
						{category.category_name}
					</a>
					<div class="hidden group-hover:flex space-x-2">
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
					class="w-full px-3 py-2 border rounded focus:outline-none focus:ring mt-2"
				/>
				<div class="flex justify-between mt-2">
					<button
						class="bg-blue-500 text-white px-4 py-2 rounded"
						on:click={updateCategory}
					>
						Update
					</button>
					<button
						class="bg-gray-300 text-gray-700 px-4 py-2 rounded"
						on:click={cancelEditMode}
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}

		<!-- Settings -->
		<div class="mt-6">
			<a href="/account" class="block py-2 px-3 rounded bg-gray-200 hover:bg-gray-300">
				⚙️ Account Settings
			</a>
		</div>
	</nav>

	{/if}

	<!-- Main Content -->
	<main class="flex-1 bg-gray-50 overflow-y-auto">
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
