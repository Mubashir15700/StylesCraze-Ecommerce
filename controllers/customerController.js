import mongoose from "mongoose";
import { sendToMail } from '../utils/sendMail.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Address from "../models/addressModel.js";
import Coupon from "../models/couponModel.js";
import { razorpay } from "../utils/razorpayConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        const foundCategories = await Category.find({ removed: false });

        res.render("customer/shop", {
            isLoggedIn: isLoggedIn(req, res),
            productDatas: foundProducts,
            currentUser: await getCurrentUser(req, res),
            category: { name: "Shop All", id: "" },
            categoryDatas: foundCategories,
            categoryBased: false,
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
            .populate('category')
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
                { name: { $regex: req.body.product, $options: 'i' } },
                { description: { $regex: `\\b${req.body.product}\\b`, $options: 'i' } },
            ]
        }).populate('category');

        const foundCategories = await Category.find({ removed: false });

        res.render("customer/shop", {
            isLoggedIn: isLoggedIn(req, res),
            productDatas: foundProducts,
            currentUser: await getCurrentUser(req, res),
            category: { name: "Shop All", id: "" },
            categoryDatas: foundCategories,
            categoryBased: false,
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
    const { profile, username, phone, email } = req.body;
    try {
        const currentUser = await User.findById(req.session.user);
        let updatedObj = {
            username, phone, email
        };

        updatedObj.profile = "/profiles/" + profile;

        await currentUser.updateOne(updatedObj);
        res.redirect("/profile");
    } catch (error) {
        next(error);
    }
};

export const getNewAddress = async (req, res, next) => {
    try {
        res.render("customer/address/newAddress", {
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
        res.render("customer/address/editAddress", {
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
        const { pincode, state, city, building, area } = req.body;
        if (!pincode || !state || !city || !building || !area) {
            const currentAddress = await Address.findOne({ _id: req.params.id });
            res.render("customer/address/editAddress", {
                isLoggedIn: isLoggedIn(req, res),
                currentUser: await getCurrentUser(req, res),
                currentAddress,
                error: "All fields are required."
            });
        } else {
            await Address.updateOne(
                {
                    _id: req.params.id,
                },
                {
                    $set: {
                        pincode,
                        state,
                        city,
                        building,
                        area,
                    },
                }
            );
            res.redirect("/profile");
        }
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
        res.render("customer/address/selectAddress", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            addresses,
        });
    } catch (error) {
        next(error);
    }
};

export const changeDefaultAddress = async (req, res, next) => {
    try {
        await Address.updateOne({ user: req.session.user, default: true }, { $set: { default: false } });
        await Address.findByIdAndUpdate(req.body.addressId, { $set: { default: true } });
        res.redirect("/checkout");
    } catch (error) {
        next(error);
    }
};

export const getChangePassword = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        res.render("customer/auth/changePassword", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            error: "",
            isForgotPassword: false,
            email: currentUser.email
        });
    } catch (error) {
        next(error);
    }
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
            message: req.body.todo === "add" ? "added" : "removed",
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
            grandTotal,
            insufficientStockProduct: '',
        });
    } catch (error) {
        next(error);
    }
};

export const addToCart = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        const { product, hiddenQuantity } = req.body;

        const existingCartItem = currentUser.cart.find(item => item.product.toString() === product);

        if (existingCartItem) {
            existingCartItem.quantity += parseInt(hiddenQuantity);
        } else {
            const cartItem = {
                product,
                quantity: parseInt(hiddenQuantity),
            };
            currentUser.cart.push(cartItem);
        }
        await currentUser.save();

        if (req.body.from) {
            res.redirect("/wishlist");
        } else {
            res.redirect("/shop");
        }
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

            let insufficientStock = false;
            if (product.stock < cartItem.quantity) {
                insufficientStock = true
            }

            await currentUser.populate('cart.product');
            const grandTotal = currentUser.cart.reduce((total, element) => {
                return total + (element.quantity * element.product.price);
            }, 0);
            await currentUser.save();
            return res.status(200).json({
                message: "Success",
                totalPrice: product.price * cartItem.quantity,
                grandTotal,
                insufficientStock,
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

            let insufficientStockProduct;
            cartProducts.forEach((cartProduct) => {
                if (cartProduct.product.stock < cartProduct.quantity) {
                    insufficientStockProduct = cartProduct._id;
                }
            });

            if (!insufficientStockProduct) {
                res.render("customer/checkout", {
                    isLoggedIn: isLoggedIn(req, res),
                    currentUser,
                    cartProducts,
                    currentAddress: defaultAddress,
                    discount: 0,
                    grandTotal,
                    currentCoupon: '',
                    couponError: '',
                });
            } else {
                res.render("customer/cart", {
                    isLoggedIn: isLoggedIn(req, res),
                    currentUser,
                    cartProducts,
                    grandTotal,
                    insufficientStockProduct,
                });
            }
        } else {
            req.body.email = currentUser.email;
            sendToMail(req, res, currentUser._id, false);
        }
    } catch (error) {
        next(error);
    }
};

