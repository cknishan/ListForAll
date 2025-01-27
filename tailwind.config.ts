import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				"theme-primary": '#10B981',
				"theme-bg-light": '#E5E7EB',
				"theme-bg-dark": '#0F172A',
				'theme-bg-medium': '#475569'
			  },
			  fontFamily: {
				body: ['Nunito']
			  }
		}
	},

	plugins: []
} satisfies Config;
