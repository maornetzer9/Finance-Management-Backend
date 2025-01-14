const { Schema, model } = require("mongoose");
const { hashPassword } = require("../utils/bcrypt");

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        },
        password: {
            type: String,
            required: true,
            set: hashPassword,
        },
        role: {
            type: String,
            default: "User",
        },
        equity: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const User = model("User", userSchema);
module.exports = User;
