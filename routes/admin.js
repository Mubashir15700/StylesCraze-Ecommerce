import { Router } from 'express';

const router = Router();

router.get("/", (req, res) => {
    res.render("admin/test");
});

export default router;