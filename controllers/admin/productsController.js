import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Category from '../../models/categoryModel.js';
import Product from '../../models/productModel.js';
import { newProductErrorPage, editProductErrorPage } from '../../middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getProducts = async (req, res, next) => {
    try {
        const foundProducts = await Product.find({}).populate('category');
        res.render('admin/products/products', { 
            productDatas: foundProducts,
            activePage: 'Products' 
        });
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
            activePage: 'Products'
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
                activePage: 'Products'
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
            error: "",
            activePage: 'Products'
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

        const currentCategory = await Category.findById(foundProduct.category);
        const newCategoryId = await Product.findById(req.params.id);
        const newCategory = await Category.findById(newCategoryId.category);
        if (currentCategory._id.toString() !== newCategory._id.toString()) {
            currentCategory.productsCount -= 1;
            newCategory.productsCount += 1;
        }

        await currentCategory.save();
        await newCategory.save();

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

// causing an error
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