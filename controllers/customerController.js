import mongoose from "mongoose";
import { sendToMail } from '../utils/sendMail.js';
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Address from "../models/addressModel.js";

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
        const addresses = await Address.find({ user: req.session.user });
        res.render("customer/profile", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            error: "",
            addresses
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const addresses = await Address.find({ user: req.session.user });
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
            error: "",
            addresses
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
            const otherAddress = await Address.find({ user: req.session.user });
            const newAddress = new Address({
                user: req.session.user,
                pincode,
                state,
                city,
                building,
                area,
                default: (otherAddress.length === 0) ? true : false,
            });
            await newAddress.save();
            res.redirect("/profile");
        }
    } catch (error) {
        next(error);
    }
};

export const getEditAddress = async (req, res, next) => {
    try {
        const currentAddress = await Address.findOne({ _id: req.params.id });
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
        await Address.updateOne(
            {
                _id: req.params.id,
            },
            {
                $set: {
                    pincode: updatedAddressData.pincode,
                    state: updatedAddressData.state,
                    city: updatedAddressData.city,
                    building: updatedAddressData.building,
                    area: updatedAddressData.area,
                },
            }
        );
        res.redirect("/profile");
    } catch (error) {
        next(error);
    }
};

export const deleteAddress = async (req, res, next) => {
    try {
        await Address.deleteOne({ _id: req.params.id });

        res.redirect("/profile");
    } catch (error) {
        next(error);
    }
};

export const getAddresses = async (req, res, next) => {
    try {
        const addresses = await Address.find({ user: req.session.user });
        res.render("customer/selectAddress", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            addresses,
        });
    } catch (error) {
        next(error);
    }
};

export const changeAddress = async (req, res, next) => {
    try {
        await Address.updateOne({ user: req.session.user, default: true }, { $set: { default: false } });
        await Address.findByIdAndUpdate(req.body.addressId, { $set: { default: true } });
        res.redirect("/checkout");
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
            message: req.body.todo === "add"? "added" : "removed",
        });
    } catch (error) {
        next(error);
    }
};

export const getWishlist = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.session.user).populate('wishlist');
        res.render("customer/wishlist", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
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
        res.redirect("/shop");
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

            res.redirect("/cart");
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

export const getCheckout = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        if (currentUser.verified) {
            const defaultAddress = await Address.findOne({ user: req.session.user, default: true });
            await currentUser.populate('cart.product');
            await currentUser.populate('cart.product.category');
            const cartProducts = currentUser.cart;
            const grandTotal = cartProducts.reduce((total, element) => {
                return total + (element.quantity * element.product.price);
            }, 0);
            res.render("customer/checkout", {
                isLoggedIn: isLoggedIn(req, res),
                currentUser,
                cartProducts,
                currentAddress: defaultAddress,
                grandTotal
            });
        } else {
            req.body.email = currentUser.email;
            sendToMail(req, res, currentUser._id, false);
        }
    } catch (error) {
        next(error);
    }
};

export const placeOrder = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        const deliveryAddress = await Address.findOne({ user: req.session.user, default: true });
        await currentUser.populate('cart.product');
        const grandTotal = currentUser.cart.reduce((total, element) => {
            return total + (element.quantity * element.product.price);
        }, 0);
        const orderedProducts = currentUser.cart.map((item) => {
            return {
                product: item.product._id,
                quantity: item.quantity,
            }
        });
        const newOrder = new Order({
            user: req.session.user,
            products: orderedProducts,
            totalAmount: grandTotal + 5,
            paymentMethod: req.body.method,
            deliveryAddress: deliveryAddress._id
        });
        await newOrder.save();

        currentUser.cart.forEach(async (item) => {
            const foundProduct = await Product.findById(item.product._id);
            foundProduct.stock -= item.quantity;
            await foundProduct.save();
        });

        currentUser.cart = [];
        await currentUser.save();
        res.redirect("/orders");
    } catch (error) {
        next(error);
    }
};

export const getOrders = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.session.user);

        const orders = await Order.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.session.user) } },
            { $unwind: "$products" },
            {
                $lookup: {
                    from: "products",
                    localField: "products.product",
                    foreignField: "_id",
                    as: "orderedProducts"
                }
            },
            {
                $lookup: {
                    from: "addresses",
                    localField: "deliveryAddress",
                    foreignField: "_id",
                    as: "deliveryAddress"
                }
            },
            { $sort: { orderDate: -1 } }
        ]);
        res.render("customer/orders", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            orders
        });
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req, res, next) => {
    try {
        const foundOrder = await Order.findById(req.body.orderId).populate('products.product');
        const foundProduct = foundOrder.products.find((order) => order.product._id.toString() === req.body.productId);
        foundProduct.isCancelled = true;

        const foundOrderTest = foundOrder.products.find((order) => order.product._id.toString() === req.body.productId);
        const foundProductTest = await Product.findById(req.body.productId);
        const currentStock = foundProductTest.stock;
        foundProductTest.stock = currentStock + foundOrderTest.quantity;

        await foundProductTest.save();
        await foundOrder.save();

        res.redirect("/orders");
    } catch (error) {
        next(error);
    }
};