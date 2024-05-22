import { Router } from "express";
import { checkAuth } from "../../../middlewares/adminMiddlewares.js";
import {
    getOrders, getSingleOrder, manuelStatusUpdate 
} from "../../../controllers/adminControllers/adminController.js";

const router = Router();

router.route("/:page")
    .get(checkAuth, getOrders)
    .post(checkAuth, getOrders);
router.get("/single/:id", checkAuth, getSingleOrder);
router.post("/:id/update-status", checkAuth, manuelStatusUpdate);

export default router;
