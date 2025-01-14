const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
    {
        transactionDate: {
            type: String, // Corresponds to "תאריך עסקה"
            require: true
        },
        
        businessName: {
            type: String, // Corresponds to "שם בית עסק"
            require: true,
            maxlength: 100, 
        },
        chargedAmount: {
            type: Number, // Corresponds to "סכום בש\"ח"
            require: true
        },
        amount: {
            type: Number, // Corresponds to "סכום בש\"ח"
            default: 0,
            require: true
        },
        chargeDate: {
            type: String, // Corresponds to "מועד חיוב"
            default: 0,
            require: true
        },
        transactionType: {
            type: String, // Corresponds to "סוג עסקה"
            require: true
        },
        category: {
            type: String, // Corresponds to "מזהה כרטיס בארנק דיגיטלי"
            default: null,
        },
        notes: {
            type: String, // Corresponds to "הערות"
            default: null,
        },
        userId: {
            type: Schema.Types.ObjectId, // Optional: If transactions are associated with a user
            ref: "User",
        },
    },
    { timestamps: true }
);


  
const Transaction = model("Transaction", transactionSchema);
module.exports = Transaction;