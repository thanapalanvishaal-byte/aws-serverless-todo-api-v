import 'package:flutter/material.dart';
import '../models/todo.dart';
import '../themes/app_theme.dart';

class TaskTile extends StatelessWidget {
  final Todo todo;
  final VoidCallback onToggle;
  final VoidCallback onDelete;

  const TaskTile({
    super.key,
    required this.todo,
    required this.onToggle,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          _RoundedCheckbox(checked: todo.completed, onTap: onToggle),
          const SizedBox(width: 18),
          Expanded(
            child: Text(
              todo.title,
              style: AppTextStyles.textBold(
                color: todo.completed ? AppColors.white80 : AppColors.white,
              ).copyWith(
                decoration:
                    todo.completed ? TextDecoration.lineThrough : null,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete, color: AppColors.pickleGreen),
            onPressed: onDelete,
          ),
        ],
      ),
    );
  }
}

/// Rounded-square checkbox: red outline when incomplete (matches the design
/// exactly — all task rows in the mockup show this state), filled pickle-green
/// with a checkmark when complete.
class _RoundedCheckbox extends StatelessWidget {
  final bool checked;
  final VoidCallback onTap;

  const _RoundedCheckbox({required this.checked, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 26,
        height: 26,
        decoration: BoxDecoration(
          color: checked ? AppColors.pickleGreen : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: checked ? AppColors.pickleGreen : AppColors.red,
            width: 2,
          ),
        ),
        child: checked
            ? const Icon(Icons.check, size: 18, color: Colors.black)
            : null,
      ),
    );
  }
}
