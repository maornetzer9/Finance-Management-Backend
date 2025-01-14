const { Schema, model } = require("mongoose");

const investmentSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    }
    
  },{ timestamps: true });

const Investment = model("Investment", investmentSchema);
module.exports = Investment;