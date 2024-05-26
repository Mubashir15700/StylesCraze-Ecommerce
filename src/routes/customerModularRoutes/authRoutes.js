import { Router } from "express";
import { checkAuth, isLoggedIn, checkToBlock } from "../../middlewares/customerMiddlewares.js";
import {
    getLogin, getRegister, getEnterEmail, loginCustomer, registerCustomer,
    Verification, resendOTP, getChangePassword, getNewPassword, newPassword,
    changePassword, sendOTP, logoutCustomer
} from "../../controllers/customerControllers/authControllers.js";

const router = Router();

router.route("/login")
    .get(isLoggedIn, getLogin)
    .post(loginCustomer);
router.route("/register")
    .get(isLoggedIn, getRegister)
    .post(registerCustomer);
router.post("/logout", logoutCustomer);
router.route("/forgot-password")
    .get(isLoggedIn, checkToBlock, getEnterEmail)
    .post(checkToBlock, sendOTP);
router.route("/change-password")
    .get(checkToBlock, checkAuth, getChangePassword)
    .post(checkToBlock, changePassword);
router.post("/resend-otp", checkToBlock, resendOTP);
router.post("/verification", checkToBlock, Verification);
router.route("/new-password/:id")
    .get(checkToBlock, getNewPassword)
    .post(checkToBlock, newPassword);

export default router;
