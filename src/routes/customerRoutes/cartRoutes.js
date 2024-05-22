import { Router } from "express";
import { checkAuth, checkToBlock } from "../../middlewares/customerMiddlewares.js";
import {
    getCart, addToCart, removeFromCart, updateCart, getCheckout, placeOrder
} from "../../controllers/customerControllers/cartController.js";

const router = Router();

router.get("/cart", checkToBlock, checkAuth, getCart);
router.post("/cart/add", checkToBlock, checkAuth, addToCart);
router.post("/cart/remove/:id", checkToBlock, checkAuth, removeFromCart);
router.post("/cart/update/:id", checkToBlock, checkAuth, updateCart);
router.route("/checkout")
    .get(checkToBlock, checkAuth, getCheckout)
    .post(checkToBlock, checkAuth, placeOrder);

export default router;
