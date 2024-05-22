import { Router } from "express";
import { checkAuth, checkToBlock } from "../../middlewares/customerMiddlewares.js";
import {
    getHome, getAbout, getContact, getWishlist, updateWishlist, applyCoupon, 
    saveRzpOrder, cancelOrder, getReturnProductForm, requestReturnProduct
} from "../../controllers/customerControllers/customerController.js";

const router = Router();

router.get("/", checkToBlock, getHome);
router.get("/about", checkToBlock, getAbout);
router.get("/contact", checkToBlock, getContact);

router.get("/wishlist", checkToBlock, checkAuth, getWishlist);
router.post("/wishlist/update", checkToBlock, checkAuth, updateWishlist);

router.post("/apply-coupon", checkToBlock, checkAuth, applyCoupon);
router.post("/save-rzporder", checkToBlock, checkAuth, saveRzpOrder);
router.post("/cancel-order", checkToBlock, checkAuth, cancelOrder);
router.route("/return-product")
    .get(checkToBlock, checkAuth, getReturnProductForm)
    .post(checkToBlock, checkAuth, requestReturnProduct);

export default router;
