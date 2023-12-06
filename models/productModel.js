import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 2,
        maxLength: 20,
        validate: {
            validator: function (value) {
                return /^[a-zA-Z0-9\s]+$/.test(value);
            },
            message: 'Product name must not contain special characters'
        },
        unique: true,
        required: true,
    },
    description: {
        type: String,
        minLength: 4,
        maxLength: 200,
        required: true
    },
    actualPrice: {
        type: Number,
        required: true,
        min: 1,
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
            return this.offerValidUpto ? currentDate <= this.offerValidUpto : false;
        },
    },
    productOfferPrice: {
        type: Number,
        default: null
    },
    categoryOfferPrice: {
        type: Number,
        default: null
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    images: [String],
    size: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    softDeleted: {
        type: Boolean,
        default: false
    }
});

const Product = mongoose.model('Product', productSchema);

export default Product;