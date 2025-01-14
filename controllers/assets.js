const { newAsset, getAssets, deleteAsset, editAsset } = require("../services/assets");

exports.getAssetsController = async (req, res, next) => {
    try
    {
        const response = await getAssets(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err)
    }
};


exports.newAssetController = async (req, res, next) => {
    try
    {
        const response = await newAsset(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err)
    }
};


exports.editAssetController = async (req, res, next) => {
    try
    {
        const response = await editAsset(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err)
    }
};


exports.deleteAssetsController = async (req, res, next) => {
    try
    {
        const response = await deleteAsset(req);
        return res.status(200).send(response);
    }
    catch(err)
    {
        console.error(err.message);
        next(err)
    }
};