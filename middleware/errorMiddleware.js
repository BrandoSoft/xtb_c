const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message;

    // Specyficzna obsługa błędu duplikatu w MongoDB
    if (err.code === 11000) {
        statusCode = 400;
        message = "Użytkownik o takiej nazwie lub e-mailu już istnieje";
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        // Ukrywamy stack trace, jeśli nie jesteśmy w trybie deweloperskim
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;