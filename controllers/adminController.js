import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Coupon from '../models/couponModel.js';
import { newProductErrorPage, editProductErrorPage } from '../middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getLogin = (req, res) => {
    res.render('admin/login', { commonError: "" });
};

export const getDashboard = (req, res) => {
    res.render('admin/dashboard');
};

export const getNotifications = (req, res) => {
    res.render('admin/notifications');
};

export const getProfile = (req, res) => {
    res.render('admin/profile');
};

export const getProducts = async (req, res, next) => {
    try {
        const foundProducts = await Product.find({}).populate('category');
        res.render('admin/products/products', { productDatas: foundProducts });
    } catch (error) {
        next(error);
    }
};

export const getAddNewProduct = async (req, res, next) => {
    try {
        const foundCategories = await Category.find({}, { name: 1 });
        res.render('admin/products/newProduct', {
            categoryOptions: foundCategories,
            error: "",
        });
    } catch (error) {
        next(error);
    }
};

export const addNewProduct = async (req, res, next) => {
    const { name, category, description, price, stock, size, color, images } = req.body;
    const foundCategories = await Category.find({}, { name: 1 });
    try {
        if (!name || !description || !category || !price || !stock || !size || !color || !images) {
            res.render('admin/products/newProduct', {
                categoryOptions: foundCategories,
                error: "All fields are required.",
            });
        } else {
            const imagesWithPath = images.map(img => '/products/' + img);

            await Product.create({
                name,
                description,
                stock,
                price,
                category,
                size,
                color,
                images: imagesWithPath,
            });

            await Category.findByIdAndUpdate(req.body.category, { $inc: { productsCount: 1 } });
        }
        res.redirect('/admin/products');
    } catch (error) {
        if (error.code === 11000) {
            newProductErrorPage(req, res, "Product with the name already exist.", foundCategories);
        } else if (error.message.includes("Product validation failed: name: Path `name`")) {
            newProductErrorPage(req, res, "Product name length should be between 2 and 20 characters.", foundCategories);
        } else if (error.message.includes("Product validation failed: name: Product name must not contain special characters")) {
            newProductErrorPage(req, res, "Product name must not contain special characters.", foundCategories);
        } else if (error.message.includes("is longer than the maximum allowed length (200).")) {
            newProductErrorPage(req, res, "Product description length should be between 4 and 200 characters.", foundCategories);
        } else if (
            error.message.includes("Product validation failed: price: Path `price`") ||
            error.message.includes("Product validation failed: stock: Path `stock`")) {
            newProductErrorPage(req, res, "Price and Stock values should not be negative.", foundCategories);
        } else {
            next(error);
        }
    }
};

export const getProduct = async (req, res, next) => {
    try {
        const foundProduct = await Product.findById(req.params.id);
        const foundCategories = await Category.find({}, { name: 1 });
        res.render('admin/products/editProduct', {
            productData: foundProduct,
            categoryOptions: foundCategories,
            error: ""
        });
    } catch (error) {
        next(error);
    }
};

export const editProduct = async (req, res, next) => {
    const foundProduct = await Product.findById(req.params.id);
    const foundCategories = await Category.find({}, { name: 1 });
    try {
        await Product.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                category: req.body.category,
                description: req.body.description,
                price: req.body.price,
                stock: req.body.stock,
                size: req.body.size,
                color: req.body.color
            }
        }, { runValidators: true });
        res.redirect("/admin/products");
    } catch (error) {
        if (error.code === 11000) {
            editProductErrorPage(req, res, "Product with the name already exist.", foundProduct, foundCategories);
        } else if (error.message.includes("Validation failed: name: Path `name`")) {
            editProductErrorPage(req, res, "Product name length should be between 4 and 20 characters.", foundProduct, foundCategories);
        } else if (error.message.includes("Validation failed: name: Product name must not contain special characters")) {
            editProductErrorPage(req, res, "Product name must not contain special characters.", foundProduct, foundCategories);
        } else if (error.message.includes("is longer than the maximum allowed length (200).")) {
            editProductErrorPage(req, res, "Product description length should be between 4 and 200 characters.", foundProduct, foundCategories);
        } else if (
            error.message.includes("Validation failed: price: Path `price`") ||
            error.message.includes("Validation failed: stock: Path `stock`")) {
            editProductErrorPage(req, res, "Price and Stock values should not be negative.", foundProduct, foundCategories);
        } else {
            next(error);
        }
    }
};

export const deleteImage = async (req, res, next) => {
    const { id } = req.params;
    const { image } = req.body;
    try {
        await Product.findByIdAndUpdate(id, { $pull: { images: image } }, { new: true });

        fs.unlink(path.join(__dirname, '../public', image), (err) => {
            if (err) console.log(err);
        });

        res.redirect(`/admin/edit-product/${id}`);
    } catch (error) {
        next(error);
    }
};

export const addImage = async (req, res, next) => {
    const { id } = req.params;
    const { images } = req.body;
    let imagesWithPath;
    if (images && images.length) {
        imagesWithPath = images.map(image => '/products/' + image);
    }
    try {
        await Product.findByIdAndUpdate(id, { $push: { images: imagesWithPath } }, { new: true });
        res.redirect(`/admin/edit-product/${id}`);
    } catch (error) {
        next(error);
    }
};

export const productAction = async (req, res, next) => {
    try {
        const state = req.body.state === "1";
        await Product.findByIdAndUpdate(req.params.id, { $set: { softDeleted: state } });
        if (state === true) {
            await Category.findOneAndUpdate({ name: req.body.category }, { $inc: { productsCount: -1 } });
        } else {
            await Category.findOneAndUpdate({ name: req.body.category }, { $inc: { productsCount: 1 } });
        }
        res.redirect('/admin/products');
    } catch (error) {
        next(error);
    }
};

