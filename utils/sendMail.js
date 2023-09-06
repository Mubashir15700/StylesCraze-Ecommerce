import bcrypt from 'bcryptjs';
import nodeMailer from 'nodemailer';
import UserOTPVerification from '../models/userOTPModel.js';

let salt;

async function generateSalt() {
    salt = await bcrypt.genSalt(10);
}

generateSalt();

export const sendToMail = (req, res, userId) => {
    const transporter = nodeMailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER,
            pass: process.env.APP_PASSWORD
        },
    });

    function generateOTP(length) {
        const charset = '0123456789';
        let otp = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            otp += charset[randomIndex];
        }

        return otp;
    }

    let OTP = generateOTP(4);

    const mailOptions = {
        from: {
            name: "Shoppers",
            address: process.env.USER,
        },
        to: req.body.email,
        subject: 'OTP Verification',
        html: `<p>Your otp for verification is ${OTP}</p>`,
    };

    const sendMail = async (transporter, options) => {
        try {
            const hashedOTP = await bcrypt.hash(OTP, salt);
            const newUserOTPVerification = new UserOTPVerification({
                userId: userId,
                otp: hashedOTP,
                createdAt: Date.now(),
                expiresAt: Date.now() + 1000 * 60
            });
            await newUserOTPVerification.save();
            await transporter.sendMail(options);
            res.render('customer/auth/verification', { userId: userId, email: req.body.email });
        } catch (error) {
            res.status(500).json({
                status: 'FAILED',
                message: 'Error sending verification email:' + error.message,
            });
        }
    }

    sendMail(transporter, mailOptions);
};