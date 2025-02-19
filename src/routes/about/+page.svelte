<!-- src/routes/about/+page.svelte -->

<script>
	import { onMount } from 'svelte';
	import SvelteSvg from '../../components/SVG/SvelteSVG.svelte';
	import SupabaseSvg from '../../components/SVG/SupabaseSVG.svelte';
	import TailwindSvg from '../../components/SVG/TailwindSVG.svelte';

	let features = [
		{ title: 'User Authentication', description: 'Secure sign-up and login using Supabase.' },
		{
			title: 'Task Management',
			description: 'Create, edit, complete, and delete tasks in real time.'
		},
		{
			title: 'Categorization',
			description: 'Organize tasks into categories for better productivity.'
		},
		{
			title: 'Progressive Web App (PWA)',
			description: 'Installable on any device for a native-like experience.'
		},
		{
			title: 'Responsive UI',
			description: 'Optimized for both mobile and desktop using TailwindCSS.'
		}
	];

	onMount(() => {
		document.title = 'About - ListForAll';
	});
</script>

<div class="mx-auto max-w-3xl px-6 py-12 text-gray-800">
	<h1 class="mb-4 text-center text-3xl font-bold">About ListForAll</h1>
	<div
		class="flex flex-col items-center space-y-2 p-4 sm:flex-row sm:justify-between sm:space-x-4 sm:space-y-0"
	>
		<!-- Logo and Title -->
		<div class="flex items-center space-x-3">
			<img src="/logo.png" alt="ListForAll Logo" class="h-12 w-12 drop-shadow-md" />
			<h1 class="text-4xl font-extrabold tracking-wide text-theme-primary">
				List<span class="text-theme-accent">For</span>All
			</h1>
		</div>
	</div>

	<!-- Tagline -->
	<p class="text-center text-lg font-medium italic text-gray-600 sm:text-left">
		Tackle Your To-Dos, Keep It Simple
	</p>

	<!-- Description -->
	<p class="my-6 text-lg">
		ListForAll is a minimalist progressive web application designed to help general users organize
		their tasks with ease. With its focus on simplicity and accessibility, it enables users to
		create and manage categorized task lists effortlessly. As a progressive web app, ListForAll can
		be easily installed on any device, offering a streamlined and distraction-free task management
		experience. Currently in its MVP stage, ListForAll is a foundation for future improvements, with
		exciting features coming in the future.
	</p>

	<!-- Core Features -->
	<div class="rounded-lg bg-gray-100 p-6 shadow-lg">
		<h2 class="mb-4 text-2xl font-semibold">Core Features</h2>
		<ul class="space-y-4">
			{#each features as feature}
				<li class="rounded-md text-theme-primary bg-white p-4 shadow-sm">
					<h3 class="text-lg font-semibold">{feature.title}</h3>
					<p class="text-gray-600">{feature.description}</p>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Support & Feedback Section -->
	<div class="my-10 rounded-lg bg-gray-50 p-6 shadow-md">
		<h2 class="my-2 text-2xl font-semibold text-theme-primary">Have Feedback?</h2>
		<p class=" text-gray-700">
			We’d love to hear your thoughts and improve ListForAll based on your experience.
		</p>

		<div class="mt-4 flex flex-col gap-4 sm:flex-row">
			<a
				href="https://github.com/cknishan/ListForAll"
				class="rounded-lg bg-black px-5 py-2 font-medium text-white transition hover:bg-gray-800"
			>
				GitHub Repo
			</a>

			<!-- <a
				href="https://forms.google.com/feedback"
				class="bg-theme-bg-medium text-white rounded-lg px-5 py-2 font-medium transition"
			>
				✍️ Give Feedback
			</a> -->
		</div>

		<!-- Contact Info -->
		<div>
			<h2 class="my-2 text-2xl font-semibold text-theme-primary mt-6">Contact Me</h2>
			<p class=" text-gray-700">
				Email here if you need to report any bug or contact me for any queries.
			</p>
			<p
				class="bg-theme-accent hover:bg-theme-dark rounded-lg py-2 font-medium text-theme-bg-dark transition"
			>
				📧 tsangmanishan@gmail.com
			</p>
		</div>
	</div>

	<div class="mt-12 space-y-8">
		<!-- Tech Stack Section -->
		<div>
			<h2 class="border-theme-accent w-fit border-b-4 pb-2 text-3xl font-bold text-theme-primary">
				Tech Stack
			</h2>
			<div class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
				<div class="flex items-center space-x-3 rounded-lg bg-gray-100 p-4 shadow-sm">
                    <SvelteSvg />
					<span class="text-lg font-medium text-gray-800">SvelteKit - Reactive & Fast UI</span>
				</div>
				<div class="flex items-center space-x-3 rounded-lg bg-gray-100 p-4 shadow-sm">
					<SupabaseSvg />
					<span class="text-lg font-medium text-gray-800">Supabase - Auth & Database</span>
				</div>
				<div class="flex items-center space-x-3 rounded-lg bg-gray-100 p-4 shadow-sm">
					<TailwindSvg />
					<span class="text-lg font-medium text-gray-800">TailwindCSS - Sleek Styling</span>
				</div>
			</div>
		</div>
	</div>
</div>
