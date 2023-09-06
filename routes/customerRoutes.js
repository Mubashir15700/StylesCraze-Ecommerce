import { Router } from 'express';
import { loginCustomer, registerCustomer, Verification, resendOTP, logoutCustomer } from '../controllers/authController.js';
import { getHome, getAbout, getShop, getSingle, getContact, getLogin, getRegister, getProfile, updateProfile, getWishlist, getCart } from '../controllers/customerController.js';
import { checkAuth, isLoggedIn } from '../middlewares/customerMiddleware.js';

const router = Router();

router.get("/", getHome);
router.get("/about", getAbout);
router.get("/shop", getShop);
router.get("/single/:id", getSingle);
router.get("/contact", getContact);
router.route("/login").get(isLoggedIn, getLogin).post(loginCustomer);
router.route("/register").get(isLoggedIn, getRegister).post(registerCustomer);
router.post("/verification", Verification);
router.post("/resend-otp", resendOTP);
router.post("/logout", logoutCustomer);

router.route("/profile").get(checkAuth, getProfile).post(checkAuth, updateProfile);
router.get("/wishlist", checkAuth, getWishlist);
router.get("/cart", checkAuth, getCart);

export default router;