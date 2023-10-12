import Category from '../../models/categoryModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getCategories = async (req, res, next) => {
    try {
        // pagination
        const page = parseInt(req.params.page) || 1;
        const pageSize = 3;
        const skip = (page - 1) * pageSize;
        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / pageSize);

        let foundCategories;
        if (req.query.search) {
            foundCategories = await Category.find({
                $or: [
                    { name: { $regex: req.body.searchQuery, $options: 'i' } }
                ]
            });

            return res.status(200).json({
                categoryDatas: foundCategories,
            });
        } else {
            foundCategories = await Category.find().skip(skip).limit(pageSize);
        }

        res.render('admin/categories/categories', {
            categoryDatas: foundCategories,
            activePage: 'Categories',
            filtered: req.query.search ? true : false,
            currentPage: page || 1,
            totalPages: totalPages || 1,
        });
    } catch (error) {
        next(error);
    }
};

export const newCategory = (req, res) => {
    res.render('admin/categories/newCategory', {
        error: "",
        activePage: 'Categories'
    });
};

export const addNewCategory = async (req, res, next) => {
    try {
        const { name, photo } = req.body;
        if (!name || !photo) {
            res.render('admin/categories/newCategory', {
                error: "All fields are required.",
                activePage: 'Categories'
            });
        }
        await Category.create({
            name,
            image: "/categories/" + photo,
        });
        res.redirect('/admin/categories/1');
    } catch (error) {
        let foundError = false;
        let errorMessage;
        if (error.code === 11000) {
            foundError = true;
            errorMessage = "Category with the name already exist.";
        } else if (error.message.includes("Category validation failed: name: Path `name`")) {
            foundError = true;
            errorMessage = "Category name length should be between 4 and 20 characters.";
        } else if (error.message.includes("Category validation failed: name: Category name must not contain special characters")) {
            foundError = true;
            errorMessage = error.message
        }
        if (foundError) {
            res.render('admin/categories/newCategory', {
                error: errorMessage,
                activePage: 'Categories'
            });
        } else {
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
            res.render('admin/categories/editCategory', {
                categoryData: foundCategory,
                error: "",
                activePage: 'Categories'
            });
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
        res.redirect("/admin/categories/1");
    } catch (error) {
        let foundError = false;
        let errorMessage;
        if (error.code === 11000) {
            foundError = true;
            errorMessage = "Category with the name already exist.";
        } else if (error.message.includes("is longer than the maximum allowed length (20)")) {
            foundError = true;
            errorMessage = "Category name length should be between 4 and 20 characters.";
        } else if (error.message.includes("Category name must not contain special characters")) {
            foundError = true;
            errorMessage = error.message;
        }
        if (foundError) {
            res.render('admin/categories/editCategory', {
                categoryData: foundCategory,
                error: errorMessage,
                activePage: 'Categories'
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
        res.redirect('/admin/categories/1');
    } catch (error) {
        next(error);
    }
}