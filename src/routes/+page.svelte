<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, SubmitFunction } from './$types.js';

	export let form: ActionData;

	let loading = false;

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			update();
			loading = false;
		};
	};
</script>

<svelte:head>
	<title>User Management</title>
</svelte:head>

<div class="flex h-screen items-center justify-center bg-theme-bg-light px-4 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
		<div class="flex items-center justify-center space-x-2">
			<img src="/logo.png" alt="Logo" class="h-10 w-10" />
			<h1 class="text-3xl font-bold text-gray-900 border-b-4">ListForAll</h1>
		</div>
		<p class="text-center text-gray-500 italic">Tackle Your To-Dos, Keep It Simple.</p>
		<p class="text-center text-gray-600">Sign in via magic link with your email below</p>
		<form class="space-y-6" method="POST" use:enhance={handleSubmit}>
			{#if form?.message !== undefined}
				<div
					class="rounded-md p-3 text-center font-medium text-white {form?.success
						? 'bg-theme-primary'
						: 'bg-red-500'}"
				>
					{form?.message}
				</div>
			{/if}

			<div>
				<label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
				<input
					id="email"
					name="email"
					type="email"
					placeholder="Your email"
					value={form?.email ?? ''}
					class="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm"
				/>
				{#if form?.errors?.email}
					<span class="mt-2 text-sm text-red-600">{form?.errors?.email}</span>
				{/if}
			</div>

			<div>
				<button
					type="submit"
					class="flex w-full justify-center rounded-md border border-transparent bg-theme-primary px-4 py-2 text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2"
				>
					{loading ? 'Loading...' : 'Send magic link'}
				</button>
			</div>
		</form>
	</div>
</div>
