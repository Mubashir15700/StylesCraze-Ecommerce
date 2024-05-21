import bcrypt from "bcryptjs";
import { sendToMail } from "../utils/sendMailUtil.js";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import otpVerification from "../models/otpModel.js";

let salt;

async function generateSalt() {
    salt = await bcrypt.genSalt(10);
}

generateSalt();

export const loginAdmin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (username && password) {
            const foundAdmin = await Admin.findOne({ username });
            if (foundAdmin) {
                const isMatch = await bcrypt.compare(password, foundAdmin.password);
                if (isMatch) {
                    req.session.admin = foundAdmin._id;
                    res.redirect("/admin/");
                } else {
                    res.render("admin/login", { commonError: "Invalid username or password." });
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

export const logoutAdmin = async (req, res, next) => {
    try {
        req.session.admin = null;
        res.redirect("/admin");
    } catch (error) {
        next(error);
    }
};

export const loginCustomer = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (username && password) {
            const foundUser = await User.findOne({ username });
            if (foundUser) {
                if (foundUser.blocked) {
                    res.render("customer/auth/login", { commonError: "Can't log in." });
                } else {
                    const isMatch = await bcrypt.compare(password, foundUser.password);
                    if (isMatch) {
                        req.session.user = foundUser._id;
                        res.redirect("/");
                    } else {
                        res.render("customer/auth/login", { commonError: "Invalid username or password." });
                    }
                }
            } else {
                res.render("customer/auth/login", { commonError: "No user found." });
            }
        } else {
            res.render("customer/auth/login", { commonError: "All fields are required." });
        }
    } catch (error) {
        next(error);
    }
};

export const registerCustomer = async (req, res, next) => {
    try {
        const { username, email, phone, password, confirmPassword } = req.body;
        if (username && email && phone && password && confirmPassword) {
            const foundUser = await User.findOne({ $or: [{ username }, { email }] });
            if (foundUser) {
                res.render("customer/auth/register", { commonError: "User already exist." });
            } else {
                if (password === confirmPassword) {
                    const hashPassword = await bcrypt.hash(password, salt);
                    const newUser = new User({
                        username: username,
                        email: email,
                        phone: phone,
                        wallet: {
                            balance: 0,
                            transactions: [],
                        },
                        password: hashPassword,
                    });
                    await newUser.save();
                    const savedUser = await User.findOne({ username });
                    req.session.user = savedUser._id;
                    sendToMail(req, res, savedUser._id, false, next);
                } else {
                    res.render("customer/auth/register", {
                        commonError: "Password and confirm password didn't match."
                    });
                }
            }
        } else {
            res.render("customer/auth/register", { commonError: "All fields are required." });
        }
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req, res) => {
    let foundUser;
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new Error("All fields are required.");
        }

        foundUser = await User.findById(req.session.user);
        const isMatch = await bcrypt.compare(currentPassword, foundUser.password);

        if (!isMatch) {
            throw new Error("Incorrect current password.");
        }

        if (newPassword !== confirmPassword) {
            throw new Error("New password and Confirm password didn't match.");
        }

        const hashPassword = await bcrypt.hash(newPassword, salt);
        await User.updateOne({ _id: req.session.user }, {
            $set: {
                password: hashPassword
            }
        });

        res.redirect("/profile");
    } catch (error) {
        res.render("customer/auth/changePassword", {
            isLoggedIn: req.session.user ? true : false,
            currentUser: foundUser,
            error: error.message,
            isForgotPassword: false,
            email: ""
        });
    }
};

export const getNewPassword = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.params.id);
        res.render("customer/auth/newPassword", {
            userId: currentUser._id,
            email: currentUser.email,
            error: ""
        });
    } catch (error) {
        next(error);
    }
};

export const newPassword = async (req, res) => {
    const foundUser = await User.findOne({ email: req.body.email });
    try {
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            throw new Error("All fields are required.");
        }

        if (password !== confirmPassword) {
            throw new Error("New password and Confirm password didn't match.");
        }

        const hashPassword = await bcrypt.hash(password, salt);
        await User.updateOne({ _id: foundUser._id }, {
            $set: {
                password: hashPassword
            }
        });
        res.redirect("/login");
    } catch (error) {
        res.render("customer/auth/newPassword", {
            userId: foundUser._id,
            email: req.body.email,
            error: error.message
        });
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

export const resendOTP = async (req, res, next) => {
    try {
        if (req.body.isForgotPassword === "true") {
            sendToMail(req, res, req.body.id, true, next);
        } else {
            sendToMail(req, res, req.body.id, false, next);
        }
    } catch (error) {
        next(error);
    }
};

export const Verification = async (req, res) => {
    let { userId, otp } = req.body;
    const verificationRecords = await otpVerification.findOne({ userId });
    try {
        if (!userId || !otp) {
            throw Error("Empty details are not allowed");
        } else {
            if (!verificationRecords) {
                throw new Error(
                    "Account record doesn't exist or has been verified already."
                );
            } else {
                const hashedOTP = verificationRecords.otp;
                if (verificationRecords.expiresAt < Date.now()) {
                    throw new Error("Code has expired. Please try again.");
                } else {
                    const isValid = await bcrypt.compare(otp, hashedOTP);
                    if (!isValid) {
                        throw new Error("Invalid code. Please try again.");
                    } else {
                        await User.updateOne({ _id: userId }, { verified: true });
                        if (req.body.isForgotPassword === "true") {
                            res.status(200).json({
                                success: true,
                                redirectTo: `/new-password/${userId}`
                            });
                        } else {
                            res.status(200).json({
                                success: true,
                                redirectTo: "/"
                            });
                        }
                    }
                }
            }
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const logoutCustomer = async (req, res, next) => {
    try {
        req.session.user = null;
        res.redirect("/login");
    } catch (error) {
        next(error);
    }
};
