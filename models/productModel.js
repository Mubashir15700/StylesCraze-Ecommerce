import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 2,
        maxLength: 20,
        validate: {
            validator: function(value) {
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
    price: {
        type: Number,
        required: true,
        min: 1,
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