const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const details = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return res.status(statusCode).json({
            success: false,
            error: 'Validation failed',
            details,
        });
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value entered';
    }

    // Don't leak stack traces in production
    const response = {
        success: false,
        error: message,
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    console.error(`❌ [${statusCode}] ${message}`);

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
