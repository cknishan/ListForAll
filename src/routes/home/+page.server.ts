// src/routes/home/+page.server.ts

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(303, '/');
	}

	const { data: todos, error } = await supabase
		.from('task')
		.select('*')
		.eq('user_id', session.user.id);

	if (error) {
		console.error('Error fetching tasks:', error);
		return { todos: [], session };
	}

	return { session, todos };
};

export const actions: Actions = {
	add: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();

		if (!session) {
			throw redirect(303, '/');
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const content = formData.get('content')?.toString().trim();

		if (!id || !content || content.length === 0) {
			return fail(400, { error: 'Missing task ID or content' });
		}

		const { data: existingTasks, error: fetchError } = await supabase
			.from('task')
			.select('task_name')
			.eq('user_id', session.user.id);

		if (fetchError) {
			return fail(500, { error: 'Failed to check for duplicates' });
		}

		if (existingTasks?.some((task) => task.task_name.toLowerCase() === content.toLowerCase())) {
			return fail(400, { error: 'Task already exists' });
		}

		const { error } = await supabase.from('task').insert([
			{
				task_id: id,
				task_name: content,
				completed: false,
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
		if (!session) {
			throw redirect(303, '/');
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) {
			return fail(400, { error: 'Missing task ID' });
		}

		const { data: task, error: fetchError } = await supabase
			.from('task')
			.select('completed')
			.eq('task_id', id)
			.eq('user_id', session.user.id)
			.single();

		if (fetchError || !task) {
			console.error('Error fetching task:', fetchError);
			return fail(404, { error: 'Task not found or unauthorized' });
		}

		const { error: updateError } = await supabase
			.from('task')
			.update({ completed: !task.completed })
			.eq('task_id', id)
			.eq('user_id', session.user.id);

		if (updateError) {
			console.error('Error toggling task:', updateError);
			return fail(500, { error: 'Failed to toggle task' });
		}

		return { success: true };
	},

	delete: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			throw redirect(303, '/');
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) {
			return fail(400, { error: 'Missing task ID' });
		}

		const { error } = await supabase
			.from('task')
			.delete()
			.eq('task_id', id)
			.eq('user_id', session.user.id);

		if (error) {
			console.error('Error deleting task:', error);
			return fail(500, { error: 'Failed to delete task' });
		}

		return { success: true };
	}
};
