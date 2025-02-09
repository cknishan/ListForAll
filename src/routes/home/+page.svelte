<!-- src/routes/home/+page.svelte -->
<script lang="ts">
	export let data; // Loaded server data (todos)

	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { invalidate } from '$app/navigation';
	import ConfirmationDialog from '../../components/ConfirmationDialog.svelte';
	import TodoItem from '../../components/TodoItem.svelte';

	let loading = false;
	let errorMessage: string | null = null; // For server error messages

	// Instead of directly using data.todos everywhere,
	// create a local reactive variable that holds all todos.
	let todos = data.todos;

	// For deletion confirmation
	let showConfirmDialog = false;
	let confirmMessage = ''; // Message to show in the confirmation dialog
	let taskToDelete: string | null = null; // The task id to delete

	// A shared error handler to extract error messages from a response
	const handleError = async (res: Response | undefined) => {
		if (res && !res.ok) {
			try {
				const errorData = await res.json();
				errorMessage = errorData.error || 'An unexpected error occurred';
			} catch (parseError) {
				errorMessage = 'An unexpected error occurred';
				console.error('Error parsing response:', parseError);
			}
		} else {
			errorMessage = null;
		}
	};

	// Handle toggling a task's completed status
	const toggleTask: SubmitFunction = () => {
		loading = true;
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				errorMessage = result.data?.error || 'An unexpected error occurred';
			}
			await update();
			// After the update, reassign todos from data in case the server changed anything.
			// (Alternatively, you can update the local copy optimistically.)
			todos = (await dataUpdate()).todos;
			loading = false;
		};
	};

	// Handle adding a new task
	const addTodo: SubmitFunction = () => {
		loading = true;
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				errorMessage = result.data?.error || 'An unexpected error occurred';
			}
			await update();
			// Re-fetch todos after a new task is added.
			todos = (await dataUpdate()).todos;
			loading = false;
		};
	};

	// Helper function: re-run the load function by invalidating the data,
	// then update the local todos variable.
	async function dataUpdate() {
		await invalidate();
		// You can also fetch the latest todos directly if you have an API endpoint.
		// For now, assume that `data.todos` is automatically updated.
		return data;
	}

	// When the delete button is clicked, do not immediately submit.
	// Instead, store the task id and open the confirmation dialog.
	function confirmDeleteTask(taskId: string, taskName: string) {
		taskToDelete = taskId;
		confirmMessage = `Are you sure you want to delete the task "${taskName}"? This action cannot be undone.`;
		showConfirmDialog = true;
	}

	// This function is called when the user confirms deletion in the dialog.
	// It sends a POST request to your delete action and updates the local todos.
	async function handleConfirmDelete() {
		if (!taskToDelete) return;
		loading = true;

		// Build a FormData object to simulate a form submission.
		const formData = new FormData();
		formData.set('id', taskToDelete);

		// Call the delete server action using fetch.
		const res = await fetch('?/delete', {
			method: 'POST',
			body: formData
		});

		// Handle any errors returned from the server.
		await handleError(res);

		// If deletion is successful, update the local todos array immediately.
		if (res.ok) {
			todos = todos.filter((todo) => todo.task_id !== Number(taskToDelete));
		}

		// Optionally, you can re-fetch data from the server:
		// await invalidate();
		// todos = (await dataUpdate()).todos;

		// Reset state variables.
		loading = false;
		showConfirmDialog = false;
		taskToDelete = null;
	}
</script>

<svelte:head>
	<title>To-Do List</title>
</svelte:head>

<section class="mx-auto max-w-2xl p-4">
	<h1 class="mb-6 text-center text-2xl font-bold text-theme-bg-dark">All Tasks</h1>

	<!-- Add Task Form -->
	<form method="POST" action="?/add" use:enhance={addTodo} class="mb-4 flex gap-2">
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

	{#if todos.length === 0}
		<p class="mt-4 text-center text-gray-500">No tasks yet. Add one above!</p>
	{/if}

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
