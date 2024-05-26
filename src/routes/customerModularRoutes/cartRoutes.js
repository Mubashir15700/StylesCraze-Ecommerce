import { Router } from "express";
import { checkAuth, checkToBlock } from "../../middlewares/customerMiddlewares.js";
import {
    getCart, addToCart, removeFromCart, updateCart
} from "../../controllers/customerControllers/cartControllers.js";

const router = Router();

router.get("/", checkToBlock, checkAuth, getCart);
router.patch("/add", checkToBlock, checkAuth, addToCart);
router.delete("/remove/:id", checkToBlock, checkAuth, removeFromCart);
router.patch("/update/:id", checkToBlock, checkAuth, updateCart);

export default router;
