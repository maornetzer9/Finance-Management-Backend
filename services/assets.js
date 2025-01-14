const Asset = require("../models/Assets");
const calculateGrowth = require("../utils/calculator");
const { assetsResponses, Responses } = require("../responses");

const success = Responses.success;
const error = Responses.internalError;


exports.getAssets = async (req) => {
    try
    {
        const { user } = req;
        const { code, message } = success;

        const assets = await Asset.find({userId: user._id});

        if(!assets || !assets.length)
        {
            const { code, message } = assetsResponses.emptyAssets;
            return { code, message, assets: [] };
        }

        const { bulkUpdates, assetsWithGrowth, summary } = calculateGrowth(assets, user);

        if (bulkUpdates.length) 
        {
            await Asset.bulkWrite(bulkUpdates);
        }

          // Optionally save totalGrowth to all assets (if needed for individual tracking)
          await Asset.updateMany(
            { userId: user._id },
            { $set: { totalGrowth: summary.totalGrowth } }
        );

        return { code, message, summary, assets: assetsWithGrowth };
    }
    catch(err)
    {
        const { code } = error
        console.error(err.message);
        return { code, message: err.message }
    }
};


exports.newAsset = async (req) => {
    try
    {
        const { user } = req;
        const newAsset = req.body;
        const { code, message } = success;

        const asset = await new Asset({...newAsset, userId: user._id}).save();

        if(!asset)
        {
            const { code, message } = assetsResponses.failedToAddAsset;
            return { code, message };
        }

        const { currentValue, purchasePrice } = asset;

        if (currentValue != null && purchasePrice != null && currentValue !== purchasePrice) 
        {
            const calculateGrowth = (purchasePrice, currentValue) =>
                (((currentValue - purchasePrice) / purchasePrice) * 100).toFixed(1);

            asset.growth = calculateGrowth(purchasePrice, currentValue);
            await asset.save();
        }

        const assets = await Asset.find({userId: user._id});
        const { summary } = asset.length !== 0 && calculateGrowth(assets, user);

        return { code, message, asset, summary };
    }
    catch(err)
    {
        const { code } = error
        console.error(err.message);
        return { code, message: err.message }
    }
};


exports.editAsset = async (req) => {
    try {
        const { user } = req;
        const editedAsset = req.body;
        const { code, message } = success;

        // Step 1: Fetch the existing asset before updating
        const asset = await Asset.findOne({ _id: editedAsset._id, userId: user._id });

        if (!asset) 
        {
            const { code, message } = assetsResponses.editAssetFailure;
            return { code, message }; 
        }

        // Step 2: Check if prices have changed
        const isPriceChanged =
            asset.purchasePrice !== editedAsset?.purchasePrice ||
            asset.currentValue !== editedAsset?.currentValue;
            
        // Step 3: Update asset details
        asset.set({...editedAsset, createdAt: editedAsset.createdAt}); 
        asset.markModified('createdAt'); // Mark 'createdAt' as modified
        
        if (isPriceChanged) 
        {
            // Save the asset after applying updates
            await asset.save();

            // Recalculate growth for all assets
            const assets = await Asset.find({ userId: user._id });
            const { summary, bulkUpdates } = calculateGrowth(assets, user);

            // Perform bulk updates for growth values in the database
            if (bulkUpdates?.length > 0) 
            {
                await Asset.bulkWrite(bulkUpdates);
            }

            // Include growth summary in the response
            const growth = (((asset.currentValue - asset.purchasePrice) / asset.purchasePrice) * 100).toFixed(2);
            asset.growth = growth; // Set growth value for the asset

            await asset.save(); // Save after updating growth
            return {
                code,
                message,
                asset,
                summary, // Return the summary if prices have changed
            };
        }
        // Save the asset if no price changes but still needs updating
        await asset.save();
        return { code, message, asset }; 
    } 
    catch(err) 
    {
        console.error(err.message);
        return {
            code: 500,
            message: err.message,
        };
    }
};


exports.deleteAsset = async (req) => {
    try
    {
        const { user } = req;
        const { id } = req.params;
        const { code, message } = success;

        const asset = await Asset.findOneAndDelete({_id: id, userId: user._id}, { new: true });

        if(!asset) 
        {
            const { code, message } = assetsResponses.assetNotFound;
            return { code, message };
        }

        const assets = await Asset.find({userId: user._id});
        const { summary } = asset.length !== 0 && calculateGrowth(assets, user);

        return { code, message, summary };
    }
    catch(err)
    {
        const { code } = error
        console.error(err.message);
        return { code, message: err.message }
    }
};