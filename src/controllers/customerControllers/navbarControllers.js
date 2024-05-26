import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import Banner from "../../models/bannerModel.js";
import { isLoggedIn, getCurrentUser } from "../../utils/currentUserUtil.js";

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
