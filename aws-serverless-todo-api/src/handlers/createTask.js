const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../utils/response');
const { validateUserId, validateTaskInput } = require('../utils/validate');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  const userValidation = validateUserId(event);
  if (!userValidation.valid) return userValidation.response;
  const { userId } = userValidation;

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return error('Invalid JSON in request body', 400);
  }

  const inputValidation = validateTaskInput(body);
  if (!inputValidation.valid) return inputValidation.response;

  const taskId = uuidv4();
  const timestamp = new Date().toISOString();

  const task = {
    userId,
    taskId,
    title: body.title.trim(),
    description: body.description?.trim() || '',
    completed: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  try {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: task,
      ConditionExpression: 'attribute_not_exists(taskId)'
    }));

    return success({ message: 'Task created successfully', task }, 201);
  } catch (err) {
    console.error('Error creating task:', err);
    return error('Failed to create task', 500);
  }
};
