import { Router } from "express";
import { checkAuth } from "../../../middlewares/adminMiddlewares.js";
import { uploadBannerImages, resizeBannerImages } from "../../../middlewares/imageUplaodMiddlewares.js";
import {
    getBanners, getAddNewBanner, addNewBanner, getBanner, editBanner, addBannerImage, deleteBannerImage, bannerAction,
} from "../../../controllers/adminControllers/bannerController.js";

const router = Router();

router.route("/new")
    .get(checkAuth, getAddNewBanner)
    .post(checkAuth, uploadBannerImages, resizeBannerImages, addNewBanner);
router.route("/:page")
    .get(checkAuth, getBanners)
    .post(checkAuth, getBanners);
router.route("/:id/edit")
    .get(checkAuth, getBanner)
    .post(checkAuth, editBanner);
router.delete("/:id/delete-img", checkAuth, deleteBannerImage);
router.patch("/:id/add-img", checkAuth, uploadBannerImages, resizeBannerImages, addBannerImage);
router.patch("/:id/action", checkAuth, bannerAction);

export default router;
