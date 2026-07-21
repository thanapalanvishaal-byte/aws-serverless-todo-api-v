import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { api, getUserId } from './services/api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);

  const loadTasks = useCallback(async () => {
    try {
      const result = await api.listTasks();
      setTasks(result.tasks || []);
    } catch (err) {
      Alert.alert('Couldn\u2019t load tasks', err.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setUserId(await getUserId());
      await loadTasks();
      setLoading(false);
    })();
  }, [loadTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a task title.');
      return;
    }
    setSubmitting(true);
    try {
      await api.createTask(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      await loadTasks();
    } catch (err) {
      Alert.alert('Couldn\u2019t create task', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task) => {
    // Optimistic update so the checkbox feels instant
    setTasks((prev) =>
      prev.map((t) => (t.taskId === task.taskId ? { ...t, completed: !t.completed } : t))
    );
    try {
      await api.updateTask(task.taskId, { completed: !task.completed });
    } catch (err) {
      Alert.alert('Couldn\u2019t update task', err.message);
      await loadTasks(); // revert to server truth on failure
    }
  };

  const handleDelete = (task) => {
    Alert.alert('Delete task?', `"${task.title}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setTasks((prev) => prev.filter((t) => t.taskId !== task.taskId));
          try {
            await api.deleteTask(task.taskId);
          } catch (err) {
            Alert.alert('Couldn\u2019t delete task', err.message);
            await loadTasks();
          }
        },
      },
    ]);
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskRow}>
      <Pressable
        style={[styles.checkbox, item.completed && styles.checkboxChecked]}
        onPress={() => handleToggleComplete(item)}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>

      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskTitle, item.completed && styles.taskTitleDone]}>
          {item.title}
        </Text>
        {!!item.description && <Text style={styles.taskDescription}>{item.description}</Text>}
      </View>

      <Pressable onPress={() => handleDelete(item)} hitSlop={10}>
        <Text style={styles.deleteIcon}>🗑</Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        {userId && <Text style={styles.headerSubtitle}>Device: {userId.slice(0, 8)}…</Text>}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.taskId}
          renderItem={renderTask}
          contentContainerStyle={tasks.length === 0 && styles.emptyListContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tasks yet — add one below to get started.</Text>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
          <Pressable
            style={[styles.addButton, submitting && styles.addButtonDisabled]}
            onPress={handleCreate}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Add Task</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  flex: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#4F46E5',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '700' },
  headerSubtitle: { color: '#E0E7FF', fontSize: 12, marginTop: 4 },
  emptyListContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 15, paddingHorizontal: 30, textAlign: 'center' },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: { backgroundColor: '#4F46E5' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  taskTextContainer: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  taskDescription: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  deleteIcon: { fontSize: 18, marginLeft: 8 },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonDisabled: { opacity: 0.6 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