export const getCategories = async (req, res, next) => {
    try {
        const foundCategories = await Category.find();
        res.render('admin/categories/categories', { categoryDatas: foundCategories });
    } catch (error) {
        next(error);
    }
};

export const newCategory = (req, res) => {
    res.render('admin/categories/newCategory', { error: "" });
};

export const addNewCategory = async (req, res, next) => {
    try {
        const { name, photo } = req.body;
        if (!name || !photo) {
            res.render('admin/categories/newCategory', { error: "All fields are required." });
        }
        await Category.create({
            name,
            image: "/categories/" + photo,
        });
        res.redirect('/admin/categories');
    } catch (error) {
        if (error.code === 11000) {
            res.render('admin/categories/newCategory', { error: "Category with the name already exist." });
        } else if (error.message.includes("Category validation failed: name: Path `name`")) {
            res.render('admin/categories/newCategory', {
                error: "Category name length should be between 4 and 20 characters."
            });
        } else if (error.message.includes("Category validation failed: name: Category name must not contain special characters")) {
            res.render('admin/categories/newCategory', {
                error: error.message
            });
        }
        else {
            next(error);
        }
    }
};

export const getCategory = async (req, res, next) => {
    try {
        const foundCategory = await Category.findById(req.params.id);
        if (!foundCategory) {
            console.log("no category found");
        } else {
            res.render('admin/categories/editCategory', { categoryData: foundCategory, error: "" });
        }
    } catch (error) {
        next(error);
    }
};

export const editCategory = async (req, res, next) => {
    const { id } = req.params;
    const { name, photo } = req.body;
    const foundCategory = await Category.findById(req.params.id);
    try {
        const category = await Category.findById(id);

        let updatedObj = {
            name,
        };

        if (typeof photo !== "undefined") {
            fs.unlink(path.join(__dirname, "../public", category.image), (err) => {
                if (err) {
                    console.error(err);
                }
            });
            updatedObj.image = "/categories/" + photo;
        }

        await category.updateOne(updatedObj, { runValidators: true });
        res.redirect("/admin/categories");
    } catch (error) {
        if (error.code === 11000) {
            res.render('admin/categories/editCategory', {
                categoryData: foundCategory,
                error: "Category with the name already exist."
            });
        } else if (error.message.includes("is longer than the maximum allowed length (20)")) {
            res.render('admin/categories/editCategory', {
                categoryData: foundCategory,
                error: "Category name length should be between 4 and 20 characters."
            });
        } else if (error.message.includes("Category name must not contain special characters")) {
            res.render('admin/categories/editCategory', {
                categoryData: foundCategory,
                error: error.message
            });
        } else {
            next(error);
        }
    }
};

export const categoryAction = async (req, res, next) => {
    try {
        const state = req.body.state === "1";
        await Category.findByIdAndUpdate(req.params.id, { $set: { removed: state } });
        res.redirect('/admin/categories');
    } catch (error) {
        next(error);
    }
}

export const getCustomers = async (req, res, next) => {
    try {
        const foundCustomers = await User.find();
        res.render('admin/customers', { customerDatas: foundCustomers });
    } catch (error) {
        next(error);
    }
};

export const customerAction = async (req, res, next) => {
    try {
        const state = req.body.state === "1";
        const customerId = req.params.id;
        await User.findByIdAndUpdate(customerId, { $set: { blocked: state } });
        res.redirect('/admin/customers');
    } catch (error) {
        next(error);
    }
};

export const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate([
            { path: 'user' },
            { path: 'products.product' },
        ]);
        res.render('admin/orders', { orders });
    } catch (error) {
        next(error);
    }
};

export const getCoupons = async (req, res, next) => {
    try {
        const foundCoupons = await Coupon.find();
        res.render('admin/coupons/coupons', { foundCoupons });
    } catch (error) {
        next(error);
    }
};

export const getAddNewCoupon = (req, res) => {
    res.render('admin/coupons/newCoupon', { error: "" });
};

export const addNewCoupon = async (req, res, next) => {
    try {
        const { description, discountType, discountAmount, minimumPurchaseAmount, usageLimit } = req.body;
        if (!description || !discountType || !discountAmount || !minimumPurchaseAmount || !usageLimit) {
            res.render('admin/coupons/newCoupon', { error: "All fields are required" });
        } else {
            if (description.length < 4 || description.length > 100) {
                return res.render('admin/coupons/newCoupon', { error: "Description must be between 4 and 100 characters" });
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
                
                res.redirect("/admin/coupons");
            }
        }
    } catch (error) {
        next(error);
    }
};

function generateCouponCode() {

    const codeRegex = /^[A-Z0-9]{5,15}$/;
    let code = '';
    while (!codeRegex.test(code)) {
        code = Math.random().toString(36).substring(7);
    }
    return Coupon.findOne({ code })
        .then(existingCoupon => {
            if (existingCoupon) {
                return generateCouponCode();
            }
            return code;
        });
}

export const couponAction = async (req, res, next) => {
    try {
        const state = req.body.state === "";
        const couponId = req.params.id;
        await Coupon.findByIdAndUpdate(couponId, { $set: { isActive: state } });
        res.redirect('/admin/coupons');
    } catch (error) {
        next(error);
    }
};

export const getSalesReport = (req, res) => {
    res.render('admin/salesReports');
};

export const getBanner = (req, res) => {
    res.render('admin/banners');
};