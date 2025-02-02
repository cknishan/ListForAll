<!-- src/routes/[category_id]/+page.svelte -->
<script lang="ts">
	export let data;

	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { invalidate } from '$app/navigation';
	import ConfirmationDialog from '../../components/ConfirmationDialog.svelte';

	let loading = false;
	let errorMessage: string | null = null;

	// Create a local reactive variable to store tasks
	let todos = data.tasks;

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
	<h1 class="text-2xl font-bold mb-6 text-center">Tasks for {data.category.category_name}</h1>
	
	<!-- Add Task Form -->
	<form method="POST" action="?/add" use:enhance={addTask} class="mb-4 flex gap-2">
		<input
			type="text"
			name="content"
			placeholder="Add a new task"
			required
			class="flex-grow rounded border px-3 py-2 focus:ring focus:ring-blue-300"
		/>
		<button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white" disabled={loading}>
			Add Task
		</button>
	</form>
	
	<!-- Error Message -->
	{#if errorMessage}
		<p class="text-red-600 text-sm mb-4">{errorMessage}</p>
	{/if}
	
	<!-- Pending Tasks -->
	<h2 class="text-xl font-semibold">Pending Tasks</h2>
	<ul class="space-y-4">
		{#each todos.filter(task => !task.completed) as task}
			<li class="flex items-center justify-between rounded bg-gray-100 p-3">
				<div class="flex items-center gap-2">
					<!-- Toggle Task -->
					<form method="POST" action="?/toggle" use:enhance={toggleTask}>
						<input type="hidden" name="id" value={task.task_id} />
						<input
							type="checkbox"
							checked={task.completed}
							on:change={() => document.querySelector(`form input[name="id"][value="${task.task_id}"]`)?.closest('form')?.requestSubmit()}
							class="h-5 w-5 text-blue-500 focus:ring focus:ring-blue-300"
						/>
					</form>
					<span>{task.task_name}</span>
				</div>
	
				<!-- Delete Button -->
				<button
					type="button"
					class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 focus:outline-none"
					on:click={() => confirmDeleteTask(task.task_id.toString(), task.task_name)}
				>
					❌
				</button>
			</li>
		{/each}
	</ul>
	
	<!-- Completed Tasks -->
	<h2 class="text-xl font-semibold mt-4">Completed Tasks</h2>
	<ul class="space-y-4">
		{#each todos.filter(task => task.completed) as task}
			<li class="flex items-center justify-between rounded bg-gray-100 p-3">
				<div class="flex items-center gap-2">
					<!-- Toggle Task -->
					<form method="POST" action="?/toggle" use:enhance={toggleTask}>
						<input type="hidden" name="id" value={task.task_id} />
						<input
							type="checkbox"
							checked={task.completed}
							on:change={() => document.querySelector(`form input[name="id"][value="${task.task_id}"]`)?.closest('form')?.requestSubmit()}
							class="h-5 w-5 text-blue-500 focus:ring focus:ring-blue-300"
						/>
					</form>
					<span class="line-through">{task.task_name}</span>
				</div>
	
				<!-- Delete Button -->
				<button
					type="button"
					class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 focus:outline-none"
					on:click={() => confirmDeleteTask(task.task_id.toString(), task.task_name)}
				>
					❌
				</button>
			</li>
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

