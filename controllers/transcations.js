const { getTransactionsById, getTransactionsByMonth, newTransaction, editTransaction, deleteTransaction, transactionFile, processFile } = require("../services/transactions");

exports.getTransactionsByIdController = async (req, res, next) => {
    try
    {
        const response = await getTransactionsById(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err);
    }
};

exports.getTransactionsByMonthController = async (req, res, next) => {
    try
    {
        const response = await getTransactionsByMonth(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err);
    }
};

exports.newTransactionController = async (req, res, next) => {
    try
    {
        const response = await newTransaction(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err);
    }
};

exports.editTransactionController = async (req, res, next) => {
    try
    {
        const response = await editTransaction(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err);
    }
};

exports.deleteTransactionController = async (req, res, next) => {
    try
    {
        const response = await deleteTransaction(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err);
    }
};

exports.processFileHeaderController = async (req, res, next) => {
    try
    {
        const response = await processFile(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err);
    }
};

exports.transactionFileController = async (req, res, next) => {
    try
    {
        const response = await transactionFile(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err);
    }
};