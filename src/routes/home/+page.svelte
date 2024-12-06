<!-- src/routes/todos/+page.svelte -->
<script lang="ts">
	export let data; // Loaded server data (todos)

	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let form;

	// let { session, supabase, profile } = data;
	// $: ({ session, supabase, profile } = data);

	let loading = false;
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

	<!-- Task List -->
	<ul class="space-y-4">
		{#each data.todos as todo (todo.id)}
			<li class="flex items-center justify-between rounded bg-gray-100 p-3">
				<div class="flex items-center gap-2">
					<form method="POST" action="?/toggle">
						<input type="hidden" name="id" value={todo.id} />
						<input
							type="checkbox"
							checked={todo.completed}
							on:change
							class="h-5 w-5 text-blue-500 focus:ring focus:ring-blue-300"
						/>
					</form>

					<span class={todo.completed ? 'text-gray-500 line-through' : ''}>
						{todo.content}
					</span>
				</div>

				<form method="POST" action="?/delete">
					<input type="hidden" name="id" value={todo.id} />
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
