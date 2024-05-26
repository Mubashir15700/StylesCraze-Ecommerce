import { Router } from "express";
import { checkAuth } from "../../middlewares/adminMiddlewares.js";
import { uploadCategoryImage, resizeCategoryImage } from "../../middlewares/imageUplaodMiddlewares.js";
import {
    getCategories, addNewCategory, newCategory, getCategory, editCategory, categoryAction,
} from "../../controllers/adminControllers/categoryControllers.js";

const router = Router();

router.route("/new")
    .get(checkAuth, newCategory)
    .post(checkAuth, uploadCategoryImage, resizeCategoryImage, addNewCategory);
router.route("/:page")
    .get(checkAuth, getCategories)
    .post(checkAuth, getCategories);
router.route("/:id/edit")
    .get(checkAuth, getCategory)
    .patch(checkAuth, uploadCategoryImage, resizeCategoryImage, editCategory);
router.patch("/:id/action", checkAuth, categoryAction);

export default router;
