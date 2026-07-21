const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { success, error } = require('../utils/response');
const { validateUserId } = require('../utils/validate');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  const userValidation = validateUserId(event);
  if (!userValidation.valid) return userValidation.response;
  const { userId } = userValidation;

  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }));

    return success({
      message: 'Tasks retrieved successfully',
      count: result.Items.length,
      tasks: result.Items
    });
  } catch (err) {
    console.error('Error retrieving tasks:', err);
    return error('Failed to retrieve tasks', 500);
  }
};
