import mongoose from "mongoose";

const userOTPVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    otp: {
        type: String,
    },
    createdAt: Date,
    expiresAt: Date
});

const UserOTPVerification = mongoose.model("UserOTPVerification", userOTPVerificationSchema);

export default UserOTPVerification;