/**
 * Middleware para manejo centralizado de errores
 * @param {Error} err - Error capturado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
    // Log del error para debugging
    console.error('Error captured:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Errores de base de datos MySQL
    if (err.code) {
        switch (err.code) {
            case 'ER_DUP_ENTRY': // Duplicate entry
                return res.status(409).json({
                    error: 'Resource already exists',
                    details: 'Duplicate entry detected'
                });

            case 'ER_BAD_NULL_ERROR': // Cannot be null
                return res.status(400).json({
                    error: 'Missing required field',
                    details: 'A required field is missing'
                });

            case 'ER_NO_REFERENCED_ROW_2': // Foreign key constraint
                return res.status(400).json({
                    error: 'Invalid reference',
                    details: 'Referenced resource does not exist'
                });

            case 'ER_BAD_FIELD_ERROR': // Unknown column
                return res.status(400).json({
                    error: 'Invalid field',
                    details: 'Unknown column in field list'
                });

            case 'ECONNREFUSED':
                return res.status(503).json({
                    error: 'Database connection failed',
                    details: 'Unable to connect to the database'
                });

            case 'ER_ACCESS_DENIED_ERROR':
                return res.status(503).json({
                    error: 'Database access denied',
                    details: 'Invalid database credentials'
                });

            default:
                console.error('Unhandled database error code:', err.code);
        }
    }

    // Errores de validación de Express
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: 'Invalid JSON format',
            details: 'Request body contains invalid JSON'
        });
    }

    // Errores de límite de payload
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'Payload too large',
            details: 'Request body exceeds size limit'
        });
    }

    // Error por defecto
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal server error' : message,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString(),
        path: req.url
    });
};

module.exports = errorHandler;