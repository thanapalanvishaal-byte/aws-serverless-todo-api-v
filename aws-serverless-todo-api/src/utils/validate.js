const { error } = require('./response');

const validateUserId = (event) => {
  const headers = event.headers || {};
  const headerKey = Object.keys(headers).find((key) => key.toLowerCase() === 'x-user-id');
  const userId = headerKey ? headers[headerKey] : null;

  if (!userId) {
    return {
      valid: false,
      response: error('X-User-Id header is required for user identification', 401)
    };
  }

  return { valid: true, userId };
};

const validateTaskInput = (body) => {
  if (!body || !body.title || body.title.trim().length === 0) {
    return {
      valid: false,
      response: error('Title is required and cannot be empty', 400)
    };
  }

  return { valid: true };
};

module.exports = { validateUserId, validateTaskInput };
