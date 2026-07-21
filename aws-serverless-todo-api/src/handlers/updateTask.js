const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
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

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return error('Invalid JSON in request body', 400);
  }

  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  if (body.title !== undefined) {
    updateExpressions.push('#title = :title');
    expressionAttributeNames['#title'] = 'title';
    expressionAttributeValues[':title'] = body.title.trim();
  }

  if (body.description !== undefined) {
    updateExpressions.push('#description = :description');
    expressionAttributeNames['#description'] = 'description';
    expressionAttributeValues[':description'] = body.description.trim();
  }

  if (body.completed !== undefined) {
    updateExpressions.push('#completed = :completed');
    expressionAttributeNames['#completed'] = 'completed';
    expressionAttributeValues[':completed'] = Boolean(body.completed);
  }

  if (updateExpressions.length === 0) {
    return error('No fields provided for update', 400);
  }

  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  const updateExpression = 'SET ' + updateExpressions.join(', ');

  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId, taskId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(taskId)',
      ReturnValues: 'ALL_NEW'
    }));

    return success({
      message: 'Task updated successfully',
      task: result.Attributes
    });
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return error('Task not found or access denied', 404);
    }
    console.error('Error updating task:', err);
    return error('Failed to update task', 500);
  }
};
