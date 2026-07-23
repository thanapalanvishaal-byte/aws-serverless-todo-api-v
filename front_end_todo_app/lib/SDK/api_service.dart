import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/todo.dart';
import '../utils/user_id_helper.dart';

/// Replace with your own deployed API base URL if you redeploy the backend.
const String _baseUrl =
    'https://dr2ep70ghd.execute-api.us-east-1.amazonaws.com/dev';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

class TodoApiService {
  Future<Map<String, String>> _headers() async {
    final userId = await getOrCreateUserId();
    return {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    };
  }

  Future<List<Todo>> listTasks() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/tasks'),
      headers: await _headers(),
    );
    _checkOk(response);
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final items = (body['tasks'] as List<dynamic>?) ?? [];
    return items
        .map((item) => Todo.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<Todo> getTask(String taskId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/tasks/$taskId'),
      headers: await _headers(),
    );
    _checkOk(response);
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    // Create/update responses wrap the task as {"task": {...}}; be tolerant
    // of a bare object too in case this endpoint differs.
    final taskJson = body['task'] as Map<String, dynamic>? ?? body;
    return Todo.fromJson(taskJson);
  }

  Future<Todo> createTask(String title, String description) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/tasks'),
      headers: await _headers(),
      body: jsonEncode({'title': title, 'description': description}),
    );
    _checkOk(response);
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    return Todo.fromJson(body['task'] as Map<String, dynamic>);
  }

  Future<Todo> updateTask(
    String taskId, {
    String? title,
    String? description,
    bool? completed,
  }) async {
    final updates = <String, dynamic>{};
    if (title != null) updates['title'] = title;
    if (description != null) updates['description'] = description;
    if (completed != null) updates['completed'] = completed;

    final response = await http.put(
      Uri.parse('$_baseUrl/tasks/$taskId'),
      headers: await _headers(),
      body: jsonEncode(updates),
    );
    _checkOk(response);
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    return Todo.fromJson(body['task'] as Map<String, dynamic>);
  }

  Future<void> deleteTask(String taskId) async {
    final response = await http.delete(
      Uri.parse('$_baseUrl/tasks/$taskId'),
      headers: await _headers(),
    );
    _checkOk(response);
  }

  void _checkOk(http.Response response) {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      String message = 'Request failed (${response.statusCode})';
      try {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        if (body['message'] != null) message = body['message'] as String;
        if (body['error'] != null) message = body['error'] as String;
      } catch (_) {
        // response body wasn't JSON; fall back to the generic message above
      }
      throw ApiException(message, response.statusCode);
    }
  }
}
