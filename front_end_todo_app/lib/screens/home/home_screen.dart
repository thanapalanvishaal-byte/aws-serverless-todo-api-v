import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/todo_provider.dart';
import '../../themes/app_theme.dart';
import '../../widgets/task_tile.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _newTaskController = TextEditingController();
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TodoProvider>().loadTodos();
    });
  }

  @override
  void dispose() {
    _newTaskController.dispose();
    super.dispose();
  }

  Future<void> _handleAdd() async {
  final title = _newTaskController.text.trim();
  if (title.isEmpty || _submitting) return;

  setState(() => _submitting = true);
  try {
    await context.read<TodoProvider>().addTodo(title, '');
    if (!mounted) return;
    _newTaskController.clear();
    FocusScope.of(context).unfocus();
  } catch (e) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Couldn\'t create task: $e')),
    );
  } finally {
    if (mounted) setState(() => _submitting = false);
  }
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 24),
              Center(
                child: Text(
                  'My silly little tasks',
                  style: AppTextStyles.heading1(),
                ),
              ),
              const SizedBox(height: 48),

              // Inline "add new task" row — green underline, red + button.
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Expanded(
                    child: TextField(
                      controller: _newTaskController,
                      style: AppTextStyles.body(color: AppColors.white),
                      cursorColor: AppColors.pickleGreen,
                      onSubmitted: (_) => _handleAdd(),
                      decoration: InputDecoration(
                        hintText: 'add new task',
                        hintStyle: AppTextStyles.body(color: AppColors.white),
                        isDense: true,
                        border: const UnderlineInputBorder(
                          borderSide:
                              BorderSide(color: AppColors.pickleGreen, width: 2),
                        ),
                        enabledBorder: const UnderlineInputBorder(
                          borderSide:
                              BorderSide(color: AppColors.pickleGreen, width: 2),
                        ),
                        focusedBorder: const UnderlineInputBorder(
                          borderSide:
                              BorderSide(color: AppColors.pickleGreen, width: 2),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  IconButton(
                    icon: _submitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.red,
                            ),
                          )
                        : const Icon(Icons.add, color: AppColors.red, size: 30),
                    onPressed: _handleAdd,
                  ),
                ],
              ),

              const SizedBox(height: 40),
              Center(
                child: Text(
                  'task list',
                  style: AppTextStyles.textBold(color: AppColors.red),
                ),
              ),
              const SizedBox(height: 12),

              Expanded(
                child: Consumer<TodoProvider>(
                  builder: (context, provider, _) {
                    if (provider.state == LoadState.loading &&
                        provider.todos.isEmpty) {
                      return const Center(
                        child: CircularProgressIndicator(
                          color: AppColors.pickleGreen,
                        ),
                      );
                    }

                    if (provider.state == LoadState.error &&
                        provider.todos.isEmpty) {
                      return Center(
                        child: Text(
                          'Couldn\'t load tasks: ${provider.errorMessage}',
                          style: AppTextStyles.body(),
                          textAlign: TextAlign.center,
                        ),
                      );
                    }

                    // Matches the empty-state design exactly: just the
                    // title/input/label above, nothing else here.
                    if (provider.todos.isEmpty) {
                      return const SizedBox.shrink();
                    }

                    return RefreshIndicator(
                      color: AppColors.pickleGreen,
                      backgroundColor: AppColors.surface,
                      onRefresh: () => provider.loadTodos(),
                      child: ListView.builder(
                        itemCount: provider.todos.length,
                        itemBuilder: (context, index) {
                          final todo = provider.todos[index];
                          return TaskTile(
                            todo: todo,
                            onToggle: () => provider.toggleComplete(todo),
                            onDelete: () => provider.deleteTodo(todo.taskId),
                          );
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
