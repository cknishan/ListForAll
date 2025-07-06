<!-- src/routes/[category_id]/+page.svelte -->
<script lang="ts">
	import ConfirmationDialog from '../../components/ConfirmationDialog.svelte';
	import TodoItem from '../../components/TodoItem.svelte';
	import { Plus } from 'lucide-svelte';
	import uuid4 from "uuid4";

	export let data;
	
	let loading = false;
	let errorMessage: string | null = null;
	let showConfirmDialog = false;
	let confirmMessage = '';
	let taskToDelete: string | null = null;
	let newTaskContent = '';
	
	let todos:any = [];
	$: if (data) {
	todos = [...data.tasks];
	loading = false;
	errorMessage = null;
}
	function confirmDeleteTask(taskId: string, taskName: string) {
		taskToDelete = taskId;
		confirmMessage = `Are you sure you want to delete the task "${taskName}"? This action cannot be undone.`;
		showConfirmDialog = true;
	}

	async function toggleTask(taskId: string) {
		errorMessage = null;
		todos = todos.map((task:any) =>
			task.task_id === taskId ? { ...task, completed: !task.completed } : task
		);

		const formData = new FormData();
		formData.set('id', taskId);

		const res = await fetch('?/toggle', {
			method: 'POST',
			body: formData
		});

		if (!res.ok) {
			todos = todos.map((task:any) =>
				task.task_id === taskId ? { ...task, completed: !task.completed } : task
			);
			const errorData = await res.json();
			errorMessage = errorData.error || 'Failed to toggle task';
		}
	}

	async function handleConfirmDelete() {
		if (!taskToDelete) return;
		loading = true;

		const backup = todos.find((t:any) => t.task_id === taskToDelete);
		todos = todos.filter((t:any) => t.task_id !== taskToDelete); // optimistic delete

		const formData = new FormData();
		formData.set('id', taskToDelete);

		const res = await fetch('?/delete', {
			method: 'POST',
			body: formData
		});

		if (!res.ok && backup) {
			todos = [backup, ...todos]; // rollback
			const errorData = await res.json();
			errorMessage = errorData.error || 'Failed to delete task';
		}

		loading = false;
		showConfirmDialog = false;
		taskToDelete = null;
	}

	async function handleAddTask(event: Event) {
		event.preventDefault();
		if (!newTaskContent.trim()) return;
		errorMessage = null;
		loading = true;

		const taskId = uuid4();
		const optimisticTask = {
			task_id: taskId,
			task_name: newTaskContent,
			completed: false,
			note: '',
			category_id: data.category.category_id,
			user_id: data.session.user.id
		};
		todos = [...todos, optimisticTask];

		const formData = new FormData();
		formData.set('id', taskId);
		formData.set('content', newTaskContent);

		const res = await fetch('?/add', {
			method: 'POST',
			body: formData
		});

		if (!res.ok) {
			todos = todos.filter((t:any) => t.task_id !== taskId);
			const errorData = await res.json();
			errorMessage = errorData.error || 'Failed to add task';
		}

		newTaskContent = '';
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

	<form on:submit={handleAddTask} class="mb-4 flex gap-2">
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
		{#each todos.filter((task:any) => !task.completed) as task (task.task_id)}
			<TodoItem todo={task} {confirmDeleteTask} toggleTask={() => toggleTask(task.task_id)} />
		{/each}
	</ul>

	<h2 class="mt-4 text-xl font-semibold">Completed Tasks</h2>
	<ul class="space-y-4">
		{#each todos.filter((task:any) => task.completed) as task (task.task_id)}
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
