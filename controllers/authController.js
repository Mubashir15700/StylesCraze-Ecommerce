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

export const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username && password) {
            const foundUser = await Admin.findOne({ username: username });
            if (foundUser) {
                const isMatch = await bcrypt.compare(password, foundUser.password);
                if (isMatch) {
                    req.session.admin = foundUser._id;
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
        res.render('admin/login', { commonError: "Unable to Login." });
    }
};

export const logoutAdmin = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/admin/');
    } catch (error) {
        res.status(500).json({
            status: 'FAILED',
            message: 'Internal Server Error:' + error.message,
        });
    }
};

export const loginCustomer = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username && password) {
            const foundUser = await User.findOne({ username: username });
            if (foundUser) {
                const isMatch = await bcrypt.compare(password, foundUser.password);
                if (isMatch) {
                    req.session.user = foundUser._id;
                    res.redirect('/');
                } else {
                    res.render('customer/login', { commonError: "Invalid username or password." });
                }
            } else {
                res.render('customer/login', { commonError: "No user found." })
            }
        } else {
            res.render('customer/login', { commonError: "All fields are required." });
        }
    } catch (error) {
        res.render('customer/login', { commonError: "Unable to Login." });
    }
};

export const registerCustomer = async (req, res) => {
    try {
        const { username, email, phone, password, confirmPassword } = req.body;
        if (username && email && phone && password && confirmPassword) {
            const foundUser = await User.findOne({ $or: [{ username: username }, { email: email }] });
            if (foundUser) {
                res.render('customer/register', { commonError: "User already exist." });
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
                    sendToMail(req, res, savedUser._id);
                } else {
                    res.render('customer/register', { commonError: "Password and confirm password didn't match." });
                }
            }
        } else {
            res.render('customer/register', { commonError: "All fields are required." });
        }
    } catch (error) {
        res.render('customer/register', { commonError: "Unable to register." });
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
                    const isValid = bcrypt.compare(otp, hashedOTP);
                    if (!isValid) {
                        throw new Error("Invalid code. Please check your inbox.");
                    } else {
                        await User.updateOne({ _id: userId }, { verified: true });
                        await verificationRecords.deleteOne({ userId });
                        res.redirect("/");
                    }
                }
            }
        }
    } catch (error) {
        res.status(500).json({
            status: 'FAILED',
            message: 'Internal Server Error:' + error.message,
        });
    }
};

export const resendOTP = async (req, res) => {
    try {
        await UserOTPVerification.deleteOne({ userId:  req.body.id });
        sendToMail(req, res, req.body.id);
    } catch (error) {
        console.log(error);
    }
};

export const logoutCustomer = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        res.status(500).json({
            status: 'FAILED',
            message: 'Internal Server Error:' + error.message,
        });
    }
};