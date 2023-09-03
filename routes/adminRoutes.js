import { Router } from 'express';
import { loginAdmin, logoutAdmin } from '../controllers/authController.js';
import { getLogin, getDashboard, getNotifications, getProfile, getOrders, getProducts, getCategories, getCustomers, getSalesReport, getBanner } from '../controllers/adminController.js';
import { checkAuth, isLoggedIn } from '../middlewares/adminMiddleware.js';

const router = Router();

router.get("/", checkAuth, getDashboard);
router.route("/login").get(isLoggedIn, getLogin).post(loginAdmin);
router.get("/notifications", checkAuth, getNotifications);
router.get("/profile", checkAuth, getProfile);
router.get("/orders", checkAuth, getOrders);
router.get("/products", checkAuth, getProducts);
router.get("/categories", checkAuth, getCategories);
router.get("/customers", checkAuth, getCustomers);
router.get("/sales-report", checkAuth, getSalesReport);
router.get("/banner", checkAuth, getBanner);
router.post("/logout", logoutAdmin);

export default router;