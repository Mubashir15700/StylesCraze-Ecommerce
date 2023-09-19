import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 2,
        maxLength: 20,
        validate: {
            validator: function(value) {
                return /^[a-zA-Z0-9\s]+$/.test(value);
            },
            message: 'Category name must not contain special characters'
        },
        unique: true,
        required: true,
    },
    image: String,
    productsCount: {
        type: Number,
        default: 0,
    },
    removed: {
        type: Boolean,
        default: false
    }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;