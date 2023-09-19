import { Router } from 'express';
import { 
    loginCustomer, registerCustomer, Verification, resendOTP, changePassword, sendOTP,
    logoutCustomer, 
} from '../controllers/authController.js';
import { 
    getHome, getAbout, getShop, getCategoryProducts, getSingleProduct, searchProducts,
    getContact, getLogin, getRegister, getEnterEmail, getProfile, updateProfile, getNewAddress,
    addNewAddress,getEditAddress, editAddress, deleteAddress, getAddresses, 
    changeDefaultAddress, getChangePassword, getOrders, getWishlist, updateWishlist, 
    getCart, addToCart, removeFromCart, updateCart, getCheckout, placeOrder, placePaidOrder, cancelOrder, 
} from '../controllers/customerController.js';
import { checkAuth, isLoggedIn, checkToBlock } from '../middlewares/customerMiddleware.js';
import { uploadProfileImage, resizeProfileImage } from '../middlewares/imageUplaodMiddleware.js';

const router = Router();

router.get("/", checkToBlock, getHome);
router.get("/about",checkToBlock, getAbout);

router.get("/shop/", checkToBlock, getShop);
router.get("/shop/:id/:page", checkToBlock, getCategoryProducts);
router.get("/single/:id", checkToBlock, getSingleProduct);
router.post("/search-product", checkToBlock, searchProducts);

router.get("/contact", checkToBlock, getContact);
router.route("/login").get(isLoggedIn, getLogin).post(loginCustomer);
router.route("/register").get(isLoggedIn, getRegister).post(registerCustomer);
router.post("/logout", logoutCustomer);

router.route("/forgot-password")
.get(isLoggedIn, checkToBlock, getEnterEmail)
.post(checkToBlock, sendOTP);

router.post("/resend-otp", checkToBlock, resendOTP);
router.post("/verification", checkToBlock, Verification);

router.route("/profile")
.get(checkToBlock, checkAuth, getProfile)
.patch(checkToBlock, checkAuth, uploadProfileImage, resizeProfileImage, updateProfile);

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
router.get("/wishlist", checkToBlock, checkAuth, getWishlist);
router.post("/update-wishlist", checkToBlock, checkAuth, updateWishlist);

router.get("/cart", checkToBlock, checkAuth, getCart);
router.post("/add-to-cart", checkToBlock, checkAuth, addToCart);
router.post("/remove-from-cart/:id", checkToBlock, checkAuth, removeFromCart);
router.post("/update-cart/:id", checkToBlock, checkAuth, updateCart);

router.route("/checkout")
.get(checkToBlock, checkAuth, getCheckout)
.post(checkToBlock, checkAuth, placeOrder);

router.post("/cancel-order", checkToBlock, checkAuth, cancelOrder);

// payment
router.post("/place-paid-order", placePaidOrder);

export default router;