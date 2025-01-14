exports.newInvestmentController = async (req, res, next) => {
    try
    {
        const response = await newInvestment(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err)
    }
};


exports.editInvestmentController = async (req, res, next) => {
    try
    {
        const response = await editInvestment(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err)
    }
};