// src/routes/[category_id]/+page.server.ts

import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'


export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession }, params }) => {
  	const { session } = await safeGetSession()

    const { category_id } = params;

	const { data: category, error: categoryError } = await supabase
		.from('category')
		.select('*')
		.eq('category_id', category_id)
		.single();

	if (categoryError) {
		throw new Error('Category not found');
	}

	const { data: tasks, error: tasksError } = await supabase
		.from('task')
		.select('*')
		.eq('category_id', category_id);

	if (tasksError) {
		throw new Error('Tasks not found for this category');
	}

	return { category, tasks };
}
