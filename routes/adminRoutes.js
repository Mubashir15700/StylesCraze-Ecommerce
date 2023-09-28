import { Router } from 'express';

import { loginAdmin, logoutAdmin } from '../controllers/authController.js';
// auth middleware
import { checkAuth, isLoggedIn } from '../middlewares/adminMiddleware.js';
// admin controller
import { 
    getLogin, getDashboard, getNotifications, getProfile, getOrders, getReturnRequests, returnRequestAction,
    getCustomers, customerAction, getCoupons, getAddNewCoupon, addNewCoupon, couponAction, getSalesReport 
} from '../controllers/admin/adminController.js';
// category controller
import { 
    getCategories, addNewCategory, newCategory, getCategory, editCategory, categoryAction, 
} from '../controllers/admin/categoryController.js';
// product controller
import { 
    getProducts, getAddNewProduct, addNewProduct, getProduct, editProduct, addImage, deleteImage, productAction, 
} from '../controllers/admin/productsController.js';
// banner controller
import { 
    getBanners, getAddNewBanner, addNewBanner, getBanner, editBanner, addBannerImage, deleteBannerImage, bannerAction, 
} from '../controllers/admin/bannerController.js';
// image middleware
import { 
    uploadCategoryImage, resizeCategoryImage, uploadProductImages, resizeProductImages, 
    uploadBannerImages, resizeBannerImages 
} from '../middlewares/imageUplaodMiddleware.js';

const router = Router();

router.get("/", checkAuth, getDashboard);
router.route("/login").get(isLoggedIn, getLogin).post(loginAdmin);
router.get("/notifications", checkAuth, getNotifications);
router.get("/profile", checkAuth, getProfile);

router.get("/orders", checkAuth, getOrders);

router.route("/return-requests")
.get(checkAuth, getReturnRequests)
.post(checkAuth, returnRequestAction);

// product
router.get("/products", checkAuth, getProducts);
router.route("/new-product")
.get(checkAuth, getAddNewProduct)
.post(checkAuth, uploadProductImages, resizeProductImages, addNewProduct);
router.route("/edit-product/:id")
.get(checkAuth, getProduct)
.post(checkAuth, editProduct);
router.delete("/products/img-delete/:id", checkAuth, deleteImage);
router.patch("/products/img-add/:id", checkAuth, uploadProductImages, resizeProductImages, addImage);
router.patch("/products/action/:id", checkAuth, productAction);

router.get("/categories", checkAuth, getCategories);
router.route("/new-category")
.get(checkAuth, newCategory)
.post(checkAuth, uploadCategoryImage, resizeCategoryImage, addNewCategory);

router.route("/edit-category/:id")
.get(checkAuth, getCategory)
.patch(checkAuth, uploadCategoryImage, resizeCategoryImage, editCategory);

router.patch("/categories/action/:id", checkAuth, categoryAction);

router.get("/customers", checkAuth, getCustomers);
router.patch("/customers/action/:id", checkAuth, customerAction);

router.get("/coupons", checkAuth, getCoupons);
router.route("/new-coupon")
.get(checkAuth, getAddNewCoupon)
.post(checkAuth, addNewCoupon);
router.patch("/coupons/action/:id", checkAuth, couponAction);

router.route("/sales-report")
.get(checkAuth, getSalesReport)
.post(checkAuth, getSalesReport);

// banner
router.get("/banners", checkAuth, getBanners);
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