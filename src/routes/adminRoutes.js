import { Router } from "express";
import { checkAuth } from "../middlewares/adminMiddlewares.js";
import {
    authRoutes, bannerRoutes, categoryRoutes, couponRoutes, orderRoutes, productRoutes
} from "./adminModularRoutes/index.js";
import { getDashboard } from "../controllers/adminControllers/dashboardControllers.js";
import { getNotifications } from "../controllers/adminControllers/notificationControllers.js";
import { getReturnRequests, returnRequestAction } from "../controllers/adminControllers/requestControllers.js";
import { getSalesReport, downloadSalesReport } from "../controllers/adminControllers/saleReportControllers.js";
import { getCustomers, customerAction } from "../controllers/adminControllers/customerControllers.js";

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
