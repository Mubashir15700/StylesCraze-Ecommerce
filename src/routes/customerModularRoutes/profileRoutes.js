import { Router } from "express";
import { checkAuth, checkToBlock } from "../../middlewares/customerMiddlewares.js";
import { uploadProfileImage, resizeProfileImage } from "../../middlewares/imageUplaodMiddlewares.js";
import {
    getProfile, updateProfile, removeProfileImage, getNewAddress, addNewAddress,
    getEditAddress, editAddress, deleteAddress, getAddresses, changeDefaultAddress,
    getOrders, getWallet, getCoupons,
} from "../../controllers/customerControllers/profileControllers.js";

const router = Router();

router.route("/")
    .get(checkToBlock, checkAuth, getProfile)
    .patch(checkToBlock, checkAuth, uploadProfileImage, resizeProfileImage, updateProfile);
router.patch("/remove-image", checkToBlock, checkAuth, removeProfileImage);
router.route("/addresses/new")
    .get(checkToBlock, checkAuth, getNewAddress)
    .post(checkToBlock, checkAuth, addNewAddress);
router.route("/addresses/:id/edit")
    .get(checkToBlock, checkAuth, getEditAddress)
    .patch(checkToBlock, checkAuth, editAddress);

router.delete("/addresses/:id/delete", checkToBlock, checkAuth, deleteAddress);
router.route("/addresses/change-address")
    .get(checkToBlock, checkAuth, getAddresses)
    .patch(checkToBlock, checkAuth, changeDefaultAddress);

router.get("/orders", checkToBlock, checkAuth, getOrders);
router.get("/wallet", checkToBlock, checkAuth, getWallet);
router.get("/coupons", checkToBlock, checkAuth, getCoupons);

export default router;
