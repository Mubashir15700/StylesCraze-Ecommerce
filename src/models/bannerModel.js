import mongoose from "mongoose";

const bannerSchema = mongoose.Schema({
    title: {
        required: true,
        type: String,
        maxLength: 20,
    },
    description: {
        required: true,
        type: String,
        maxLength: 100,
    },
    images: {
        required: true,
        type: [String],
    },
    isActive: {
        type: Boolean,
        default: false,
    }
});

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
