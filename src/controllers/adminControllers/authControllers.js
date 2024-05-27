import bcrypt from "bcryptjs";
import Admin from "../../models/adminModel.js";
import catchAsync from "../../utils/catchAsyncUtil.js";

export const getLogin = (req, res) => {
    res.render("admin/login", { commonError: "" });
};

export const loginAdmin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (email && password) {
        const foundAdmin = await Admin.findOne({ email });
        if (foundAdmin) {
            const isMatch = await bcrypt.compare(password, foundAdmin.password);
            if (isMatch) {
                req.session.admin = foundAdmin._id;
                res.redirect("/admin/");
            } else {
                res.render("admin/login", { commonError: "Invalid email or password." });
            }
        } else {
            res.render("admin/login", { commonError: "No admin found." })
        }
    } else {
        res.render("admin/login", { commonError: "All fields are required." });
    }
});

export const getEnterEmail = (req, res) => {
    res.render("admin/forgot", { commonError: "" });
};

export const sendOTP = catchAsync(async (req, res, next) => {
    let foundUser;
    const { email } = req.body;
    foundUser = req.query.role === "user" ?
        await User.findOne({ email }) :
        await Admin.findOne({ email });
    if (foundUser) {
        sendToMail(req, res, foundUser._id, true, next);
    } else {
        res.render("customer/auth/forgot", { commonError: "No user with this email found." });
    }
});

export const logoutAdmin = catchAsync(async (req, res, next) => {
    req.session.admin = null;
    res.redirect("/admin/auth/login");
});
