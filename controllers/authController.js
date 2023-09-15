import bcrypt from 'bcryptjs';
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import UserOTPVerification from '../models/userOTPModel.js';
import { sendToMail } from '../utils/sendMail.js';

let salt;

async function generateSalt() {
    salt = await bcrypt.genSalt(10);
}

generateSalt();

export const loginAdmin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (username && password) {
            const foundAdmin = await Admin.findOne({ username: username });
            if (foundAdmin) {
                const isMatch = await bcrypt.compare(password, foundAdmin.password);
                if (isMatch) {
                    req.session.admin = foundAdmin._id;
                    res.redirect('/admin/');
                } else {
                    res.render('admin/login', { commonError: "Invalid username or password." });
                }
            } else {
                res.render('admin/login', { commonError: "No admin found." })
            }
        } else {
            res.render('admin/login', { commonError: "All fields are required." });
        }
    } catch (error) {
        next(error);
    }
};

export const logoutAdmin = async (req, res, next) => {
    try {
        req.session.admin = null;
        res.redirect('/admin');
    } catch (error) {
        next(error);
    }
};

export const loginCustomer = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (username && password) {
            const foundUser = await User.findOne({ username: username });
            if (foundUser) {
                if (foundUser.blocked) {
                    res.render('customer/auth/login', { commonError: "Can't log in." });
                } else {
                    const isMatch = await bcrypt.compare(password, foundUser.password);
                    if (isMatch) {
                        req.session.user = foundUser._id;
                        res.redirect('/');
                    } else {
                        res.render('customer/auth/login', { commonError: "Invalid username or password." });
                    }
                }
            } else {
                res.render('customer/auth/login', { commonError: "No user found." });
            }
        } else {
            res.render('customer/auth/login', { commonError: "All fields are required." });
        }
    } catch (error) {
        next(error);
    }
};

export const registerCustomer = async (req, res, next) => {
    try {
        const { username, email, phone, password, confirmPassword } = req.body;
        if (username && email && phone && password && confirmPassword) {
            const foundUser = await User.findOne({ $or: [{ username: username }, { email: email }] });
            if (foundUser) {
                res.render('customer/auth/register', { commonError: "User already exist." });
            } else {
                if (password === confirmPassword) {
                    const hashPassword = await bcrypt.hash(password, salt);
                    const newUser = new User({
                        username: username,
                        email: email,
                        phone: phone,
                        password: hashPassword,
                    });
                    await newUser.save();
                    const savedUser = await User.findOne({ username: username });
                    req.session.user = savedUser._id;
                    sendToMail(req, res, savedUser._id, false);
                } else {
                    res.render('customer/auth/register', {
                        commonError: "Password and confirm password didn't match."
                    });
                }
            }
        } else {
            res.render('customer/auth/register', { commonError: "All fields are required." });
        }
    } catch (error) {
        next(error);
    }
};

// to separate
export const changePassword = async (req, res) => {
    let foundUser;
    if (req.body.isForgotPassword === "false") {
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

            res.render("customer/profile", {
                isLoggedIn: req.session.user ? true : false,
                currentUser: foundUser,
                error: ""
            });
        } catch (error) {
            console.error(error);

            res.render("customer/auth/changePassword", {
                isLoggedIn: req.session.user ? true : false,
                currentUser: foundUser,
                error: error.message,
                isForgotPassword: false,
                email: ""
            });
        }
    } else {
        try {
            const { newPassword, confirmPassword } = req.body;

            if (!newPassword || !confirmPassword) {
                throw new Error("All fields are required.");
            }

            foundUser = await User.findOne({ email: req.body.email });

            if (newPassword !== confirmPassword) {
                throw new Error("New password and Confirm password didn't match.");
            }

            const hashPassword = await bcrypt.hash(newPassword, salt);
            await User.updateOne({ _id: foundUser._id }, {
                $set: {
                    password: hashPassword
                }
            });

            res.redirect("/login");
        } catch (error) {
            console.error(error);

            res.render("customer/auth/changePassword", {
                isLoggedIn: req.session.user ? true : false,
                currentUser: foundUser,
                error: error.message,
                isForgotPassword: true,
                email: req.body.email
            });
        }
    }
};

export const sendOTP = async (req, res, next) => {
    try {
        const foundUser = await User.findOne({ email: req.body.email });
        if (foundUser) {
            sendToMail(req, res, foundUser._id, true);
        } else {
            res.render("customer/auth/forgot", { commonError: "No user with this email found." });
        }
    } catch (error) {
        next(error);
    }
};

export const resendOTP = async (req, res, next) => {
    try {
        await UserOTPVerification.deleteMany({ userId: req.body.id });
        if (req.body.isForgotPassword === "true") {
            sendToMail(req, res, req.body.id, true);
        } else {
            sendToMail(req, res, req.body.id, false);
        }
    } catch (error) {
        next(error);
    }
};

export const Verification = async (req, res) => {
    try {
        let { userId, otp } = req.body;
        if (!userId || !otp) {
            throw Error("Empty details are not allowed");
        } else {
            const verificationRecords = await UserOTPVerification.findOne({ userId });
            if (!verificationRecords) {
                throw new Error(
                    "Account record doesn't exist or has been verified already. Please sign in."
                );
            } else {
                const { expiresAt } = verificationRecords;
                const hashedOTP = verificationRecords.otp;
                if (expiresAt < Date.now()) {
                    await verificationRecords.deleteOne({ userId });
                    throw new Error("Code has expired. Please try again.");
                } else {
                    const isValid = await bcrypt.compare(otp, hashedOTP);
                    if (!isValid) {
                        throw new Error("Invalid code. Please check your inbox.");
                    } else {
                        await User.updateOne({ _id: userId }, { verified: true });
                        await verificationRecords.deleteOne({ userId });
                        if (req.body.isForgotPassword === 'true') {
                            res.render("customer/auth/changePassword", {
                                isLoggedIn: req.session.user ? true : false,
                                currentUser: "",
                                error: "",
                                isForgotPassword: true,
                                email: req.body.email
                            });
                        } else {
                            res.redirect("/");
                        }
                    }
                }
            }
        }
    } catch (error) {
        res.render('customer/auth/verification', {
            userId: req.body.userId,
            email: req.body.email,
            error: error,
            isForgotPassword: req.body.isForgotPassword
        });
    }
};

export const logoutCustomer = async (req, res, next) => {
    try {
        req.session.user = null;
        res.redirect('/login');
    } catch (error) {
        next(error);
    }
};