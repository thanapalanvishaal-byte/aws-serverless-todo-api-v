class Todo {
  final String taskId;
  final String userId;
  final String title;
  final String description;
  final bool completed;
  final String createdAt;
  final String updatedAt;

  Todo({
    required this.taskId,
    required this.userId,
    required this.title,
    required this.description,
    required this.completed,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Todo.fromJson(Map<String, dynamic> json) {
    return Todo(
      taskId: json['taskId'] as String,
      userId: json['userId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      completed: json['completed'] as bool? ?? false,
      createdAt: json['createdAt'] as String? ?? '',
      updatedAt: json['updatedAt'] as String? ?? '',
    );
  }

  Todo copyWith({String? title, String? description, bool? completed}) {
    return Todo(
      taskId: taskId,
      userId: userId,
      title: title ?? this.title,
      description: description ?? this.description,
      completed: completed ?? this.completed,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