export const applyCoupon = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.session.user).populate('earnedCoupons.coupon');
        await currentUser.populate('cart.product');
        await currentUser.populate('cart.product.category');
        const cartProducts = currentUser.cart;
        const defaultAddress = await Address.findOne({ user: req.session.user, default: true });
        const currentCoupon = await Coupon.findOne({ code: req.body.coupon });
        const grandTotal = cartProducts.reduce((total, element) => {
            return total + (element.quantity * element.product.price);
        }, 0);
        if (currentCoupon) {
            const foundCoupon = currentUser.earnedCoupons.find(coupon => coupon.coupon._id.equals(currentCoupon._id));
            if (foundCoupon) {
                if (foundCoupon.coupon.isActive) {
                    if (!foundCoupon.isUsed) {
                        let discount;
                        if (foundCoupon.coupon.discountType === 'fixedAmount') {
                            discount = foundCoupon.coupon.discountAmount;
                        } else {
                            discount = (foundCoupon.coupon.discountAmount / 100) * grandTotal;
                        }
                        res.render("customer/checkout", {
                            isLoggedIn: isLoggedIn(req, res),
                            currentUser,
                            cartProducts,
                            currentAddress: defaultAddress,
                            discount,
                            grandTotal,
                            currentCoupon: currentCoupon._id,
                            couponError: "",
                        });
                    } else {
                        res.render("customer/checkout", {
                            isLoggedIn: isLoggedIn(req, res),
                            currentUser,
                            cartProducts,
                            currentAddress: defaultAddress,
                            discount: 0,
                            grandTotal,
                            currentCoupon: '',
                            couponError: "Coupon already used.",
                        });
                    }
                } else {
                    res.render("customer/checkout", {
                        isLoggedIn: isLoggedIn(req, res),
                        currentUser,
                        cartProducts,
                        currentAddress: defaultAddress,
                        discount: 0,
                        grandTotal,
                        currentCoupon: '',
                        couponError: "Coupon is inactive.",
                    });
                }
            } else {
                res.render("customer/checkout", {
                    isLoggedIn: isLoggedIn(req, res),
                    currentUser,
                    cartProducts,
                    currentAddress: defaultAddress,
                    discount: 0,
                    grandTotal,
                    currentCoupon: '',
                    couponError: "Invalid coupon code.",
                });
            }
        } else {
            res.render("customer/checkout", {
                isLoggedIn: isLoggedIn(req, res),
                currentUser,
                cartProducts,
                currentAddress: defaultAddress,
                discount: 0,
                grandTotal,
                currentCoupon: '',
                couponError: "Invalid coupon code.",
            });
        }
    } catch (error) {
        next(error);
    }
};

export const placeOrder = async (req, res, next) => {
    try {
        if (req.body.method === 'cod') {
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
                totalAmount: grandTotal - req.body.discount + 5,
                paymentMethod: req.body.method,
                deliveryAddress,
            });
            await newOrder.save();

            // stock update
            currentUser.cart.forEach(async (item) => {
                const foundProduct = await Product.findById(item.product._id);
                foundProduct.stock -= item.quantity;
                await foundProduct.save();
            });
            currentUser.cart = [];

            const currentEarnedCoupon = await currentUser.earnedCoupons.find((coupon) => coupon.coupon.equals(req.body.currentCoupon));
            if (currentEarnedCoupon) {
                currentEarnedCoupon.isUsed = true;
                await Coupon.findByIdAndUpdate(req.body.currentCoupon, { $inc: { usedCount: 1 } });
            }

            await currentUser.save();

            res.redirect("/orders");
        } else if (req.body.method === 'rzp') {
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
            // Create a Razorpay order
            const razorpayOrder = await razorpay.orders.create({
                amount: (grandTotal - req.body.discount + 5) * 100, // Total amount in paise
                currency: 'INR', // Currency code (change as needed)
                receipt: `${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}${Date.now()}`, // Provide a unique receipt ID
            });
            // Save the order details to your database
            const newOrder = new Order({
                user: req.session.user,
                products: orderedProducts,
                totalAmount: grandTotal - req.body.discount + 5,
                paymentMethod: 'rzp', // Indicate the payment method
                deliveryAddress,
                razorpayOrderId: razorpayOrder.id, // Save the Razorpay order ID
            });
            await newOrder.save();

            // stock update
            currentUser.cart.forEach(async (item) => {
                const foundProduct = await Product.findById(item.product._id);
                foundProduct.stock -= item.quantity;
                await foundProduct.save();
            });

            const currentEarnedCoupon = await currentUser.earnedCoupons.find((coupon) => coupon.coupon.equals(req.body.currentCoupon));
            if (currentEarnedCoupon) {
                currentEarnedCoupon.isUsed = true;
                await Coupon.findByIdAndUpdate(req.body.currentCoupon, { $inc: { usedCount: 1 } });
            }

            currentUser.cart = [];

            // coupons
            const foundCoupon = await Coupon.findOne({ 
                isActive: true, minimumPurchaseAmount: { $lte: grandTotal } 
            }).sort({ minimumPurchaseAmount: -1 });
            if (foundCoupon) {
                const couponExists = currentUser.earnedCoupons.some((coupon) => coupon.coupon.equals(foundCoupon._id));
                if (!couponExists) {
                    currentUser.earnedCoupons.push({ coupon: foundCoupon._id });
                }
            }

            await currentUser.save();

            // Redirect the user to the Razorpay checkout page
            return res.render('customer/rzp', {
                order: razorpayOrder,
                key_id: process.env.RAZORPAY_ID_KEY,
                user: currentUser
            });
        }
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

export const getWallet = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        res.render("customer/wallet", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser
        });
    } catch (error) {
        next(error);
    }
}

export const getCoupons = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.session.user).populate('earnedCoupons.coupon');
        const allCoupons = await Coupon.find({ isActive: true });
        const earnedCoupons = currentUser.earnedCoupons;

        // Convert the list of earned coupon IDs to an array
        const earnedCouponIds = earnedCoupons.map((coupon) => coupon.coupon._id.toString());
        // Filter out earned coupons from the active coupons list
        const remainingCoupons = allCoupons.filter((coupon) => !earnedCouponIds.includes(coupon._id.toString()));

        res.render("customer/coupons", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            allCoupons: remainingCoupons,
            earnedCoupons,
        });
    } catch (error) {
        next(error);
    }
}

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