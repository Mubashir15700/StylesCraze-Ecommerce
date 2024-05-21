import mongoose from "mongoose";

const adminSchema = mongoose.Schema({
    email: {
        required: true,
        type: String,
        unique: true,
        maxLength: 25,
        lowercase: true,
        match: /^\S+@\S+\.\S+$/,
    },
    password: {
        required: true,
        type: String,
        minLength: 6,
    },
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
