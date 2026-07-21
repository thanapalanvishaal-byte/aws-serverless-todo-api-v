const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { success, error } = require('../utils/response');
const { validateUserId } = require('../utils/validate');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  const userValidation = validateUserId(event);
  if (!userValidation.valid) return userValidation.response;
  const { userId } = userValidation;

  const { id: taskId } = event.pathParameters;

  if (!taskId) {
    return error('Task ID is required', 400);
  }

  try {
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { userId, taskId },
      ConditionExpression: 'attribute_exists(taskId)'
    }));

    return success({
      message: 'Task deleted successfully',
      taskId
    });
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return error('Task not found or access denied', 404);
    }
    console.error('Error deleting task:', err);
    return error('Failed to delete task', 500);
  }
};
