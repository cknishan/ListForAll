<!-- src/components/TodoItem.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
  
    export let todo: {
      task_id: number;
      task_name: string;
      completed: boolean;
      note: string; // Add note field
      category_id: number; // Add category_id field
      user_id: string; // Add user_id field
    };
  
    export let confirmDeleteTask: (taskId: string, taskName: string) => void;

        // Handle toggling a task from a checkbox change:
        function handleToggle(taskId: number) {
      // Find the closest form with the matching task id and submit it
      const form = document
        .querySelector(`form input[name="id"][value="${taskId}"]`)
        ?.closest('form') as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }
  </script>
  
  <li class="flex items-center justify-between rounded bg-gray-100 p-3">
    <div class="flex items-center gap-2">
      <form method="POST" action="?/toggle" class="flex align-middle" use:enhance>
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
      {#if todo.note}
        <span class="text-sm text-gray-600">({todo.note})</span>
      {/if}
    </div>
  
    <div>
      <button
        type="button"
        class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 focus:outline-none"
        aria-label="Delete task"
        on:click={() => confirmDeleteTask(todo.task_id.toString(), todo.task_name)}
      >
        x
      </button>
    </div>
  </li>
  
