const calculateGrowth = (assets, user) => {

    let bulkUpdates = [];

    const assetsWithGrowth = assets.map((asset) => {
        const growth = asset.purchasePrice
            ? (((asset.currentValue - asset.purchasePrice) / asset.purchasePrice) * 100).toFixed(2)
            : 0;

        bulkUpdates.push({
            updateOne: {
                filter: { _id: asset._id, userId: user._id },
                update: { growth: parseFloat(growth) }, // Save growth directly to the database
            },
        });

        return {
            ...asset.toObject(),
            growth: parseFloat(growth),
        };
    });

    const totals = assetsWithGrowth.reduce(
        (acc, asset) => ({
            totalPurchase: acc.totalPurchase + asset.purchasePrice,
            totalCurrent: acc.totalCurrent + asset.currentValue,
        }),
        { totalPurchase: 0, totalCurrent: 0 }
    );

    const totalGrowth = totals.totalPurchase
        ? (((totals.totalCurrent - totals.totalPurchase) / totals.totalPurchase) * 100).toFixed(1)
        : 0;

    const summaryCards = [
        {
            label: "שווי כולל",
            value: `₪${totals.totalCurrent.toLocaleString()}`,
            trend: "up",  
            color: "#1E293B",
        },
        {
            label: "צמיחה כוללת",
            value: `${totalGrowth}%`,
            color: totalGrowth >= 0 ? "#10B981" : "#EF4444",
            trend: totalGrowth >= 0 ? "up" : "down", 
        },
    ];

    const summary = { totals, totalGrowth: parseFloat(totalGrowth), summaryCards };

    return {
        summary,        
        bulkUpdates,
        assetsWithGrowth
    };
};


module.exports = calculateGrowth ;