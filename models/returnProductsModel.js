import mongoose from "mongoose";

const returnSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    condition: {
        type: String,
        required: true,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Completed"],
        default: "Pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Return = mongoose.model("Return", returnSchema);

export default Return;
