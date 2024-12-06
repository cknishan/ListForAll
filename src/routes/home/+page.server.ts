// src/routes/todos/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

interface Todo {
  id: number;
  content: string;
  completed: boolean;
}

// Simulated database
let todos: Todo[] = [];

export const load: PageServerLoad = () => {
  return { todos };
};

export const actions: Actions = {
  add: async ({ request }) => {
    const formData = await request.formData();
    const content = formData.get('content') as string;

    if (!content) {
      return fail(400, { error: 'Task content cannot be empty' });
    }

    todos.push({
      id: Date.now(),
      content,
      completed: false,
    });

    return { success: true };
  },
  toggle: async ({ request }) => {
    const formData = await request.formData();
    const id = Number(formData.get('id'));

    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );

    return { success: true };
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = Number(formData.get('id'));

    todos = todos.filter((todo) => todo.id !== id);

    return { success: true };
  },
};
