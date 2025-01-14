const { login, register } = require("../services/users");

exports.registerController = async (req, res, next) => {
    try
    {
        const response = await register(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err)
    }
};


exports.loginController = async (req, res, next) => {
    try
    {
        const response = await login(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err)
    }
};