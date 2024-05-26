import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import Order from "../../models/orderModel.js";
import Address from "../../models/addressModel.js";
import Return from "../../models/returnProductsModel.js";
import { isLoggedIn, getCurrentUser } from "../../utils/currentUserUtil.js";

export const getReturnProductForm = async (req, res, next) => {
    try {
        const product = await Product.findById(req.query.product);
        const category = await Category.findById(req.query.category);
        const defaultAddress = await Address.findOne({ user: req.session.user, default: true });
        res.render("customer/returnForm", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            currentAddress: defaultAddress,
            order: req.query.order,
            category,
            product,
            quantity: req.query.quantity,
            activePage: "Orders",
        });
    } catch (error) {
        next(error);
    }
};

export const requestReturnProduct = async (req, res, next) => {
    try {
        const foundOrder = await Order.findById(req.body.order).populate("products.product");
        const foundProduct = await Product.findOne({ name: req.body.product });
        const returnProduct = new Return({
            user: req.session.user,
            order: foundOrder._id,
            product: foundProduct._id,
            quantity: parseInt(req.body.quantity),
            reason: req.body.reason,
            condition: req.body.condition,
            address: req.body.address
        });
        await returnProduct.save();

        foundOrder.products.forEach((product) => {
            if (product.product._id.toString() === foundProduct._id.toString()) {
                product.returnRequested = "Pending";
            }
        });
        await foundOrder.save();

        res.redirect("/orders");
    } catch (error) {
        next(error);
    }
};
