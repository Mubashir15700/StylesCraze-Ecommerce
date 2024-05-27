import { Router } from "express";
import { checkToBlock } from "../../middlewares/customerMiddlewares.js";
import { 
    getShop, getCategoryProducts, getSingleProduct, searchProducts, filterProducts
} from "../../controllers/customerControllers/shopControllers.js";

const router = Router();

router.get("/:page", checkToBlock, getShop);
router.get("/products/single/:id", checkToBlock, getSingleProduct);
router.get("/products/:id/:page", checkToBlock, getCategoryProducts);
router.post("/products/search", checkToBlock, searchProducts);
router.post("/products/filter", checkToBlock, filterProducts);

export default router;
