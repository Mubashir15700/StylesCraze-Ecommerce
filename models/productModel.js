import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    images: [String],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    softDeleted: {
        type: Boolean,
        default: false
    }
});

const product = mongoose.model('product', productSchema);

export default product;