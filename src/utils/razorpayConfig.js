import Razorpay from "razorpay";
import { config } from "../config/env.js";

const { razorpayIdKey, razorpaySecretKey } = config;

export const razorpay = new Razorpay({
    key_id: razorpayIdKey,
    key_secret: razorpaySecretKey,
});
