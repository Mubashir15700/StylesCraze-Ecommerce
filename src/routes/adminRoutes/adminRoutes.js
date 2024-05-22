import { Router } from "express";
import { checkAuth } from "../../middlewares/adminMiddlewares.js";
import {
    authRoutes, bannerRoutes, categoryRoutes,
    couponRoutes, orderRoutes, productRoutes
} from "./modularRoutes/index.js";
import {
    getDashboard, getNotifications, getReturnRequests, returnRequestAction,
    getCustomers, customerAction, getSalesReport, downloadSalesReport
} from "../../controllers/adminControllers/adminController.js";

const router = Router();

// Modular Routes
router.use("/auth", authRoutes);
router.use("/banners", bannerRoutes);
router.use("/categories", categoryRoutes);
router.use("/coupons", couponRoutes);
router.use("/orders", orderRoutes);
router.use("/products", productRoutes);

// Dashboard Route
router.get("/", checkAuth, getDashboard);

// Notifications Route
router.get("/notifications", checkAuth, getNotifications);

// Return Requests Routes
router.route("/return-requests/:page")
    .get(checkAuth, getReturnRequests)
    .post(checkAuth, getReturnRequests)
router.patch("/return-requests/:id/action", checkAuth, returnRequestAction);

// Customer Routes
router.route("/customers/:page")
    .get(checkAuth, getCustomers)
    .post(checkAuth, getCustomers);
router.patch("/customers/:id/action", checkAuth, customerAction);

// Sales Report Routes
router.route("/sales-report")
    .get(checkAuth, getSalesReport)
    .post(checkAuth, getSalesReport);
router.get("/sales-report/download", checkAuth, downloadSalesReport);

export default router;
