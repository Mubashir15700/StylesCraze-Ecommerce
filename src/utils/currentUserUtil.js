import User from "../models/userModel.js";
import catchAsync from "./catchAsyncUtil.js";

export const isLoggedIn = (req, res) => {
    if (req.session.user) {
        return true
    } else {
        return false;
    }
};

export const getCurrentUser = catchAsync(async (req, res, next) => {
    const currentUser = await User.findById(req.session.user) || "";
    return currentUser;
});
