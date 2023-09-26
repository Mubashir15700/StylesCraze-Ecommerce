import Category from '../../models/categoryModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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