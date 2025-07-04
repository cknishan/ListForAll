<!-- src/components/TodoItem.svelte -->
<script lang="ts">
	import Icon from '@iconify/svelte';

	export let todo: {
		task_id: number;
		task_name: string;
		completed: boolean;
		note: string; // Add note field
		category_id: number; // Add category_id field
		user_id: string; // Add user_id field
	};

	export let confirmDeleteTask: (taskId: string, taskName: string) => void;

	export let toggleTask: (taskId: number) => void;
</script>

<li class="flex items-center justify-between rounded bg-gray-100 p-3">
	<div class="flex items-center gap-2">
		<!-- Toggle Icon -->
		<button
			class="text-blue-500 focus:outline-none"
			on:click={() => toggleTask(todo.task_id)}
			aria-label="Toggle completion"
		>
			<Icon icon={todo.completed ? 'mdi:check-circle' : 'mdi:circle-outline'} class="h-5 w-5" />
		</button>
		<span class={todo.completed ? 'text-gray-500 line-through' : ''}>
			{todo.task_name}
		</span>
		{#if todo.note}
			<span class="text-sm text-gray-600">({todo.note})</span>
		{/if}
	</div>

	<div>
		<button
			type="button"
			aria-label="Delete task"
			on:click={() => confirmDeleteTask(todo.task_id.toString(), todo.task_name)}
		>
			<Icon
				type="button"
				aria-label="Delete task"
				icon="mdi:trash-can"
				class="h-5 w-5 text-red-500"
			/>
		</button>
	</div>
</li>
