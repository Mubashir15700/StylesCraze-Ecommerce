import User from "../models/userModel.js";

export const isLoggedIn = (req, res) => {
    if (req.session.user) {
        return true
    } else {
        return false;
    }
};

export const getCurrentUser = async (req, res, next) => {
    return await User.findById(req.session.user) || "";
};
