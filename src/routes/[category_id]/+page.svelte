<script lang="ts">
	export let data;

	let { category, tasks } = data;
	let loading = false;
	let errorMessage: string | null = null;

	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	const addTask: SubmitFunction = () => {
		loading = true;
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				errorMessage = result.data?.error || 'An unexpected error occurred';
			}
			await update();
			loading = false;
		};
	};
</script>

<h1 class="text-2xl font-bold mb-4">Tasks for {category.category_name}</h1>

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
<ul>
	{#each tasks.filter(t => !t.completed) as task}
		<li>{task.task_name}</li>
	{/each}
</ul>

<!-- Completed Tasks -->
<h2 class="text-xl font-semibold mt-4">Completed Tasks</h2>
<ul>
	{#each tasks.filter(t => t.completed) as task}
		<li class="line-through">{task.task_name}</li>
	{/each}
</ul>
