import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import { isLoggedIn, getCurrentUser } from "../../utils/getCurrentUser.js";

export const getShop = async (req, res, next) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const pageSize = 3;
        const skip = (page - 1) * pageSize;

        const totalProducts = await Product.countDocuments({
            softDeleted: false,
        });

        const totalPages = Math.ceil(totalProducts / pageSize);

        const foundProducts = await Product
            .find({ softDeleted: false })
            .populate("category")
            .skip(skip)
            .limit(pageSize);
        const foundCategories = await Category.find({ removed: false });
        res.render("customer/shop", {
            isLoggedIn: isLoggedIn(req, res),
            productDatas: foundProducts,
            currentUser: await getCurrentUser(req, res),
            category: { name: "Shop All", id: "" },
            categoryDatas: foundCategories,
            categoryBased: false,
            activePage: "Shop",
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryProducts = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const page = parseInt(req.params.page) || 1;
        const pageSize = 3;
        const skip = (page - 1) * pageSize;

        const foundProducts = await Product
            .find({ softDeleted: false, category: categoryId })
            .populate("category")
            .skip(skip)
            .limit(pageSize);

        const currentCategory = await Category.findById(categoryId);
        const foundCategories = await Category.find({ removed: false });

        const totalProductsInCategory = await Product.countDocuments({
            softDeleted: false,
            category: categoryId
        });

        const totalPages = Math.ceil(totalProductsInCategory / pageSize);

        res.render("customer/shop", {
            isLoggedIn: isLoggedIn(req, res),
            productDatas: foundProducts,
            currentUser: await getCurrentUser(req, res),
            currentPage: page,
            category: { name: currentCategory.name, id: currentCategory._id },
            categoryDatas: foundCategories,
            totalPages: totalPages,
            categoryBased: true,
            activePage: "Shop",
        });
    } catch (error) {
        next(error);
    }
};

export const getSingleProduct = async (req, res, next) => {
    try {
        const foundProduct = await Product.findById(req.params.id);
        res.render("customer/single", {
            isLoggedIn: isLoggedIn(req, res),
            productData: foundProduct,
            currentUser: await getCurrentUser(req, res),
            activePage: "Shop",
        });
    } catch (error) {
        next(error);
    }
};

export const searchProducts = async (req, res, next) => {
    try {
        const foundProducts = await Product.find({
            softDeleted: false,
            $or: [
                { name: { $regex: req.body.product, $options: "i" } },
                { description: { $regex: `\\b${req.body.product}\\b`, $options: "i" } },
            ]
        }).populate("category");

        const foundCategories = await Category.find({ removed: false });

        res.render("customer/shop", {
            isLoggedIn: isLoggedIn(req, res),
            productDatas: foundProducts,
            currentUser: await getCurrentUser(req, res),
            category: { name: "Shop All", id: "" },
            categoryDatas: foundCategories,
            categoryBased: false,
            activePage: "Shop",
            currentPage: 1,
            totalPages: 1,
        });
    } catch (error) {
        next(error);
    }
};

export const filterProducts = async (req, res, next) => {
    try {
        const data = req.body;
        const sizes = [];
        const colors = [];
        const searchText = data.search;
        const filterPrice = parseInt(data.filterPrice);

        let minPrice;
        let maxPrice
        if (filterPrice === 299) {
            minPrice = 0;
            maxPrice = 299;
        } else if (filterPrice === 900) {
            minPrice = 900;
            maxPrice = Number.POSITIVE_INFINITY;
        } else {
            minPrice = filterPrice;
            maxPrice = filterPrice + 199;
        }

        for (const key in data) {
            if (key.startsWith("size")) {
                sizes.push(data[key]);
            } else if (key.startsWith("color")) {
                colors.push(data[key]);
            }
        }

        const query = {
            softDeleted: false,
        };

        if (sizes.length) {
            query.$or = [
                { "size": { $in: sizes } }
            ]
        }

        if (colors.length) {
            query.$or = [
                { "color": { $in: colors } }
            ]
        }

        // Check if minPrice and maxPrice are provided, and include the price filter if they are
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            query.actualPrice = { $gte: minPrice, $lte: maxPrice }
        }

        // Check if searchText is provided, and include the name and description filters if it is
        if (searchText) {
            query.$or = [
                { name: { $regex: searchText, $options: "i" } },
                { description: { $regex: `\\b${searchText}\\b`, $options: "i" } }
            ];
        }

        const foundProducts = await Product.find(query).populate("category");
        const foundCategories = await Category.find({ removed: false });
        res.render("customer/shop", {
            isLoggedIn: isLoggedIn(req, res),
            productDatas: foundProducts,
            currentUser: await getCurrentUser(req, res),
            category: { name: "Shop All", id: "" },
            categoryDatas: foundCategories,
            categoryBased: false,
            activePage: "Shop",
            currentPage: 1,
            totalPages: 1,
        });
    } catch (error) {
        next(error);
    }
};
