import { Router } from "express";
import { checkAuth, isLoggedIn, checkToBlock } from "../../middlewares/customerMiddlewares.js";
import {
    getLogin, getRegister, getEnterEmail, loginCustomer, registerCustomer, 
    Verification, resendOTP, getChangePassword, getNewPassword, newPassword, 
    changePassword, sendOTP, logoutCustomer
} from "../../controllers/authController.js";

const router = Router();

router.route("/auth/login").get(isLoggedIn, getLogin).post(loginCustomer);
router.route("/auth/register").get(isLoggedIn, getRegister).post(registerCustomer);
router.post("/auth/logout", logoutCustomer);
router.route("/auth/forgot-password")
    .get(isLoggedIn, checkToBlock, getEnterEmail)
    .post(checkToBlock, sendOTP);
router.route("/auth/change-password")
    .get(checkToBlock, checkAuth, getChangePassword)
    .post(checkToBlock, changePassword);
router.post("/auth/resend-otp", checkToBlock, resendOTP);
router.post("/auth/verification", checkToBlock, Verification);
router.route("/auth/new-password/:id")
    .get(checkToBlock, getNewPassword)
    .post(checkToBlock, newPassword);

export default router;
