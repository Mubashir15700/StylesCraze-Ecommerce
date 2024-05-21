import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    otp: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
    },
});

// Add a pre-save hook to calculate the delivery date
otpVerificationSchema.pre("save", function (next) {
    const createdAt = this.createdAt;
    const expiresAt = new Date(createdAt);
    expiresAt.setSeconds(expiresAt.getSeconds() + 30);
    this.expiresAt = expiresAt;

    next();
});

const otpVerification = mongoose.model("otpVerification", otpVerificationSchema);

export default otpVerification;
