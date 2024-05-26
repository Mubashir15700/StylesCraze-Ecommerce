import User from "../../models/userModel.js";
import Address from "../../models/addressModel.js";
import Coupon from "../../models/couponModel.js";
import { isLoggedIn, getCurrentUser } from "../../utils/getCurrentUser.js";

export const getCheckout = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        if (currentUser.verified) {
            const defaultAddress = await Address.findOne({ user: req.session.user, default: true });
            await currentUser.populate("cart.product");
            await currentUser.populate("cart.product.category");
            const cartProducts = currentUser.cart;

            const grandTotal = cartProducts.reduce((total, element) => {
                let price = element.product.actualPrice;
                if (element.product.productOfferPrice && element.product.categoryOfferPrice) {
                    price = Math.min(element.product.productOfferPrice, element.product.categoryOfferPrice);
                } else if (element.product.productOfferPrice || element.product.categoryOfferPrice) {
                    price = element.product.categoryOfferPrice ? element.product.categoryOfferPrice : element.product.productOfferPrice;
                }
                return total + (element.quantity * price);
            }, 0);

            let insufficientStockProduct;
            cartProducts.forEach((cartProduct) => {
                if (cartProduct.product.stock < cartProduct.quantity) {
                    insufficientStockProduct = cartProduct._id;
                }
            });

            if (!insufficientStockProduct) {
                res.render("customer/checkout", {
                    isLoggedIn: isLoggedIn(req, res),
                    currentUser,
                    cartProducts,
                    currentAddress: defaultAddress,
                    discount: 0,
                    grandTotal,
                    currentCoupon: "",
                    couponError: "",
                    error: "",
                    activePage: "Orders",
                });
            } else {
                res.render("customer/cart", {
                    isLoggedIn: isLoggedIn(req, res),
                    currentUser,
                    cartProducts,
                    grandTotal,
                    insufficientStockProduct,
                    activePage: "Cart",
                });
            }
        } else {
            req.body.email = currentUser.email;
            sendToMail(req, res, currentUser._id, false);
        }
    } catch (error) {
        next(error);
    }
};

export const applyCoupon = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.session.user).populate("earnedCoupons.coupon");
        await currentUser.populate("cart.product");
        await currentUser.populate("cart.product.category");
        const cartProducts = currentUser.cart;
        const defaultAddress = await Address.findOne({ user: req.session.user, default: true });
        const currentCoupon = await Coupon.findOne({ code: req.body.coupon });
        const grandTotal = cartProducts.reduce((total, element) => {
            return total + (element.quantity * element.product.actualPrice);
        }, 0);
        let couponError = "";
        let discount = 0;
        if (currentCoupon) {
            const foundCoupon = currentUser.earnedCoupons.find(coupon => coupon.coupon._id.equals(currentCoupon._id));
            if (foundCoupon) {
                if (foundCoupon.coupon.isActive) {
                    if (!foundCoupon.isUsed) {
                        if (foundCoupon.coupon.discountType === "fixedAmount") {
                            discount = foundCoupon.coupon.discountAmount;
                        } else {
                            discount = (foundCoupon.coupon.discountAmount / 100) * grandTotal;
                        }
                    } else {
                        couponError = foundCoupon.isUsed ? "Coupon already used." : "Coupon is inactive.";
                    }
                } else {
                    couponError = foundCoupon.isUsed ? "Coupon already used." : "Coupon is inactive.";
                }
            } else {
                couponError = "Invalid coupon code.";
            }
        } else {
            couponError = "Invalid coupon code.";
        }

        res.render("customer/checkout", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            cartProducts,
            currentAddress: defaultAddress,
            discount,
            grandTotal,
            currentCoupon: couponError ? "" : currentCoupon._id,
            couponError,
            error: "",
            activePage: "Cart"
        });
    } catch (error) {
        next(error);
    }
};
