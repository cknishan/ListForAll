// src/routes/home/+page.server.ts

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession();

  if (!session) {
    throw redirect(303, '/');
  }

  // Fetch tasks from Supabase
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
    const content = formData.get('content') as string;
    console.log(formData);

    if (!content) {
      return fail(400, { error: 'Task content cannot be empty' });
    }

    const { error } = await supabase
      .from('task')
      .insert([{ task_name: content, completed: false, user_id: session.user.id }]);

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
    const id = Number(formData.get('id'));
    console.log(formData);

    // Fetch the current state of the task
    const { data: todo, error: fetchError } = await supabase
      .from('task')
      .select('completed')
      .eq('task_id', id)
      .single();

    if (fetchError || !todo) {
      console.error('Error fetching task:', fetchError);
      return fail(404, { error: 'Task not found' });
    }

    const { error: updateError } = await supabase
      .from('task')
      .update({ completed: !todo.completed })
      .eq('task_id', id);

    if (updateError) {
      console.error('Error toggling task:', updateError);
      return fail(500, { error: 'Failed to toggle task' });
    }

    console.log(formData);
    return { success: true };
  },

  delete: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) {
      throw redirect(303, '/');
    }

    const formData = await request.formData();
    console.log(formData);
    const id = Number(formData.get('id'));

    const { error } = await supabase
      .from('task')
      .delete()
      .eq('task_id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return fail(500, { error: 'Failed to delete task' });
    }

    return { success: true };
  },
};
