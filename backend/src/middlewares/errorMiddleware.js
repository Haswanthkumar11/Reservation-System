const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

// Centralized error handler - every controller/service throws ApiError and
// lets this middleware format the response consistently.
function errorHandler(err, req, res, next) {
  let { statusCode, message } = err;

  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? field : 'Field'} already exists`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier format';
  }

  if (!statusCode) statusCode = 500;
  if (!message) message = 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err instanceof ApiError && err.details ? { details: err.details } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };
