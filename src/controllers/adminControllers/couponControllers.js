import Coupon from "../../models/couponModel.js";
import generateCouponCode from "../../utils/generateCouponUtil.js";

export const getCoupons = async (req, res, next) => {
    try {
        // pagination
        const page = parseInt(req.params.page) || 1;
        const pageSize = 3;
        const skip = (page - 1) * pageSize;
        const totalCoupons = await Coupon.countDocuments();
        const totalPages = Math.ceil(totalCoupons / pageSize);

        let foundCoupons;
        if (req.query.search) {
            foundCoupons = await Coupon.find({
                isActive: req.body.searchQuery === "1" ? true : false
            });
            return res.status(200).json({
                couponDatas: foundCoupons,
            });
        } else {
            foundCoupons = await Coupon.find().skip(skip).limit(pageSize);
            res.render("admin/coupons/coupons", {
                foundCoupons,
                activePage: "Coupons",
                filtered: req.query.search ? true : false,
                currentPage: page || 1,
                totalPages: totalPages || 1,
            });
        }
    } catch (error) {
        next(error);
    }
};

export const getAddNewCoupon = (req, res) => {
    res.render("admin/coupons/newCoupon", {
        error: "",
        activePage: "Coupons",
    });
};

export const addNewCoupon = async (req, res, next) => {
    try {
        const { description, discountType, discountAmount, minimumPurchaseAmount, usageLimit } = req.body;
        if (!description || !discountType || !discountAmount || !minimumPurchaseAmount || !usageLimit) {
            res.render("admin/coupons/newCoupon", {
                error: "All fields are required",
                activePage: "Coupons",
            });
        } else {
            if (description.length < 4 || description.length > 100) {
                return res.render("admin/coupons/newCoupon", {
                    error: "Description must be between 4 and 100 characters",
                    activePage: "Coupons",
                });
            } else {
                const uniqueCode = await generateCouponCode();
                const newCoupon = new Coupon({
                    code: uniqueCode,
                    discountType,
                    description,
                    discountAmount,
                    minimumPurchaseAmount,
                    usageLimit,
                });

                await newCoupon.save();

                res.redirect("/admin/coupons/1");
            }
        }
    } catch (error) {
        next(error);
    }
};

export const couponAction = async (req, res, next) => {
    try {
        const state = req.body.state === "";
        const couponId = req.params.id;
        await Coupon.findByIdAndUpdate(couponId, { $set: { isActive: state } });
        res.redirect("/admin/coupons/1");
    } catch (error) {
        next(error);
    }
};
