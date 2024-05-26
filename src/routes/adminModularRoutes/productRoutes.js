import { Router } from "express";
import { checkAuth } from "../../middlewares/adminMiddlewares.js";
import { uploadProductImages, resizeProductImages } from "../../middlewares/imageUplaodMiddlewares.js";
import {
    getProducts, getAddNewProduct, addNewProduct, getProduct, editProduct, addImage, deleteImage, productAction,
} from "../../controllers/adminControllers/productsControllers.js";

const router = Router();

router.route("/new")
    .get(checkAuth, getAddNewProduct)
    .post(checkAuth, uploadProductImages, resizeProductImages, addNewProduct);
router.route("/:page")
    .get(checkAuth, getProducts)
    .post(checkAuth, getProducts);
router.route("/:id/edit")
    .get(checkAuth, getProduct)
    .post(checkAuth, editProduct);
router.delete("/:id/delete-img", checkAuth, deleteImage);
router.patch("/:id/add-img", checkAuth, uploadProductImages, resizeProductImages, addImage);
router.patch("/:id/action", checkAuth, productAction);

export default router;
