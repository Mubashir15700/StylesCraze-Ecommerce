import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        minLength: 4,
        maxLength: 100,
    },
    discountType: {
        type: String,
        enum: ["percentage", "fixedAmount"],
        required: true,
    },
    discountAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    minimumPurchaseAmount: {
        type: Number,
        min: 0,
    },
    expirationDate: {
        type: Date,
    },
    usageLimit: {
        type: Number,
        required: true,
        min: 0,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
});

couponSchema.pre("save", function (next) {
    const currentDate = new Date();
    const expirationDate = new Date(currentDate);
    expirationDate.setDate(expirationDate.getDate() + 7);
    this.expirationDate = expirationDate;

    // Check if the coupon has reached its usage limit or has expired
    if (this.usedCount >= this.usageLimit || (expirationDate <= currentDate)) {
        this.isActive = false;
    } else {
        this.isActive = true;
    }

    next();
});

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
