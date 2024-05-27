import { Router } from "express";
import { 
    getLogin, getEnterEmail, loginAdmin, logoutAdmin, sendOTP 
} from "../../controllers/adminControllers/authControllers.js";
import { isLoggedIn } from "../../middlewares/adminMiddlewares.js";

const router = Router();

router.route("/login")
    .get(isLoggedIn, getLogin)
    .post(loginAdmin);
router.route("/forgot-password")
    .get(isLoggedIn, getEnterEmail)
    .post(sendOTP);
router.post("/logout", logoutAdmin);

export default router;
