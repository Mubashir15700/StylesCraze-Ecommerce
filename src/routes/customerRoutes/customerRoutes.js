import { Router } from "express";
import {
    loginCustomer, registerCustomer, Verification, resendOTP, getNewPassword, newPassword, changePassword, sendOTP, logoutCustomer,
} from "../../controllers/authController.js";
// auth middleware
import { checkAuth, isLoggedIn, checkToBlock } from "../../middlewares/customerMiddleware.js";
// customer controller
import {
    getHome, getAbout, getShop, getCategoryProducts, getSingleProduct, searchProducts, filterProducts,
    getContact, getLogin, getRegister, getEnterEmail, getWishlist, updateWishlist, applyCoupon, placeOrder,
    saveRzpOrder, cancelOrder, getReturnProductForm, requestReturnProduct
} from "../../controllers/customerControllers/customerController.js";
// profile controller
import {
    getProfile, updateProfile, removeProfileImage, getNewAddress, addNewAddress, getEditAddress, editAddress,
    deleteAddress, getAddresses, changeDefaultAddress, getChangePassword, getOrders, getWallet, getCoupons,
} from "../../controllers/customerControllers/profileController.js";
// cart controller
import { getCart, addToCart, removeFromCart, updateCart, getCheckout, } from "../../controllers/customerControllers/cartController.js";
// image middleware
import { uploadProfileImage, resizeProfileImage } from "../../middlewares/imageUplaodMiddleware.js";

const router = Router();

router.get("/", checkToBlock, getHome);
router.get("/about", checkToBlock, getAbout);

router.get("/shop/:page", checkToBlock, getShop);
router.get("/shop/:id/:page", checkToBlock, getCategoryProducts);
router.get("/single/:id", checkToBlock, getSingleProduct);
router.post("/search-product", checkToBlock, searchProducts);
router.post("/filter-products", checkToBlock, filterProducts);

router.get("/contact", checkToBlock, getContact);
router.route("/login").get(isLoggedIn, getLogin).post(loginCustomer);
router.route("/register").get(isLoggedIn, getRegister).post(registerCustomer);
router.post("/logout", logoutCustomer);

router.route("/forgot-password")
    .get(isLoggedIn, checkToBlock, getEnterEmail)
    .post(checkToBlock, sendOTP);

router.post("/resend-otp", checkToBlock, resendOTP);
router.post("/verification", checkToBlock, Verification);

router.route("/new-password/:id")
    .get(checkToBlock, getNewPassword)
    .post(checkToBlock, newPassword);

router.route("/profile")
    .get(checkToBlock, checkAuth, getProfile)
    .patch(checkToBlock, checkAuth, uploadProfileImage, resizeProfileImage, updateProfile);
router.route("/profile/remove-image").post(checkToBlock, checkAuth, removeProfileImage);

router.route("/new-address")
    .get(checkToBlock, checkAuth, getNewAddress)
    .post(checkToBlock, checkAuth, addNewAddress);

router.route("/edit-address/:id")
    .get(checkToBlock, checkAuth, getEditAddress)
    .post(checkToBlock, checkAuth, editAddress);

router.post("/delete-address/:id", checkToBlock, checkAuth, deleteAddress);

router.route("/change-address")
    .get(checkToBlock, checkAuth, getAddresses)
    .post(checkToBlock, checkAuth, changeDefaultAddress);

router.route("/change-password")
    .get(checkToBlock, checkAuth, getChangePassword)
    .post(checkToBlock, changePassword);

router.get("/orders", checkToBlock, checkAuth, getOrders);
router.get("/wallet", checkToBlock, checkAuth, getWallet);
router.get("/coupons", checkToBlock, checkAuth, getCoupons);

router.get("/wishlist", checkToBlock, checkAuth, getWishlist);
router.post("/update-wishlist", checkToBlock, checkAuth, updateWishlist);

router.get("/cart", checkToBlock, checkAuth, getCart);
router.post("/add-to-cart", checkToBlock, checkAuth, addToCart);
router.post("/remove-from-cart/:id", checkToBlock, checkAuth, removeFromCart);
router.post("/update-cart/:id", checkToBlock, checkAuth, updateCart);

router.route("/checkout")
    .get(checkToBlock, checkAuth, getCheckout)
    .post(checkToBlock, checkAuth, placeOrder);
router.post("/save-rzporder", checkToBlock, checkAuth, saveRzpOrder);

router.post("/apply-coupon", checkToBlock, checkAuth, applyCoupon);

router.post("/cancel-order", checkToBlock, checkAuth, cancelOrder);

router.route("/return-product")
    .get(checkToBlock, checkAuth, getReturnProductForm)
    .post(checkToBlock, checkAuth, requestReturnProduct);

export default router;
