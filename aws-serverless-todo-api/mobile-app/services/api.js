import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Replace this with your own deployed API base URL (no trailing slash).
// This is the one from the AWS SAM stack you deployed:
const BASE_URL = 'https://dr2ep70ghd.execute-api.us-east-1.amazonaws.com/dev';

const USER_ID_KEY = 'todo_app_user_id';

/**
 * Generates a simple RFC-4122-ish v4 UUID without needing a native crypto
 * module (React Native's JS engine doesn't have crypto.randomUUID built in
 * the way browsers do).
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns this device's persistent user id, generating and storing one
 * on first launch. Every task created by this app is scoped to this id.
 */
export async function getUserId() {
  let userId = await AsyncStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = generateUUID();
    await AsyncStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

async function request(path, options = {}) {
  const userId = await getUserId();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = (data && data.error) || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  listTasks: () => request('/tasks', { method: 'GET' }),

  getTask: (taskId) => request(`/tasks/${taskId}`, { method: 'GET' }),

  createTask: (title, description = '') =>
    request('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    }),

  updateTask: (taskId, updates) =>
    request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteTask: (taskId) => request(`/tasks/${taskId}`, { method: 'DELETE' }),
};
