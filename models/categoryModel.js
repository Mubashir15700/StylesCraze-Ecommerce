import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 2,
        maxLength: 20,
        validate: {
            validator: function (value) {
                return /^[a-zA-Z0-9\s]+$/.test(value);
            },
            message: "Category name must not contain special characters"
        },
        unique: true,
        required: true,
    },
    image: String,
    productsCount: {
        type: Number,
        default: 0,
    },
    offerPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    offerValidUpto: {
        type: Date,
    },
    isOfferActive: {
        type: Boolean,
        default: function () {
            const currentDate = new Date();
            return this.offerValidUpto ? currentDate <= this.offerValidUpto : true;
        },
    },
    removed: {
        type: Boolean,
        default: false
    }
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
