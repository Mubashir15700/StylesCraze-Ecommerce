import { Router } from "express";
import { checkAuth, checkToBlock } from "../middlewares/customerMiddlewares.js";
import {
    authRoutes, profileRoutes, cartRoutes, shopRoutes
} from "./customerModularRoutes/index.js";
import {
    getHome, getAbout, getContact, getWishlist, updateWishlist, applyCoupon,
    saveRzpOrder, cancelOrder, getReturnProductForm, requestReturnProduct,
    getCheckout, placeOrder
} from "../controllers/customerControllers/customerControllers.js";

const router = Router();

// Modular Routes
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/cart", cartRoutes);
router.use("/shop", shopRoutes);

// Home Route
router.get("/", checkToBlock, getHome);

// About Route
router.get("/about", checkToBlock, getAbout);

// Contact Route
router.get("/contact", checkToBlock, getContact);

// Wishlist Routes
router.get("/wishlist", checkToBlock, checkAuth, getWishlist);
router.patch("/wishlist/update", checkToBlock, checkAuth, updateWishlist);

// Checkout Route
router.route("/checkout")
    .get(checkToBlock, checkAuth, getCheckout)
    .post(checkToBlock, checkAuth, placeOrder);

// Other Routes
router.post("/apply-coupon", checkToBlock, checkAuth, applyCoupon);
router.post("/save-rzporder", checkToBlock, checkAuth, saveRzpOrder);
router.patch("/cancel-order", checkToBlock, checkAuth, cancelOrder);
router.route("/return-product")
    .get(checkToBlock, checkAuth, getReturnProductForm)
    .post(checkToBlock, checkAuth, requestReturnProduct);

export default router;
