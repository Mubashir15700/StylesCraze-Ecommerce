import { Router } from 'express';
import { 
    loginCustomer, registerCustomer, Verification, resendOTP, changePassword, sendOTP,
    logoutCustomer, 
} from '../controllers/authController.js';
import { 
    getHome, getAbout, getShop, getCategoryProducts, getSingle, getContact, 
    getLogin, getRegister, getEnterEmail, getProfile, updateProfile, getNewAddress, addNewAddress,
    getEditAddress, editAddress, deleteAddress, getAddresses, changeAddress, getChangePassword, 
    getOrders, getWishlist, updateWishlist, getCart, addToCart, removeFromCart, updateCart, getCheckout, 
    placeOrder, cancelOrder,
} from '../controllers/customerController.js';
import { checkAuth, isLoggedIn, toBlock } from '../middlewares/customerMiddleware.js';
import { uploadProfileImage, resizeProfileImage } from '../middlewares/imageUplaodMiddleware.js';

const router = Router();

router.get("/", toBlock, getHome);
router.get("/about",toBlock, getAbout);
router.get("/shop/", toBlock, getShop);
router.get("/shop/:id/:page", toBlock, getCategoryProducts);
router.get("/single/:id", toBlock, getSingle);
router.get("/contact", toBlock, getContact);
router.route("/login").get(isLoggedIn, getLogin).post(loginCustomer);
router.route("/register").get(isLoggedIn, getRegister).post(registerCustomer);
router.post("/logout", logoutCustomer);

// to check blocked or not
router.route("/forgot-password")
.get(isLoggedIn, getEnterEmail)
.post(sendOTP);
router.post("/resend-otp", resendOTP);
router.post("/verification", Verification);

router.route("/profile")
.get(toBlock, checkAuth, getProfile)
.post(toBlock, checkAuth, uploadProfileImage, resizeProfileImage, updateProfile);

router.route("/new-address")
.get(toBlock, checkAuth, getNewAddress)
.post(toBlock, checkAuth, addNewAddress);
router.route("/edit-address/:id")
.get(toBlock, checkAuth, getEditAddress)
.post(toBlock, checkAuth, editAddress);
router.post("/delete-address/:id", toBlock, checkAuth, deleteAddress);
router.route("/change-address")
.get(toBlock, checkAuth, getAddresses)
.post(toBlock, checkAuth, changeAddress);
router.route("/change-password")
.get(toBlock, checkAuth, getChangePassword)
.post(toBlock, changePassword);

router.get("/orders", toBlock, checkAuth, getOrders);

router.get("/wishlist", toBlock, checkAuth, getWishlist);
router.post("/update-wishlist", toBlock, checkAuth, updateWishlist);

router.get("/cart", toBlock, checkAuth, getCart);
router.post("/add-to-cart", toBlock, checkAuth, addToCart);
router.post("/remove-from-cart/:id", toBlock, checkAuth, removeFromCart);
router.post("/update-cart/:id", toBlock, checkAuth, updateCart);

router.route("/checkout")
.get(toBlock, checkAuth, getCheckout)
.post(toBlock, checkAuth, placeOrder);
router.post("/cancel-order", toBlock, checkAuth, cancelOrder);

export default router;