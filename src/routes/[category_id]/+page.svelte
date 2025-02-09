<!-- src/routes/[category_id]/+page.svelte -->
<script lang="ts">
	export let data;

	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { invalidate } from '$app/navigation';
	import ConfirmationDialog from '../../components/ConfirmationDialog.svelte';
	import TodoItem from '../../components//TodoItem.svelte';

	let loading = false;
	let errorMessage: string | null = null;

	// Create a local reactive variable to store tasks
	let todos = data.tasks;

	// Watch for changes using reactive
	$: {
		todos = data.tasks;
	}

	let showConfirmDialog = false;
	let confirmMessage = '';
	let taskToDelete: string | null = null;

	// Helper function: Refresh tasks from the server
	async function dataUpdate() {
		await invalidate();
		// Reassign `todos` to updated data
		todos = data.tasks;
	}

	// Handles adding a task
	const addTask: SubmitFunction = () => {
		loading = true;
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				errorMessage = result.data?.error || 'An unexpected error occurred';
			}
			await update();
			// Refresh tasks after adding
			await dataUpdate();
			loading = false;
		};
	};

	// Handles toggling task completion
	const toggleTask: SubmitFunction = () => {
		loading = true;
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				errorMessage = result.data?.error || 'An unexpected error occurred';
			}
			await update();
			// Refresh tasks after toggling
			await dataUpdate();
			loading = false;
		};
	};

	// When the delete button is clicked, open the confirmation dialog
	function confirmDeleteTask(taskId: string, taskName: string) {
		taskToDelete = taskId;
		confirmMessage = `Are you sure you want to delete the task "${taskName}"? This action cannot be undone.`;
		showConfirmDialog = true;
	}

	// Handles deleting a task
	async function handleConfirmDelete() {
		if (!taskToDelete) return;
		loading = true;

		const formData = new FormData();
		formData.set('id', taskToDelete);

		// Call the delete server action using fetch
		const res = await fetch('?/delete', {
			method: 'POST',
			body: formData
		});

		if (res.ok) {
			// Optimistically update the local list
			todos = todos.filter((todo) => todo.task_id !== Number(taskToDelete));
		} else {
			const errorData = await res.json();
			errorMessage = errorData.error || 'An unexpected error occurred';
		}

		// Reset state
		loading = false;
		showConfirmDialog = false;
		taskToDelete = null;
	}
</script>

<section class="mx-auto max-w-2xl p-4">
	<h1 class="mb-6 text-center text-2xl font-bold text-theme-bg-dark">
		Tasks for {data.category.category_name}
	</h1>

	<!-- Add Task Form -->
	<form method="POST" action="?/add" use:enhance={addTask} class="mb-4 flex gap-2">
		<input
			type="text"
			name="content"
			placeholder="Add a new task"
			required
			class="flex-grow rounded border px-3 py-2 focus:ring focus:ring-blue-300"
		/>
		<button
			type="submit"
			class="rounded bg-theme-primary px-4 py-2 font-bold text-theme-bg-dark"
			disabled={loading}
		>
			+
		</button>
	</form>

	<!-- Error Message -->
	{#if errorMessage}
		<p class="mb-4 text-sm text-red-600">{errorMessage}</p>
	{/if}

	<!-- Pending Tasks -->
	<h2 class="text-xl font-semibold">Pending Tasks</h2>
	<ul class="space-y-4">
		{#each todos.filter((task) => !task.completed) as task}
			{console.log(task)}
			<TodoItem todo={task} toggleTodo={toggleTask} {confirmDeleteTask} />
		{/each}
	</ul>

	<!-- Completed Tasks -->
	<h2 class="mt-4 text-xl font-semibold">Completed Tasks</h2>
	<ul class="space-y-4">
		{#each todos.filter((task) => task.completed) as task}
			<TodoItem todo={task} toggleTodo={toggleTask} {confirmDeleteTask} />
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
