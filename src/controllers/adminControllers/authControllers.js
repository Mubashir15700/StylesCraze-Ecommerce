import bcrypt from "bcryptjs";
import Admin from "../../models/adminModel.js";

let salt;

async function generateSalt() {
    salt = await bcrypt.genSalt(10);
}

generateSalt();

export const getLogin = (req, res) => {
    res.render("admin/login", { commonError: "" });
};

export const getEnterEmail = (req, res) => {
    res.render("admin/forgot", { commonError: "" });
};

export const loginAdmin = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
    }
};

export const sendOTP = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
    }
};

export const logoutAdmin = async (req, res, next) => {
    try {
        req.session.admin = null;
        res.redirect("/admin/auth/login");
    } catch (error) {
        next(error);
    }
};
