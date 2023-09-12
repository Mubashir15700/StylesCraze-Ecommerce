import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: String,
    removed: {
        type: Boolean,
        default: false
    }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;