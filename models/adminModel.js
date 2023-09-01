import mongoose from "mongoose";

const adminSchema = mongoose.Schema({
    username: {
        required: true,
        type: String,
        unique: true,
        maxLength: 25,
    },
    password: {
        required: true,
        type: String,
        minLength: 6,
    },
});

const admin = mongoose.model("admin", adminSchema);

export default admin;