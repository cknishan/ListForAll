<!-- src/routes/todos/+page.svelte -->
<script lang="ts">
    export let data; // Loaded server data (todos)
  
    let loading = false;
  </script>
  
  <svelte:head>
    <title>To-Do List</title>
  </svelte:head>
  
  <section class="max-w-2xl mx-auto p-4">
    <h1 class="text-2xl font-bold text-center mb-6">To-Do List</h1>
  
    <!-- Add Task Form -->
    <form method="POST" action="?/add" class="flex gap-2 mb-4">
      <input
        type="text"
        name="content"
        placeholder="Add a new task"
        required
        class="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
      />
      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
        disabled={loading}
      >
        Add Task
      </button>
    </form>
  
    <!-- Task List -->
    <ul class="space-y-4">
      {#each data.todos as todo (todo.id)}
        <li class="flex items-center justify-between bg-gray-100 rounded p-3">
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
  
            <span class={todo.completed ? 'line-through text-gray-500' : ''}>
              {todo.content}
            </span>
          </div>
  
          <form method="POST" action="?/delete">
            <input type="hidden" name="id" value={todo.id} />
            <button
              type="submit"
              class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none"
              aria-label="Delete task"
            >
              ❌
            </button>
          </form>
        </li>
      {/each}
    </ul>
  
    {#if data.todos.length === 0}
      <p class="text-center text-gray-500 mt-4">No tasks yet. Add one above!</p>
    {/if}
  </section>
  