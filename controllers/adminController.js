import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';

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

export const getOrders = (req, res) => {
    res.render('admin/orders');
};

export const getProducts = async (req, res) => {
    try {
        const foundProducts = await Product.find({}).populate('category');
        res.render('admin/products/products', { productDatas: foundProducts });
    } catch (error) {
        console.log(error);
    }
};

export const newProduct = async (req, res) => {
    try {
        const foundCategories = await Category.find({}, { name: 1 });
        res.render('admin/products/newProduct', { categoryOptions: foundCategories });
    } catch (error) {
        console.log(error);
    }
};

export const addNewProduct = async (req, res) => {
    const { name, category, description, price, stock, images } = req.body;
    try {
        if (!name || !description || !category || !price || !stock || !images) {
            res.status(500).json({
                status: 'FAILED',
                message: 'All fields are required',
            });
        } else {
            const imagesWithPath = images.map(img => '/products/' + img);
            await Product.create({
                name,
                description,
                stock,
                price,
                category,
                images: imagesWithPath,
            });
        }
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message)
    }
};

export const getProduct = async (req, res) => {
    try {
        const foundProduct = await Product.findById(req.params.id);
        const foundCategories = await Category.find({}, { name: 1 });
        res.render('admin/products/editProduct', { productData: foundProduct, categoryOptions: foundCategories });
    } catch (error) {
        console.log(error);
    }
};

export const editProduct = (req, res) => {
    console.log(req.body);
};

export const deleteImage = async (req, res) => {
    const { id } = req.params;
    const { image } = req.body;
    try {
        await Product.findByIdAndUpdate(id, { $pull: { images: image } }, { new: true });

        fs.unlink(path.join(__dirname, '../public', image), (err) => {
            if (err) console.log(err);
        });

        res.redirect(`/admin/edit-product/${id}`);
    } catch (error) {
        console.log(error);
    }
};

export const addImage = async (req, res) => {
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
        console.log(error);
    }
};

export const productAction = async (req, res) => {
    try {
        let state = req.body.state === "1";
        await Product.findByIdAndUpdate(req.params.id, { $set: { softDeleted: state } });
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error);
    }
};

export const getCategories = async (req, res) => {
    try {
        const foundCategories = await Category.find();
        res.render('admin/categories/categories', { categoryDatas: foundCategories });
    } catch (error) {
        console.log(error);
    }
};

export const newCategory = (req, res) => {
    res.render('admin/categories/newCategory');
};

export const addNewCategory = async (req, res) => {
    try {
        const { name, photo } = req.body;
        if (!name || !photo) {
            res.status(500).json({
                status: 'FAILED',
                message: 'Name and Photo are required',
            });
        }
        await Category.create({
            name,
            image: "/categories/" + photo,
        });
        res.redirect('/admin/categories');
    } catch (error) {
        console.log(error.message);
    }
};

export const getCategory = async (req, res) => {
    try {
        const foundCategory = await Category.findById(req.params.id);
        if (!foundCategory) {
            console.log("no data found");
        } else {
            res.render('admin/categories/editCategory', { categoryData: foundCategory });
        }
    } catch (error) {
        console.log(error);
    }
};

export const editCategory = async (req, res) => {
    const { id } = req.params;
    const { name, photo } = req.body;
    try {
        const category = await Category.findById(id);

        if (!category) {
            console.log("err1");
        }

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

        await category.updateOne(updatedObj);
        res.redirect("/admin/categories");
    } catch (error) {
        console.error(error.message);
    }
};

export const categoryAction = async (req, res) => {
    try {
        let state = req.body.state === "1";
        await Category.findByIdAndUpdate(req.params.id, { $set: { removed: state } });
        res.redirect('/admin/categories');
    } catch (error) {
        console.log(error);
    }
}

export const getCustomers = async (req, res) => {
    try {
        const foundCustomers = await User.find();
        res.render('admin/customers', { customerDatas: foundCustomers });
    } catch (error) {
        console.log(error);
    }
};

export const customerAction = async (req, res) => {
    try {
        let state = req.body.state === "1";
        await User.findByIdAndUpdate(req.params.id, { $set: { blocked: state } });
        res.redirect('/admin/customers');
    } catch (error) {
        console.log(error);
    }
};

export const getSalesReport = (req, res) => {
    res.render('admin/salesReport');
};

export const getBanner = (req, res) => {
    res.render('admin/banner');
};