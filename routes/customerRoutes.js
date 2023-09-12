import { Router } from 'express';
import { 
    loginCustomer, registerCustomer, Verification, resendOTP, changePassword, sendOTP,
    logoutCustomer, 
} from '../controllers/authController.js';
import { 
    getHome, getAbout, getShop, getCategoryProducts, getSingle, getContact, 
    getLogin, getRegister, getEnterEmail, getProfile, updateProfile, getNewAddress, addNewAddress,
    getEditAddress, editAddress, deleteAddress, getChangePassword, getOrders,
    getWishlist, getCart, addToCart, removeFromCart, updateCart
} from '../controllers/customerController.js';
import { checkAuth, isLoggedIn, isBlocked } from '../middlewares/customerMiddleware.js';

const router = Router();

router.get("/", isBlocked, getHome);
router.get("/about",isBlocked, getAbout);
router.get("/shop", isBlocked, getShop);
router.get("/shop/:id", isBlocked, getCategoryProducts);
router.get("/single/:id", isBlocked, getSingle);
router.get("/contact", isBlocked, getContact);
router.route("/login").get(isLoggedIn, getLogin).post(loginCustomer);
router.route("/register").get(isLoggedIn, getRegister).post(registerCustomer);
router.post("/verification", Verification);
router.post("/resend-otp", resendOTP);
router.route("/forgot-password").get(isLoggedIn, getEnterEmail).post(sendOTP);
router.post("/logout", logoutCustomer);

router.route("/profile").get(isBlocked, checkAuth, getProfile).post(checkAuth, updateProfile);
router.route("/new-address").get(isBlocked, checkAuth, getNewAddress).post(checkAuth, addNewAddress);
router.route("/edit-address/:id").get(isBlocked, checkAuth, getEditAddress).post(checkAuth, editAddress);
router.post("/delete-address/:id", checkAuth, deleteAddress);
router.route("/change-password").get(isBlocked, checkAuth, getChangePassword).post(changePassword);
router.get("/orders", isBlocked, checkAuth, getOrders);

router.get("/wishlist", isBlocked, checkAuth, getWishlist);
router.post("/wishlist", checkAuth, (req, res) => {
    console.log(req.body);
});

router.get("/cart", isBlocked, checkAuth, getCart);
router.post("/add-to-cart", checkAuth, addToCart);
router.post("/remove-from-cart/:id", checkAuth, removeFromCart);
router.post("/update-cart/:id", checkAuth, updateCart);

export default router;