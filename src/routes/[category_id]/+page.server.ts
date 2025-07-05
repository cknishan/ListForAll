// src/routes/[category_id]/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession }, params }) => {
	const { session } = await safeGetSession();

	if (!session) {
		return fail(401, { error: 'Unauthorized' });
	}

	const { category_id } = params;

	// Ensure category exists and belongs to the logged-in user
	const { data: category, error: categoryError } = await supabase
		.from('category')
		.select('*')
		.eq('category_id', category_id)
		.eq('user_id', session.user.id)
		.single();

	if (categoryError || !category) {
		throw redirect(303, '/'); // Redirect if the category does not exist or is unauthorized
	}

	// Fetch tasks for this category
	const { data: tasks, error: tasksError } = await supabase
		.from('task')
		.select('*')
		.eq('category_id', category_id)
		.eq('user_id', session.user.id);

	if (tasksError) {
		console.error('Error fetching tasks:', tasksError);
		return { category, tasks: [], session };
	}

	return { category, tasks, session };
};

export const actions: Actions = {
	add: async ({ request, locals: { supabase, safeGetSession }, params }) => {
		const { session } = await safeGetSession();

		if (!session) {
			throw redirect(303, '/');
		}

		const { category_id } = params;

		// Ensure the category exists and belongs to the user
		const { data: category, error: categoryError } = await supabase
			.from('category')
			.select('category_id')
			.eq('category_id', category_id)
			.eq('user_id', session.user.id)
			.single();

		if (categoryError || !category) {
			throw redirect(303, '/');
		}

		const formData = await request.formData();
		const content = formData.get('content')?.toString().trim();

		if (!content || content.length === 0) {
			return fail(400, { error: 'Task content cannot be empty or whitespace only' });
		}

		// Check for duplicate tasks (case-insensitive) in this category
		const { data: existingTasks, error: fetchError } = await supabase
			.from('task')
			.select('task_name')
			.eq('category_id', category_id)
			.eq('user_id', session.user.id);

		if (fetchError) {
			return fail(500, { error: 'Failed to check for duplicates' });
		}

		if (existingTasks?.some((task) => task.task_name.toLowerCase() === content.toLowerCase())) {
			return fail(400, { error: 'Task already exists in this category' });
		}

		// Insert the new task
		const { error } = await supabase.from('task').insert([
			{
				task_name: content,
				completed: false,
				category_id: category_id,
				user_id: session.user.id
			}
		]);

		if (error) {
			console.error('Error adding task:', error);
			return fail(500, { error: 'Failed to add task' });
		}

		return { success: true };
	},

	toggle: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing ID' });

		const { data: task, error } = await supabase
			.from('task')
			.select('completed')
			.eq('task_id', id)
			.eq('user_id', session.user.id)
			.single();

		if (error || !task) return fail(404, { error: 'Task not found or unauthorized' });

		const { error: updateError } = await supabase
			.from('task')
			.update({ completed: !task.completed })
			.eq('task_id', id);

		if (updateError) return fail(500, { error: 'Toggle failed' });

		return { success: true };
	},

	delete: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();

		if (!session) {
			throw redirect(303, '/');
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		// Ensure the task belongs to the user
		const { data: task, error: fetchError } = await supabase
			.from('task')
			.select('user_id')
			.eq('task_id', id)
			.eq('user_id', session.user.id)
			.single();

		if (fetchError || !task) {
			return fail(404, { error: 'Task not found or unauthorized' });
		}

		// Delete the task
		const { error } = await supabase.from('task').delete().eq('task_id', id);

		if (error) {
			return fail(500, { error: 'Failed to delete task' });
		}

		return { success: true };
	}
};
