import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession }, params }) => {
	const { session } = await safeGetSession();

	// Redirect if no session (user not logged in)
	if (!session) {
		throw redirect(303, '/');
	}

	const { category_id } = params;

	// Fetch the category and ensure it belongs to the logged-in user
	const { data: category, error: categoryError } = await supabase
		.from('category')
		.select('*')
		.eq('category_id', category_id)
		.eq('user_id', session.user.id) // Ensure category belongs to user
		.single();

	if (categoryError || !category) {
		console.error('Unauthorized access to category or category not found');
		throw redirect(303, '/'); // Redirect if unauthorized or not found
	}

	// Fetch tasks for this specific category and user
	const { data: tasks, error: tasksError } = await supabase
		.from('task')
		.select('*')
		.eq('category_id', category_id)
		.eq('user_id', session.user.id); // Ensure tasks belong to the logged-in user

	if (tasksError) {
		return fail(500, { error: 'Failed to fetch tasks' });
	}

	return { category, tasks };
};

export const actions: Actions = {
	add: async ({ request, locals: { supabase, safeGetSession }, params }) => {
		const { session } = await safeGetSession();

		// Redirect if no session
		if (!session) {
			throw redirect(303, '/');
		}

		const { category_id } = params;

		// Check if the category exists and belongs to the user
		const { data: category, error: categoryError } = await supabase
			.from('category')
			.select('category_id')
			.eq('category_id', category_id)
			.eq('user_id', session.user.id)
			.single();

		if (categoryError || !category) {
			console.error('Unauthorized access to category');
			throw redirect(303, '/');
		}

		// Add a new task
		const formData = await request.formData();
		const content = formData.get('content')?.toString().trim();

		if (!content || content.length === 0) {
			return fail(400, { error: 'Task content cannot be empty or whitespace only' });
		}

		// Check for duplicate tasks in this category
		const { data: existingTasks, error: fetchError } = await supabase
			.from('task')
			.select('task_name')
			.eq('category_id', category_id)
			.eq('user_id', session.user.id);

		if (fetchError) {
			return fail(500, { error: 'Failed to check for duplicates' });
		}

		if (existingTasks?.some(task => task.task_name.toLowerCase() === content.toLowerCase())) {
			return fail(400, { error: 'Task already exists in this category' });
		}

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
		// Reuse toggle logic but ensure tasks belong to the user
		const { session } = await safeGetSession();
		if (!session) throw redirect(303, '/');

		const formData = await request.formData();
		const id = Number(formData.get('id'));

		// Fetch the task and ensure it belongs to the user
		const { data: task, error: fetchError } = await supabase
			.from('task')
			.select('completed, user_id')
			.eq('task_id', id)
			.eq('user_id', session.user.id)
			.single();

		if (fetchError || !task) {
			return fail(404, { error: 'Task not found or unauthorized' });
		}

		const { error: updateError } = await supabase
			.from('task')
			.update({ completed: !task.completed })
			.eq('task_id', id);

		if (updateError) {
			return fail(500, { error: 'Failed to toggle task' });
		}

		return { success: true };
	},

	delete: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) throw redirect(303, '/');

		const formData = await request.formData();
		const id = Number(formData.get('id'));

		// Ensure task belongs to the user
		const { data: task, error: fetchError } = await supabase
			.from('task')
			.select('user_id')
			.eq('task_id', id)
			.eq('user_id', session.user.id)
			.single();

		if (fetchError || !task) {
			return fail(404, { error: 'Task not found or unauthorized' });
		}

		const { error } = await supabase.from('task').delete().eq('task_id', id);

		if (error) {
			return fail(500, { error: 'Failed to delete task' });
		}

		return { success: true };
	}
};
