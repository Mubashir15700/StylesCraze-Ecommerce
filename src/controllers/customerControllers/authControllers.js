import bcrypt from "bcryptjs";
import User from "../../models/userModel.js";
import Otp from "../../models/otpModel.js";
import { sendToMail } from "../../utils/sendMailUtil.js";
import generateSalt from "../../utils/generateSaltUtil.js";
import { isLoggedIn, getCurrentUser } from "../../utils/currentUserUtil.js";
import catchAsync from "../../utils/catchAsyncUtil.js";

const salt = generateSalt();

export const getLogin = (req, res) => {
    res.render("customer/auth/login", { commonError: "" });
};

export const getRegister = (req, res) => {
    res.render("customer/auth/register", { commonError: "" });
};

export const getEnterEmail = (req, res) => {
    res.render("customer/auth/forgot", { commonError: "" });
};

export const loginCustomer = catchAsync(async (req, res, next) => {
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
});

export const registerCustomer = catchAsync(async (req, res, next) => {
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
});

// check any error
export const changePassword = catchAsync(async (req, res) => {
    let foundUser;
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
});

export const getChangePassword = catchAsync(async (req, res, next) => {
    const currentUser = await getCurrentUser(req, res);
    res.render("customer/auth/changePassword", {
        isLoggedIn: isLoggedIn(req, res),
        currentUser: await getCurrentUser(req, res),
        error: "",
        email: currentUser.email,
        activePage: "Profile",
    });
});

export const getNewPassword = catchAsync(async (req, res, next) => {
    const currentUser = await User.findById(req.params.id);
    res.render("customer/auth/newPassword", {
        userId: currentUser._id,
        email: currentUser.email,
        error: ""
    });
});

// check any error
export const newPassword = catchAsync(async (req, res) => {
    const foundUser = await User.findOne({ email: req.body.email });
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
    res.redirect("/auth/login");
});

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

export const resendOTP = catchAsync(async (req, res, next) => {
    if (req.body.isForgotPassword === "true") {
        sendToMail(req, res, req.body.id, true, next);
    } else {
        sendToMail(req, res, req.body.id, false, next);
    }
});

export const Verification = catchAsync(async (req, res, next) => {
    let { userId, otp, isForgotPassword } = req.body;
    const verificationRecords = await Otp.findOne({ userId });
    let errorMessage = "";
    let userEmail = "";

    if (!userId || !otp) {
        errorMessage = "Empty details are not allowed";
    } else {
        if (!verificationRecords) {
            errorMessage = "Account record doesn't exist or has been verified already.";
        } else {
            const hashedOTP = verificationRecords.otp;
            if (verificationRecords.expiresAt < Date.now()) {
                errorMessage = "Code has expired. Please try again.";
            } else {
                const isValid = await bcrypt.compare(otp, hashedOTP);
                if (!isValid) {
                    errorMessage = "Invalid code. Please try again.";
                } else {
                    await User.updateOne({ _id: userId }, { verified: true });
                    if (isForgotPassword === "true") {
                        res.redirect(`/new-password/${userId}`);
                    } else {
                        res.redirect("/");
                    }
                }
            }
        }
    }

    // If any error, find the user's email
    const foundUser = await User.findById(userId);
    if (foundUser) {
        userEmail = foundUser.email;
    }

    // Render the verification template with error message and user's email
    res.render("customer/auth/verification", {
        userId,
        email: userEmail,
        commonError: errorMessage,
        isForgotPassword,
    });
});

export const logoutCustomer = catchAsync(async (req, res, next) => {
    req.session.user = null;
    res.redirect("/auth/login");
});
