const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
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
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId, taskId }
    }));

    if (!result.Item) {
      return error('Task not found or access denied', 404);
    }

    return success({
      message: 'Task retrieved successfully',
      task: result.Item
    });
  } catch (err) {
    console.error('Error retrieving task:', err);
    return error('Failed to retrieve task', 500);
  }
};
