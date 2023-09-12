import mongoose from "mongoose";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";

const isLoggedIn = (req, res) => {
    if (req.session.user) {
        return true
    } else {
        return false;
    }
};

const getCurrentUser = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.session.user) || "";
        return currentUser;
    } catch (error) {
        next(error);
    }
};

export const getHome = async (req, res, next) => {
    try {
        const foundProducts = await Product.find({ softDeleted: false }).populate('category');
        const foundCategories = await Category.find({ removed: false });
        res.render("customer/home", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            productDatas: foundProducts,
            categoryDatas: foundCategories
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
        });
    } catch {
        next(error);
    }
};

export const getShop = async (req, res, next) => {
    try {
        const foundProducts = await Product.find({ softDeleted: false }).populate('category');
        const currentPage = parseInt(req.query.page) || 1;
        const foundCategories = await Category.find({ removed: false });
        res.render("customer/shop", {
            isLoggedIn: isLoggedIn(req, res),
            productDatas: foundProducts,
            currentUser: await getCurrentUser(req, res),
            currentPage,
            categoryName: "Shop All",
            categoryDatas: foundCategories
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryProducts = async (req, res, next) => {
    try {
        const foundProducts = await Product.find({
            softDeleted: false, category: req.params.id
        }).populate('category');
        const currentPage = parseInt(req.query.page) || 1;
        const currentCategory = await Category.findById(req.params.id);
        const foundCategories = await Category.find({ removed: false });
        res.render("customer/shop", {
            isLoggedIn: isLoggedIn(req, res),
            productDatas: foundProducts,
            currentUser: await getCurrentUser(req, res),
            currentPage,
            categoryName: currentCategory.name,
            categoryDatas: foundCategories
        });
    } catch (error) {
        next(error);
    }
};

export const getSingle = async (req, res, next) => {
    try {
        const foundProduct = await Product.findById(req.params.id);
        res.render("customer/single", {
            isLoggedIn: isLoggedIn(req, res),
            productData: foundProduct,
            currentUser: await getCurrentUser(req, res),
        });
    } catch (error) {
        next(error);
    }
};

export const getContact = async (req, res, next) => {
    try {
        res.render("customer/contact", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
        });
    } catch (error) {
        next(error);
    }
};

export const getLogin = (req, res) => {
    res.render("customer/auth/login", { commonError: "" });
};

export const getRegister = (req, res) => {
    res.render("customer/auth/register", { commonError: "" });
};

export const getEnterEmail = (req, res) => {
    res.render("customer/auth/forgot", { commonError: "" });
};

export const getProfile = async (req, res, next) => {
    try {
        res.render("customer/profile", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            error: ""
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { profile, username, phone, email } = req.body;
        await User.updateOne({ _id: req.session.user }, {
            $set: {
                profile,
                username,
                phone,
                email
            }
        });
        res.render("customer/profile", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            error: ""
        });
    } catch (error) {
        next(error);
    }
};

export const getNewAddress = async (req, res, next) => {
    try {
        res.render("customer/newAddress", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            error: ""
        });
    } catch (error) {
        next(error);
    }
};

export const addNewAddress = async (req, res, next) => {
    try {
        const { pincode, state, city, building, area } = req.body;
        if (pincode, state, city, building, area) {
            const currentUser = await getCurrentUser(req, res);
            currentUser.address.push({
                pincode,
                state,
                city,
                building,
                area
            });
            await currentUser.save();
            res.render("customer/profile", {
                isLoggedIn: isLoggedIn(req, res),
                currentUser: await getCurrentUser(req, res),
                error: ""
            });
        } else {
            res.render("customer/newAddress", {
                isLoggedIn: isLoggedIn(req, res),
                currentUser: await getCurrentUser(req, res),
                error: "All fields are required"
            });
        }
    } catch (error) {
        next(error);
    }
};

export const getEditAddress = async (req, res, next) => {
    try {
        const currentAddress = await User.findOne({ _id: req.session.user, 'address._id': req.params.id },
            {
                'address.$': 1,
                _id: 0
            });
        res.render("customer/editAddress", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            currentAddress,
            error: ""
        });
    } catch (error) {
        next(error);
    }
};

export const editAddress = async (req, res, next) => {
    try {
        const updatedAddressData = {
            pincode: req.body.pincode,
            state: req.body.state,
            city: req.body.city,
            building: req.body.building,
            area: req.body.area,
        };
        await User.updateOne(
            {
                _id: req.session.user,
                'address._id': req.params.id,
            },
            {
                $set: {
                    'address.$.pincode': updatedAddressData.pincode,
                    'address.$.state': updatedAddressData.state,
                    'address.$.city': updatedAddressData.city,
                    'address.$.building': updatedAddressData.building,
                    'address.$.area': updatedAddressData.area,
                },
            }
        );
        res.render("customer/profile", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            error: ""
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAddress = async (req, res, next) => {
    try {
        await User.updateOne(
            {
                _id: req.session.user,
            },
            {
                $pull: {
                    address: { _id: req.params.id },
                },
            }
        );
        res.render("customer/profile", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            error: ""
        });
    } catch (error) {
        next(error);
    }
};

export const getChangePassword = async (req, res) => {
    let currentUser = await getCurrentUser(req, res);
    res.render("customer/auth/changePassword", {
        isLoggedIn: isLoggedIn(req, res),
        currentUser: await getCurrentUser(req, res),
        error: "",
        isForgotPassword: false,
        email: currentUser.email
    });
};

export const getOrders = async (req, res, next) => {
    try {
        res.render("customer/orders", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
        });
    } catch (error) {
        next(error);
    }
};

export const getWishlist = async (req, res, next) => {
    try {
        res.render("customer/wishlist", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
        });
    } catch (error) {
        next(error);
    }
};

export const getCart = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        await currentUser.populate('cart.product');
        await currentUser.populate('cart.product.category');
        const cartProducts = currentUser.cart;
        const grandTotal = cartProducts.reduce((total, element) => {
            return total + (element.quantity * element.product.price);
        }, 0);
        res.render("customer/cart", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            cartProducts,
            grandTotal
        });
    } catch (error) {
        next(error);
    }
};

