import 'package:flutter/foundation.dart';
import '../SDK/api_service.dart';
import '../models/todo.dart';

enum LoadState { idle, loading, error }

class TodoProvider extends ChangeNotifier {
  final TodoApiService _api = TodoApiService();

  List<Todo> _todos = [];
  LoadState _state = LoadState.idle;
  String? _errorMessage;

  List<Todo> get todos => _todos;
  LoadState get state => _state;
  String? get errorMessage => _errorMessage;

  int get completedCount => _todos.where((t) => t.completed).length;

  Future<void> loadTodos() async {
    _state = LoadState.loading;
    notifyListeners();
    try {
      _todos = await _api.listTasks();
      _state = LoadState.idle;
      _errorMessage = null;
    } catch (e) {
      _state = LoadState.error;
      _errorMessage = e.toString();
    }
    notifyListeners();
  }

  Future<void> addTodo(String title, String description) async {
    final created = await _api.createTask(title, description);
    _todos = [created, ..._todos];
    notifyListeners();
  }

  Future<void> toggleComplete(Todo todo) async {
    final index = _todos.indexWhere((t) => t.taskId == todo.taskId);
    if (index == -1) return;

    // Optimistic update so the UI feels instant.
    final optimistic = todo.copyWith(completed: !todo.completed);
    _todos[index] = optimistic;
    notifyListeners();

    try {
      final updated = await _api.updateTask(
        todo.taskId,
        completed: optimistic.completed,
      );
      _todos[index] = updated;
      notifyListeners();
    } catch (e) {
      _todos[index] = todo; // revert on failure
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<void> deleteTodo(String taskId) async {
    final previous = _todos;
    _todos = _todos.where((t) => t.taskId != taskId).toList();
    notifyListeners();

    try {
      await _api.deleteTask(taskId);
    } catch (e) {
      _todos = previous; // revert on failure
      _errorMessage = e.toString();
      notifyListeners();
    }
  }
}
