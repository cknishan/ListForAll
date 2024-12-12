<!-- src/routes/home/+page.svelte -->
<script lang="ts">
	export let data; // Loaded server data (todos)
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	let loading = false;

	const toggleTodo: SubmitFunction = () => {
		return async ({ update }) => {
			await update();
		};
	};

	function handleToggle(taskId: number) {
		const form = document.querySelector(`form input[name="id"][value="${taskId}"]`)?.closest('form') as HTMLFormElement;
		if (form) {
			form.requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>To-Do List</title>
</svelte:head>

<section class="mx-auto max-w-2xl p-4">
	<h1 class="mb-6 text-center text-2xl font-bold">To-Do List</h1>

	<!-- Add Task Form -->
	<form method="POST" action="?/add" class="mb-4 flex gap-2">
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

	<!-- Pending Tasks -->
	<h2 class="mt-4 text-xl font-semibold">Pending Tasks</h2>
	<ul class="space-y-4">
		{#each data.todos.filter(todo => !todo.completed) as todo (todo.task_id)}
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

				<form method="POST" action="?/delete">
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

	<!-- Completed Tasks -->
	<h2 class="mt-8 text-xl font-semibold">Completed Tasks</h2>
	<ul class="space-y-4">
		{#each data.todos.filter(todo => todo.completed) as todo (todo.task_id)}
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

				<form method="POST" action="?/delete">
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
</section>
