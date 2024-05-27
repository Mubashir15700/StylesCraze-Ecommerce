import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import Banner from "../../models/bannerModel.js";
import { isLoggedIn, getCurrentUser } from "../../utils/currentUserUtil.js";
import catchAsync from "../../utils/catchAsyncUtil.js";

export const getHome = catchAsync(async (req, res, next) => {
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
});

export const getAbout = catchAsync(async (req, res, next) => {
    res.render("customer/about", {
        isLoggedIn: isLoggedIn(req, res),
        currentUser: await getCurrentUser(req, res),
        activePage: "About",
    });
});

export const getContact = catchAsync(async (req, res, next) => {
    res.render("customer/contact", {
        isLoggedIn: isLoggedIn(req, res),
        currentUser: await getCurrentUser(req, res),
        activePage: "Contact",
    });
});
