import { Router } from "express";
import { loginAdmin, logoutAdmin, sendOTP } from "../../../controllers/authController.js";
import { isLoggedIn } from "../../../middlewares/adminMiddlewares.js";
import { getLogin, getEnterEmail } from "../../../controllers/adminControllers/adminController.js";

const router = Router();

router.route("/login")
    .get(isLoggedIn, getLogin)
    .post(loginAdmin);
router.route("/forgot-password")
    .get(isLoggedIn, getEnterEmail)
    .post(sendOTP);
router.post("/logout", logoutAdmin);

export default router;
