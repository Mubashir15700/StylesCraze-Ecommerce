import { Router } from 'express';
import { loginAdmin, logoutAdmin } from '../controllers/authController.js';
import { getLogin, getDashboard } from '../controllers/adminController.js';
import { checkAuth, isLoggedIn } from '../middlewares/adminMiddleware.js';

const router = Router();

router.route("/login").get(isLoggedIn, getLogin).post(loginAdmin);
router.get("/", checkAuth, getDashboard);
router.post("/logout", logoutAdmin);

export default router;