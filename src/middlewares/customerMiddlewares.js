import User from "../models/userModel.js";

export const checkAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/auth/login");
    }
};

export const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        next();
    } else {
        res.redirect("/");
    }
};

export const checkToBlock = async (req, res, next) => {
    const currentUser = await User.findById(req.session.user);
    if (currentUser && currentUser.blocked === true) {
        req.session.user = null;
    }
    next();
};
