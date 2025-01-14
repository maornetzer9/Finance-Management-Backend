const { Schema, model } = require("mongoose");

const assetSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        purchasePrice: {
            type: Number,
            required: true,
            default: 0,
        },
        currentValue: {
            type: Number,
            required: true,
            default: 0,
        },
        growth: {
            type: Number,
            required: true,
            default: 0,
        },
        totalGrowth: {
            type: Number,
            required: true,
            default: 0,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }, 
        updatedAt: { 
            type: Date, 
            default: Date.now 
        }, 
    },
    { timestamps: true }
);

assetSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});


const Asset = model("Asset", assetSchema);
module.exports = Asset;
