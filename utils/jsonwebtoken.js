require('dotenv').config();
const jwt = require('jsonwebtoken');
const { tokenResponses } = require('../responses');

const secretKey = process.env.SECRET_KEY;

const jwtUtils = {
    
    generateToken: function(payload, expiresIn = '24hr')
    {
        const options = { expiresIn };
        return jwt.sign(payload, secretKey, options);
    },

    verifyToken: function(token)
    {
        try
        {
            const { code, message } = tokenResponses.invalidToken
            if(!token) return { code, message };
            return jwt.verify(token, secretKey);
        }
        catch(err)
        {
            console.error('Token verification failed:', err.message);
            return null;
        }
    } 
}

module.exports = jwtUtils;