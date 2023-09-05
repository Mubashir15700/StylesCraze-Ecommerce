import { Router } from 'express';
import { loginAdmin, logoutAdmin } from '../controllers/authController.js';
import { getLogin, getDashboard, getNotifications, getProfile, getOrders, getProducts, newProduct, addNewProduct, getProduct, editProduct, getCategories, newCategory, addNewCategory, getCategory, editCategory, categoryAction, getCustomers, customerAction, getSalesReport, getBanner } from '../controllers/adminController.js';
import { checkAuth, isLoggedIn } from '../middlewares/adminMiddleware.js';
import { uploadCategoryImage, resizeCategoryImage } from '../middlewares/imageUplaodMiddleware.js';

const router = Router();

router.get("/", checkAuth, getDashboard);
router.route("/login").get(isLoggedIn, getLogin).post(loginAdmin);
router.get("/notifications", checkAuth, getNotifications);
router.get("/profile", checkAuth, getProfile);
router.get("/orders", checkAuth, getOrders);

router.get("/products", checkAuth, getProducts);
router.route("/new-product").get(checkAuth, newProduct).post(checkAuth, addNewProduct);
router.route("/edit-product").get(checkAuth, getProduct).post(checkAuth, editProduct);

router.get("/categories", checkAuth, getCategories);
router.route("/new-category").get(checkAuth, newCategory).post(checkAuth, uploadCategoryImage, resizeCategoryImage, addNewCategory);
router.route("/edit-category/:id").get(checkAuth, getCategory).patch(checkAuth, uploadCategoryImage, resizeCategoryImage, editCategory);
router.patch("/categories/action/:id", checkAuth, categoryAction);

router.get("/customers", checkAuth, getCustomers);
router.patch("/customers/action/:id", checkAuth, customerAction);

router.get("/sales-report", checkAuth, getSalesReport);
router.get("/banner", checkAuth, getBanner);
router.post("/logout", logoutAdmin);

export default router;