export const removeFromCart = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        const cartItemIndex = currentUser.cart.findIndex(item => item._id.toString() === req.params.id);

        if (cartItemIndex !== -1) {
            currentUser.cart.splice(cartItemIndex, 1);
            await currentUser.save();

            res.render("customer/cart", {
                isLoggedIn: isLoggedIn(req, res),
                currentUser,
                cartProducts: currentUser.cart
            });
        } else {
            console.log('Cart item not found in the user\'s cart');
        }
    } catch (error) {
        next(error);
    }
};

export const updateCart = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        const cartItem = currentUser.cart.find(item => item._id.equals(new mongoose.Types.ObjectId(req.params.id)));
        if (cartItem) {
            const product = await Product.findById(cartItem.product);
            if (req.body.type === "increment") {
                cartItem.quantity++;
            } else {
                if (cartItem.quantity !== 1) {
                    cartItem.quantity--;
                }
            }
            await currentUser.populate('cart.product');
            const grandTotal = currentUser.cart.reduce((total, element) => {
                return total + (element.quantity * element.product.price);
            }, 0);
            await currentUser.save();
            return res.status(200).json({
                message: "Success",
                totalPrice: product.price * cartItem.quantity,
                grandTotal
            });
        } else {
            return res.status(404).json({ message: "Product not found in the user's cart." });
        }
    } catch (error) {
        next(error)
    }
};

export const addToCart = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        const { product, quantity } = req.body;

        const existingCartItem = currentUser.cart.find(item => item.product.toString() === product);

        if (existingCartItem) {
            existingCartItem.quantity += parseInt(quantity);
        } else {
            const cartItem = {
                product,
                quantity: parseInt(quantity),
            };
            currentUser.cart.push(cartItem);
        }
        await currentUser.save();
    } catch (error) {
        next(error);
    }
};