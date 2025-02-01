<script lang="ts">
	export let data; // Loaded server data (todos)
  
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { invalidate } from '$app/navigation';
	import ConfirmationDialog from '../../components/ConfirmationDialog.svelte';
  
	let loading = false;
	let errorMessage: string | null = null; // For server error messages
  
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
	const toggleTodo: SubmitFunction = () => {
	  loading = true;
	  return async ({ result, update }) => {
		if (result.type === 'failure') {
		  errorMessage = result.data?.error || 'An unexpected error occurred';
		}
		await update();
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
		loading = false;
	  };
	};
  
	// For toggling a task from a checkbox change:
	function handleToggle(taskId: number) {
	  // Find the closest form with the matching task id and submit it
	  const form = document
		.querySelector(`form input[name="id"][value="${taskId}"]`)
		?.closest('form') as HTMLFormElement;
	  if (form) {
		form.requestSubmit();
	  }
	}
  
	// When the delete button is clicked, do not immediately submit.
	// Instead, store the task id and open the confirmation dialog.
	function confirmDeleteTask(taskId: string, taskName: string) {
	  taskToDelete = taskId;
	  confirmMessage = `Are you sure you want to delete the task "${taskName}"? This action cannot be undone.`;
	  showConfirmDialog = true;
	}
  
	// This function is called when the user confirms deletion in the dialog.
	// It sends a POST request to your delete action and refreshes the data.
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
  
	  // Handle any errors returned from the server
	  await handleError(res);
  
	  // Refresh the data from your load function so the deleted task no longer appears.
	  await invalidate();
  
	  // Reset state variables
	  loading = false;
	  showConfirmDialog = false;
	  taskToDelete = null;
	}
  </script>
  
  <svelte:head>
	<title>To-Do List</title>
  </svelte:head>
  
  <section class="mx-auto max-w-2xl p-4">
	<h1 class="mb-6 text-center text-2xl font-bold">To-Do List</h1>
  
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
		class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none"
		disabled={loading}
	  >
		Add Task
	  </button>
	</form>
  
	<!-- Display error message -->
	{#if errorMessage}
	  <p class="mb-4 text-sm text-red-600">{errorMessage}</p>
	{/if}
  
	<!-- Pending Tasks -->
	<h2 class="mt-4 text-xl font-semibold">Pending Tasks</h2>
	<ul class="space-y-4">
	  {#each data.todos.filter((todo) => !todo.completed) as todo (todo.task_id)}
		<li class="flex items-center justify-between rounded bg-gray-100 p-3">
		  <div class="flex items-center gap-2">
			<form method="POST" action="?/toggle" use:enhance={toggleTodo}>
			  <input type="hidden" name="id" value={todo.task_id} />
			  <input
				type="checkbox"
				checked={todo.completed}
				on:change={() => handleToggle(todo.task_id)}
				class="h-5 w-5 text-blue-500 focus:ring focus:ring-blue-300"
			  />
			</form>
			<span class={todo.completed ? 'text-gray-500 line-through' : ''}>
			  {todo.task_name}
			</span>
		  </div>
  
		  <!-- Instead of directly submitting the delete form,
			   we use a button that triggers our confirmation dialog. -->
		  <div>
			<button
			  type="button"
			  class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 focus:outline-none"
			  aria-label="Delete task"
			  on:click={() => confirmDeleteTask(todo.task_id.toString(), todo.task_name)}
			>
			  ❌
			</button>
		  </div>
		</li>
	  {/each}
	</ul>
  
	<!-- Completed Tasks -->
	<h2 class="mt-8 text-xl font-semibold">Completed Tasks</h2>
	<ul class="space-y-4">
	  {#each data.todos.filter((todo) => todo.completed) as todo (todo.task_id)}
		<li class="flex items-center justify-between rounded bg-gray-100 p-3">
		  <div class="flex items-center gap-2">
			<form method="POST" action="?/toggle" use:enhance={toggleTodo}>
			  <input type="hidden" name="id" value={todo.task_id} />
			  <input
				type="checkbox"
				checked={todo.completed}
				on:change={() => handleToggle(todo.task_id)}
				class="h-5 w-5 text-blue-500 focus:ring focus:ring-blue-300"
			  />
			</form>
			<span class="text-gray-500 line-through">
			  {todo.task_name}
			</span>
		  </div>
  
		  <!-- Here we use the normal delete form since you might choose not to confirm deletion for completed tasks.
			   Alternatively, you can apply the same confirmation dialog logic as above. -->
		  <form method="POST" action="?/delete" use:enhance={toggleTodo}>
			<input type="hidden" name="id" value={todo.task_id} />
			<button
			  type="submit"
			  class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 focus:outline-none"
			  aria-label="Delete task"
			>
			  ❌
			</button>
		  </form>
		</li>
	  {/each}
	</ul>
  
	{#if data.todos.length === 0}
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
  