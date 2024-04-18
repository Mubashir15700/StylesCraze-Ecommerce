import dotenv from "dotenv";
dotenv.config();
import Razorpay from "razorpay";

const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

export const razorpay = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY,
});
