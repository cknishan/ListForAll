<!-- src/routes/home/+page.svelte -->
<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import TodoItem from '../../components/TodoItem.svelte';
	import ConfirmationDialog from '../../components/ConfirmationDialog.svelte';
	import uuid4 from 'uuid4';

	export let data;

	let todos = [...data.todos];
	let loading = false;
	let errorMessage: string | null = null;
	let newTaskContent = '';
	let taskToDelete: string | null = null;
	let showConfirmDialog = false;
	let confirmMessage = '';

	function confirmDeleteTask(taskId: string, taskName: string) {
		taskToDelete = taskId;
		confirmMessage = `Are you sure you want to delete "${taskName}"? This cannot be undone.`;
		showConfirmDialog = true;
	}

	async function toggleTask(taskId: string) {
		errorMessage = null;

		todos = todos.map((task) =>
			task.task_id === taskId ? { ...task, completed: !task.completed } : task
		);

		const formData = new FormData();
		formData.set('id', taskId);

		const res = await fetch('?/toggle', {
			method: 'POST',
			body: formData
		});

		if (!res.ok) {
			todos = todos.map((task) =>
				task.task_id === taskId ? { ...task, completed: !task.completed } : task
			);
			const errorData = await res.json();
			errorMessage = errorData.error || 'Failed to toggle task';
		}
	}

	async function handleConfirmDelete() {
		if (!taskToDelete) return;
		const backup = todos.find((t) => t.task_id === taskToDelete);
		todos = todos.filter((t) => t.task_id !== taskToDelete);

		const formData = new FormData();
		formData.set('id', taskToDelete);

		const res = await fetch('?/delete', {
			method: 'POST',
			body: formData
		});

		if (!res.ok && backup) {
			todos = [backup, ...todos];
			const errorData = await res.json();
			errorMessage = errorData.error || 'Failed to delete task';
		}

		taskToDelete = null;
		showConfirmDialog = false;
	}

	async function handleAddTask(event: Event) {
		event.preventDefault();
		if (!newTaskContent.trim()) return;

		errorMessage = null;
		loading = true;

		const id = uuid4();
		const optimisticTask = {
			task_id: id,
			task_name: newTaskContent,
			completed: false,
			user_id: data.session.user.id
		};

		todos = [...todos, optimisticTask];

		const formData = new FormData();
		formData.set('id', id);
		formData.set('content', newTaskContent);

		const res = await fetch('?/add', {
			method: 'POST',
			body: formData
		});

		if (!res.ok) {
			todos = todos.filter((t) => t.task_id !== id);
			const errorData = await res.json();
			errorMessage = errorData.error || 'Failed to add task';
		}

		newTaskContent = '';
		loading = false;
	}
</script>

<svelte:head>
	<title>To-Do List</title>
</svelte:head>

<section class="mx-auto max-w-2xl p-4">
	<h1 class="mb-6 text-center text-2xl font-bold text-theme-bg-dark">All Tasks</h1>

	<form on:submit={handleAddTask} class="relative mb-4 flex gap-2">
		<input
			type="text"
			name="content"
			bind:value={newTaskContent}
			placeholder="Add a new task"
			required
			class="flex-grow rounded border border-gray-300 px-3 py-2"
		/>
		<button
			type="submit"
			class="rounded bg-theme-primary px-4 py-2 font-bold text-theme-bg-dark"
			disabled={loading}
		>
			{#if loading}
				<svg class="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
						fill="none"
					/>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
				</svg>
			{:else}
				<Plus class="h-5 w-5 text-white" />
			{/if}
		</button>
	</form>

	{#if errorMessage}
		<p class="mb-4 text-sm text-red-600">{errorMessage}</p>
	{/if}

	<h2 class="text-xl font-semibold">Pending Tasks</h2>
	<ul class="space-y-4">
		{#each todos.filter((t) => !t.completed) as task (task.task_id)}
			<TodoItem todo={task} {confirmDeleteTask} toggleTask={() => toggleTask(task.task_id)} />
		{/each}
	</ul>

	<h2 class="mt-4 text-xl font-semibold">Completed Tasks</h2>
	<ul class="space-y-4">
		{#each todos.filter((t) => t.completed) as task (task.task_id)}
			<TodoItem todo={task} {confirmDeleteTask} toggleTask={() => toggleTask(task.task_id)} />
		{/each}
	</ul>

	{#if todos.length === 0}
		<p class="mt-4 text-center text-gray-500">No tasks yet. Add one above!</p>
	{/if}

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
