import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import User from "../../models/userModel.js";
import Order from "../../models/orderModel.js";
import Address from "../../models/addressModel.js";
import Return from "../../models/returnProductsModel.js";
import Banner from "../../models/bannerModel.js";
import { isLoggedIn, getCurrentUser } from "../../utils/getCurrentUser.js";

export const getHome = async (req, res, next) => {
    try {
        const foundProducts = await Product.find({ softDeleted: false }).populate("category").limit(6);
        const foundCategories = await Category.find({ removed: false });
        const currentBanner = await Banner.findOne({ isActive: true });
        res.render("customer/home", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            productDatas: foundProducts,
            categoryDatas: foundCategories,
            currentBanner,
            activePage: "Home",
        });
    } catch (error) {
        next(error)
    }
};

export const getAbout = async (req, res, next) => {
    try {
        res.render("customer/about", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            activePage: "About",
        });
    } catch {
        next(error);
    }
};

export const getContact = async (req, res, next) => {
    try {
        res.render("customer/contact", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            activePage: "Contact",
        });
    } catch (error) {
        next(error);
    }
};

export const getWishlist = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.session.user).populate("wishlist");
        res.render("customer/wishlist", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            activePage: "Wishlist",
        });
    } catch (error) {
        next(error);
    }
};

export const updateWishlist = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        if (req.body.todo === "add") {
            await currentUser.wishlist.push(req.body.productId);
        } else {
            const updatedWishlist = currentUser.wishlist.filter(
                (productId) => productId && !productId.equals(req.body.productId)
            );
            currentUser.wishlist = updatedWishlist;
        }

        await currentUser.save();

        if (req.body.goto) {
            return res.redirect("/wishlist");
        }

        return res.status(200).json({
            message: req.body.todo === "add" ? "added" : "removed",
            wishlistCount: currentUser.wishlist.length
        });
    } catch (error) {
        next(error);
    }
};

export const getReturnProductForm = async (req, res) => {
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
