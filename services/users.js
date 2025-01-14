const User = require("../models/User");
const { userResponses, Responses } = require("../responses");
const { compareHash } = require("../utils/bcrypt");
const { generateToken } = require("../utils/jsonwebtoken");

const success = Responses.success;
const error = Responses.internalError;

exports.register = async (req) => {
    try
    {
        const {username, email, password} = req.body;

        const isUserExists = await User.exists({email});

        if(isUserExists) 
        {
            const { code, message } = userResponses.userAlreadyExists;
            return { code, message };
        } 

        const user = await new User({username, email, password}).save();
        delete user.password;

        const { code, message } = success;
        return { code, message, user };
    }
    catch(err)
    {
        const { code } = error
        console.error(err.message);
        return { code, message: err.message }
    }
}


exports.login = async (req) => {
    try
    {
        const { email, password } = req.body;

        const user = await User.findOne({email});

        if(!user) 
        {
            const { code, message } = userResponses.userNotFound;
            return { code, message };
        }

        const verifyPassword = compareHash(password, user.password);

        if(!verifyPassword)
        {
            const { code, message } = userResponses.incorrectPassword;
            return { code, message };
        }

        const token = generateToken({_id: user._id}, '1h');
        delete user.password;
        
        const { code, message} = success;
        return { code, message, user, token }
        
    }
    catch(err)
    {
        const { code } = error;
        console.error(err.message);
        return { code, message: err.message }
    }
}