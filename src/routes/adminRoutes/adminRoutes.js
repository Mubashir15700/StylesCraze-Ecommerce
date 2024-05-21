import { Router } from "express";
import { loginAdmin, logoutAdmin, sendOTP } from "../../controllers/authController.js";
// auth middleware
import { checkAuth, isLoggedIn } from "../../middlewares/adminMiddlewares.js";
// admin controller
import {
    getLogin, getEnterEmail, getDashboard, getNotifications, getOrders, getSingleOrder, 
    manuelStatusUpdate, getReturnRequests, returnRequestAction, getCustomers, 
    customerAction, getCoupons, getAddNewCoupon, addNewCoupon, couponAction, getSalesReport, downloadSalesReport
} from "../../controllers/adminControllers/adminController.js";
// category controller
import {
    getCategories, addNewCategory, newCategory, getCategory, editCategory, categoryAction,
} from "../../controllers/adminControllers/categoryController.js";
// product controller
import {
    getProducts, getAddNewProduct, addNewProduct, getProduct, editProduct, addImage, deleteImage, productAction,
} from "../../controllers/adminControllers/productsController.js";
// banner controller
import {
    getBanners, getAddNewBanner, addNewBanner, getBanner, editBanner, addBannerImage, deleteBannerImage, bannerAction,
} from "../../controllers/adminControllers/bannerController.js";
// image middleware
import {
    uploadCategoryImage, resizeCategoryImage, uploadProductImages, resizeProductImages,
    uploadBannerImages, resizeBannerImages
} from "../../middlewares/imageUplaodMiddlewares.js";

const router = Router();

router.get("/", checkAuth, getDashboard);
router.route("/login").get(isLoggedIn, getLogin).post(loginAdmin);
router.route("/forgot-password")
.get(isLoggedIn, getEnterEmail)
.post(sendOTP);
router.get("/notifications", checkAuth, getNotifications);

router.route("/orders/:page")
    .get(checkAuth, getOrders)
    .post(checkAuth, getOrders);
router.get("/single-order/:id", checkAuth, getSingleOrder);
router.post("/update-order-status", checkAuth, manuelStatusUpdate);

router.route("/return-requests/:page")
    .get(checkAuth, getReturnRequests)
    .post(checkAuth, getReturnRequests)
router.post("/return-request-action", checkAuth, returnRequestAction);

// product
router.route("/products/:page")
.get(checkAuth, getProducts)
.post(checkAuth, getProducts);
router.route("/new-product")
    .get(checkAuth, getAddNewProduct)
    .post(checkAuth, uploadProductImages, resizeProductImages, addNewProduct);
router.route("/edit-product/:id")
    .get(checkAuth, getProduct)
    .post(checkAuth, editProduct);
router.delete("/products/img-delete/:id", checkAuth, deleteImage);
router.patch("/products/img-add/:id", checkAuth, uploadProductImages, resizeProductImages, addImage);
router.patch("/products/action/:id", checkAuth, productAction);

router.route("/categories/:page")
    .get(checkAuth, getCategories)
    .post(checkAuth, getCategories);
router.route("/new-category")
    .get(checkAuth, newCategory)
    .post(checkAuth, uploadCategoryImage, resizeCategoryImage, addNewCategory);

router.route("/edit-category/:id")
    .get(checkAuth, getCategory)
    .patch(checkAuth, uploadCategoryImage, resizeCategoryImage, editCategory);
router.patch("/categories/action/:id", checkAuth, categoryAction);

router.route("/customers/:page")
    .get(checkAuth, getCustomers)
    .post(checkAuth, getCustomers);
router.patch("/customers/action/:id", checkAuth, customerAction);

router.route("/coupons/:page")
.get(checkAuth, getCoupons)
.post(checkAuth, getCoupons);
router.route("/new-coupon")
    .get(checkAuth, getAddNewCoupon)
    .post(checkAuth, addNewCoupon);
router.patch("/coupons/action/:id", checkAuth, couponAction);

// sales report
router.route("/sales-report")
    .get(checkAuth, getSalesReport)
    .post(checkAuth, getSalesReport);
router.get("/download-report", checkAuth, downloadSalesReport);

// banner
router.route("/banners/:page")
    .get(checkAuth, getBanners)
    .post(checkAuth, getBanners);
router.route("/new-banner")
    .get(checkAuth, getAddNewBanner)
    .post(checkAuth, uploadBannerImages, resizeBannerImages, addNewBanner);
router.route("/edit-banner/:id")
    .get(checkAuth, getBanner)
    .post(checkAuth, editBanner);
router.delete("/banners/img-delete/:id", checkAuth, deleteBannerImage);
router.patch("/banners/img-add/:id", checkAuth, uploadBannerImages, resizeBannerImages, addBannerImage);
router.patch("/banners/action/:id", checkAuth, bannerAction);

router.post("/logout", logoutAdmin);

export default router;