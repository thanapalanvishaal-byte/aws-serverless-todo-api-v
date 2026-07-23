import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

const _userIdKey = 'dil_pickle_todo_user_id';

/// Returns this device's persistent user id, generating and storing one
/// on first launch. Every task created by this app is scoped to this id,
/// matching the backend's per-user isolation (userId + taskId composite key).
Future<String> getOrCreateUserId() async {
  final prefs = await SharedPreferences.getInstance();
  var userId = prefs.getString(_userIdKey);
  if (userId == null) {
    userId = const Uuid().v4();
    await prefs.setString(_userIdKey, userId);
  }
  return userId;
}
