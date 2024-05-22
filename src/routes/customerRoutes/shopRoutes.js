import { Router } from "express";
import { checkToBlock } from "../../middlewares/customerMiddlewares.js";
import { 
    getShop, getCategoryProducts, getSingleProduct, searchProducts, filterProducts
} from "../../controllers/customerControllers/customerController.js";

const router = Router();

router.get("/shop/products/:page", checkToBlock, getShop);
router.get("/shop/products/:id/:page", checkToBlock, getCategoryProducts);
router.get("/shop/products/single/:id", checkToBlock, getSingleProduct);
router.post("/shop/products/search", checkToBlock, searchProducts);
router.post("/shop/products/filter", checkToBlock, filterProducts);

export default router;
