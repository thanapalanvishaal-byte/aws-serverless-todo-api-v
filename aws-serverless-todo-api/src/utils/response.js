const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-User-Id',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

const success = (data, statusCode = 200) => ({
  statusCode,
  headers,
  body: JSON.stringify(data)
});

const error = (message, statusCode = 500) => ({
  statusCode,
  headers,
  body: JSON.stringify({ error: message })
});

module.exports = { success, error };
