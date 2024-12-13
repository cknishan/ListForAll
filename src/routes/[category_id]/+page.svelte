<!-- src/routes/[category_id]/+page.svelte -->

<script lang="ts">
	export let data; // Loaded server data 

    let { session, supabase, category, tasks} = data
	$: ({ session, supabase, category, tasks } = data)

</script>

<h1 class="text-2xl font-bold">Tasks for Category {category.category_name}</h1>

<!-- Task List -->
<ul class="mt-4">
	{#each tasks as task}
		<li class="py-2 px-4 bg-white shadow mb-2 rounded">
			{task.task_name}
		</li>
	{/each}
</ul>
