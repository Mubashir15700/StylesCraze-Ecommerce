import { Router } from 'express';

const router = Router();

router.get("/", (req, res) => {
    res.render("customer/test");
});

export default router;