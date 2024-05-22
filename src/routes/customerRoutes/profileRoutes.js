import { Router } from "express";
import { checkAuth, checkToBlock } from "../../middlewares/customerMiddlewares.js";
import { uploadProfileImage, resizeProfileImage } from "../../middlewares/imageUplaodMiddlewares.js";
import {
    getProfile, updateProfile, removeProfileImage, getNewAddress, addNewAddress, 
    getEditAddress, editAddress, deleteAddress, getAddresses, changeDefaultAddress, 
    getOrders, getWallet, getCoupons,
} from "../../controllers/customerControllers/profileController.js";

const router = Router();

router.route("/profile")
    .get(checkToBlock, checkAuth, getProfile)
    .patch(checkToBlock, checkAuth, uploadProfileImage, resizeProfileImage, updateProfile);
router.route("/profile/remove-image").post(checkToBlock, checkAuth, removeProfileImage);
router.route("/profile/new-address")
    .get(checkToBlock, checkAuth, getNewAddress)
    .post(checkToBlock, checkAuth, addNewAddress);
router.route("/profile/edit-address/:id")
    .get(checkToBlock, checkAuth, getEditAddress)
    .post(checkToBlock, checkAuth, editAddress);

router.post("/profile/delete-address/:id", checkToBlock, checkAuth, deleteAddress);
router.route("/profile/change-address")
    .get(checkToBlock, checkAuth, getAddresses)
    .post(checkToBlock, checkAuth, changeDefaultAddress);

router.get("/orders", checkToBlock, checkAuth, getOrders);
router.get("/wallet", checkToBlock, checkAuth, getWallet);
router.get("/coupons", checkToBlock, checkAuth, getCoupons);

export default router;
