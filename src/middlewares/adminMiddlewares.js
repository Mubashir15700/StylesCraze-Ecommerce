export const checkAuth = (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        res.redirect("/admin/auth/login");
    }
};

export const isLoggedIn = (req, res, next) => {
    if (!req.session.admin) {
        next();
    } else {
        res.redirect("/admin/");
    }
};
