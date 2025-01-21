<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms'
	import type { ActionData, SubmitFunction } from './$types.js'

	export let form: ActionData;

	let loading = false

	const handleSubmit: SubmitFunction = () => {
		loading = true
		return async ({ update }) => {
			update()
			loading = false
		}
	}
</script>

<svelte:head>
	<title>User Management</title>
</svelte:head>

<form class="" method="POST" use:enhance={handleSubmit}>
	<div >
		<h1>List For All</h1>
		<p>Sign in via magic link with your email below</p>
		{#if form?.message !== undefined}
		<div class="success {form?.success ? '' : 'fail'}">
			{form?.message}
		</div>
		{/if}
		<div>
			<label for="email">Email address</label>
			<input
				id="email"
				name="email"
				class="inputField"
				type="email"
				placeholder="Your email"
				value={form?.email ?? ''}
			/>
		</div>
		<div>
			<button class="button primary block">
				{ loading ? 'Loading' : 'Send magic link' }
			</button>
			{#if form?.errors?.email}
			<span class="flex items-center text-sm error">
				{form?.errors?.email}
			</span>
			{/if}
		</div>
	</div>
</form>