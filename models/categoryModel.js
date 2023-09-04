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

const category = mongoose.model('category', categorySchema);

export default category;