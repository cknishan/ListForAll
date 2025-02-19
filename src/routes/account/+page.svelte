<!-- src/routes/account/+page.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';

    export let data
    export let form

    let { session, supabase, profile } = data
    $: ({ session, supabase, profile } = data)

    let profileForm: HTMLFormElement
    let loading = false
    let fullName: string = profile?.full_name ?? ''
    let username: string = profile?.username ?? ''

    const handleSubmit: SubmitFunction = () => {
        loading = true
        return async () => {
            loading = false
        }
    }

    const handleSignOut: SubmitFunction = () => {
        loading = true
        return async ({ update }) => {
            loading = false
            update()
        }
    }
</script>

<div class="max-w-xl mx-auto my-8 p-6 bg-white rounded-lg shadow-lg">
    <!-- Profile Form -->
    <form
        class="space-y-6"
        method="post"
        action="?/update"
        use:enhance={handleSubmit}
        bind:this={profileForm}
    >
        <div>
            <label for="email" class="block text-theme-bg-medium font-semibold text-sm">Email</label>
            <input
                id="email"
                type="text"
                value={session.user.email}
                disabled
                class="mt-1 w-full px-4 py-2 border border-theme-bg-light rounded-md bg-theme-bg-light text-theme-bg-dark focus:border-theme-primary focus:ring-2 focus:ring-theme-primary disabled:bg-gray-200 disabled:text-gray-500"
            />
        </div>

        <div>
            <label for="fullName" class="block text-theme-bg-medium font-semibold text-sm">Full Name</label>
            <input
                id="fullName"
                name="fullName"
                type="text"
                value={form?.fullName ?? fullName}
                class="mt-1 w-full px-4 py-2 border border-theme-bg-light rounded-md bg-theme-bg-light text-theme-bg-dark focus:border-theme-primary focus:ring-2 focus:ring-theme-primary"
            />
        </div>

        <div>
            <label for="username" class="block text-theme-bg-medium font-semibold text-sm">Username</label>
            <input
                id="username"
                name="username"
                type="text"
                value={form?.username ?? username}
                class="mt-1 w-full px-4 py-2 border border-theme-bg-light rounded-md bg-theme-bg-light text-theme-bg-dark focus:border-theme-primary focus:ring-2 focus:ring-theme-primary"
            />
        </div>

        <div>
            <input
                type="submit"
                class="w-full px-4 py-2 bg-theme-primary text-white rounded-md font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-theme-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                value={loading ? 'Loading...' : 'Update'}
                disabled={loading}
            />
        </div>
    </form>

    <!-- Sign-out Button -->
    <form method="post" action="?/signout" use:enhance={handleSignOut} class="mt-6">
        <div>
            <button
                class="w-full px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
            >
                Sign Out
            </button>
        </div>
    </form>
</div>
