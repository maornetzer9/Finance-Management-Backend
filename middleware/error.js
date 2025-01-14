const errorMiddleware = (err, req, res, next) => {
    console.error(err.message);  
    return res.status(500).json({ 
        code: err.code || 'UNKNOWN_ERROR', 
        message: err.message || 'Something went wrong!' 
    });
}

module.exports = { errorMiddleware };