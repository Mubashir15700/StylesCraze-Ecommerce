import { Router } from 'express';
import { loginCustomer, registerCustomer, Verification, logoutCustomer } from '../controllers/authController.js';
import { getHome, getAbout, getShop, getContact, getLogin, getRegister } from '../controllers/customerController.js';
import { checkAuth, isLoggedIn } from '../middlewares/customerMiddleware.js';

const router = Router();

router.get("/", getHome);
router.get("/about", getAbout);
router.get("/shop", getShop);
router.get("/contact", getContact);
router.route("/login").get(isLoggedIn, getLogin).post(loginCustomer);
router.route("/register").get(isLoggedIn, getRegister).post(registerCustomer);
router.post("/verification", Verification);
router.post("/logout", logoutCustomer);

export default router;