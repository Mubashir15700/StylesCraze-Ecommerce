import bcrypt from "bcryptjs";
import nodeMailer from "nodemailer";
import { config } from "../config/env.js";
import UserOTPVerification from "../models/userOTPModel.js";

let salt;

async function generateSalt() {
    salt = await bcrypt.genSalt(10);
}

generateSalt();

export const sendToMail = (req, res, userId, isForgotPassword, next) => {
    const transporter = nodeMailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: config.appEmail,
            pass: config.appPassword
        },
    });

    function generateOTP(length) {
        const charset = "0123456789";
        let otp = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            otp += charset[randomIndex];
        }

        return otp;
    }

    let OTP = generateOTP(4);

    const mailOptions = {
        from: {
            name: "StylesCraze",
            address: config.appEmail,
        },
        to: req.body.email,
        subject: "OTP Verification",
        html: `<p>Your otp for verification is ${OTP}</p>`,
    };

    const sendMail = async (transporter, options) => {
        try {
            await UserOTPVerification.deleteMany({ userId });
            const hashedOTP = await bcrypt.hash(OTP, salt);
            const newUserOTPVerification = new UserOTPVerification({
                userId,
                otp: hashedOTP,
            });
            await newUserOTPVerification.save();
            await transporter.sendMail(options);
            res.render("customer/auth/verification", { 
                userId, 
                email: req.body.email, 
                error: "", 
                isForgotPassword,
            });
        } catch (error) {
            next(error);
        }
    }

    sendMail(transporter, mailOptions);
};
