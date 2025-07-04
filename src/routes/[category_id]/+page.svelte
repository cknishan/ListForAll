<!-- src/routes/[category_id]/+page.svelte -->
<script lang="ts">
	export let data; // Loaded server data (category, tasks, session)
	import { invalidate } from '$app/navigation';

	import { enhance } from '$app/forms';
	import ConfirmationDialog from '../../components/ConfirmationDialog.svelte';
	import TodoItem from '../../components/TodoItem.svelte';


	let todos = [...data.tasks]; 
	console.log(data);
	let errorMessage: string | null = null;
	let loading = false;

	// For deletion confirmation
	let showConfirmDialog = false;
	let confirmMessage = '';
	let taskToDelete: string | null = null;

	// Handle deletion confirmation
	function confirmDeleteTask(taskId: string, taskName: string) {
		taskToDelete = taskId;
		confirmMessage = `Are you sure you want to delete the task "${taskName}"? This action cannot be undone.`;
		showConfirmDialog = true;
	}

	// Handle confirmed deletion
	async function handleConfirmDelete() {
		if (!taskToDelete) return;
		loading = true;

		const formData = new FormData();
		formData.set('id', taskToDelete);

		// Call the delete server action
		const res = await fetch('?/delete', {
			method: 'POST',
			body: formData
		});

		if (res.ok) {
			// Refresh the page to reflect changes
			window.location.reload();
		} else {
			const errorData = await res.json();
			errorMessage = errorData.error || 'An unexpected error occurred';
		}

		loading = false;
		showConfirmDialog = false;
		taskToDelete = null;
	}

	async function toggleTask(taskId: number) {
		loading = true;
		errorMessage = null;

		const formData = new FormData();
		formData.set('id', taskId.toString());

		const res = await fetch('?/toggle', {
			method: 'POST',
			body: formData
		});

		if (!res.ok) {
			const errorData = await res.json();
			errorMessage = errorData.error || 'Failed to toggle task';
		} else {
			// Automatically re-fetch server data and update page
			// await invalidate();doesnt work
			window.location.reload();
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>Tasks for {data.category.category_name}</title>
</svelte:head>

<section class="mx-auto max-w-2xl p-4">
	<h1 class="mb-6 text-center text-2xl font-bold text-theme-bg-dark">
		Tasks for {data.category.category_name}
	</h1>

	<!-- Add Task Form -->
	<form method="POST" action="?/add" use:enhance class="mb-4 flex gap-2">
		<input
			type="text"
			name="content"
			placeholder="Add a new task"
			required
			class="flex-grow rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
		/>
		<button
			type="submit"
			class="rounded bg-theme-primary px-4 py-2 font-bold text-theme-bg-dark hover:opacity-90 focus:outline-none"
			disabled={loading}
		>
			+
		</button>
	</form>

	<!-- Display error message -->
	{#if errorMessage}
		<p class="mb-4 text-sm text-red-600">{errorMessage}</p>
	{/if}

	<!-- Pending Tasks -->
	<h2 class="text-xl font-semibold">Pending Tasks</h2>
	<ul class="space-y-4">
		{#each data.tasks.filter((task) => !task.completed) as task}
			<TodoItem todo={task} {confirmDeleteTask} {toggleTask} />
		{/each}
	</ul>

	<!-- Completed Tasks -->
	<h2 class="mt-4 text-xl font-semibold">Completed Tasks</h2>
	<ul class="space-y-4">
		{#each data.tasks.filter((task) => task.completed) as task}
			<TodoItem todo={task} {confirmDeleteTask} {toggleTask} />
		{/each}
	</ul>

	<!-- Confirmation Dialog -->
	{#if showConfirmDialog}
		<ConfirmationDialog
			bind:show={showConfirmDialog}
			message={confirmMessage}
			onConfirm={handleConfirmDelete}
			onCancel={() => {
				showConfirmDialog = false;
				taskToDelete = null;
			}}
		/>
	{/if}
</section>
