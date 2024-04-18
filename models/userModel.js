import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["Credit", "Debit"],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

const walletSchema = new mongoose.Schema({
    balance: {
        type: Number,
        default: 0,
    },
    transactions: [transactionSchema],
});

const userSchema = new mongoose.Schema({
    username: {
        required: true,
        type: String,
        unique: true,
        maxLength: 25,
    },
    email: {
        required: true,
        type: String,
        unique: true,
        maxLength: 25,
        lowercase: true,
        match: /^\S+@\S+\.\S+$/,
    },
    phone: {
        required: true,
        type: Number,
        minLength: 10,
        maxLength: 10,
    },
    profile: {
        type: String,
        default: ""
    },
    wishlist: [
        { type: mongoose.Types.ObjectId, ref: "Product" }
    ],
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            quantity: {
                type: Number,
                default: 1
            },
        },
    ],
    earnedCoupons: [
        {
            coupon: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Coupon",
            },
            isUsed: {
                type: Boolean,
                default: false,
            },
        }
    ],
    wallet: walletSchema,
    password: {
        required: true,
        type: String,
        minLength: 6,
    },
    verified: {
        type: Boolean,
        default: false
    },
    blocked: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model("User", userSchema);

export default User;
