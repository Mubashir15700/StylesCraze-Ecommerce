import { Router } from "express";
import { checkAuth } from "../../../middlewares/adminMiddlewares.js";
import { 
    getCoupons, getAddNewCoupon, addNewCoupon, couponAction 
} from "../../../controllers/adminControllers/adminController.js";

const router = Router();

router.route("/new")
    .get(checkAuth, getAddNewCoupon)
    .post(checkAuth, addNewCoupon);
router.route("/:page")
    .get(checkAuth, getCoupons)
    .post(checkAuth, getCoupons);
router.patch("/:id/action", checkAuth, couponAction);

export default router;
