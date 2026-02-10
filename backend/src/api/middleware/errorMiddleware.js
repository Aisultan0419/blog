const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);

    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err.message === 'User already exists') {
        statusCode = 409;
        message = err.message;
    } else if (err.message === 'Invalid credentials') {
        statusCode = 401;
        message = err.message;
    } else if (err.message === 'User not found' || err.message === 'Blog post not found') {
        statusCode = 404;
        message = err.message;
    } else if (err.message === 'Authentication required') {
        statusCode = 401;
        message = err.message;
    } else if (err.message === 'Invalid token') {
        statusCode = 401;
        message = err.message;
    } else if (err.message.includes('validation')) {
        statusCode = 400;
        message = err.message;
    }

    res.status(statusCode).json({
        error: message
    });
};

module.exports = errorMiddleware;
