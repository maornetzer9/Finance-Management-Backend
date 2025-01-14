const { sessionResponses, Responses } = require("../responses");
const { verifyToken } = require("../utils/jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try 
    {
        const token = req.headers.authorization?.split(" ")[1]; 

        if (!token) 
        {
            const { code, message } = sessionResponses.sessionExpired;
            return res.status(code).json(message); 
        }

        const verify = await verifyToken(token);

        
        if (!verify) 
        {
            const { code, message } = sessionResponses.sessionExpired;
            return res.status(code).json({ message: message, redirectTo: "/login" });
        }
        req.user = verify;  
        next();  
    } 
    catch(err) 
    {
        const { code, message } = Responses.internalError;
        console.error(err.message);
        return res.status(code).json(message);  
    }
};

module.exports = authMiddleware;