import bcrypt from 'bcryptjs';
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";

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
        res.status(500).send('Internal Server Error');
    }
}

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
                    res.render('customer/home', { isLoggedIn: true });
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

export const logoutCustomer = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}