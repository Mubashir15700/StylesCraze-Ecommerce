import mongoose from "mongoose";
import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import User from "../../models/userModel.js";
import Order from "../../models/orderModel.js";
import Address from "../../models/addressModel.js";
import Coupon from "../../models/couponModel.js";
import Return from "../../models/returnProductsModel.js";
import Banner from "../../models/bannerModel.js";
import { razorpay } from "../../utils/razorpayConfig.js";
import { isLoggedIn, getCurrentUser } from '../getCurrentUser.js';

export const getHome = async (req, res, next) => {
    try {
        const foundProducts = await Product.find({ softDeleted: false }).populate('category').limit(6);
        const foundCategories = await Category.find({ removed: false });
        const currentBanner = await Banner.findOne({ isActive: true });
        res.render("customer/home", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            productDatas: foundProducts,
            categoryDatas: foundCategories,
            currentBanner,
            activePage: 'Home',
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
            activePage: 'About',
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
            activePage: 'Shop',
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
            activePage: 'Shop',
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
            activePage: 'Shop',
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
            activePage: 'Shop',
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
            if (key.startsWith('size')) {
                sizes.push(data[key]);
            } else if (key.startsWith('color')) {
                colors.push(data[key]);
            }
        }

        const foundProducts = await Product.find({
            softDeleted: false,
            $or: [
                { 'size': { $in: sizes } },
                { 'color': { $in: colors } }
            ],
            $or: [
                { name: { $regex: searchText, $options: 'i' } },
                { description: { $regex: `\\b${searchText}\\b`, $options: 'i' } },
            ],
            $and: [
                { price: { $gte: minPrice } },
                { price: { $lte: maxPrice } }
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
            activePage: 'Shop',
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
            activePage: 'Contact',
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
            activePage: 'Wishlist',
        });
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
                            error: "",
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
                            error: "",
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
                        error: "",
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
                    error: "",
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
                error: "",
            });
        }
    } catch (error) {
        next(error);
    }
};

export const placeOrder = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        await currentUser.populate('cart.product');
        const deliveryAddress = await Address.findOne({ user: req.session.user, default: true });

        const grandTotal = currentUser.cart.reduce((total, element) => {
            return total + (element.quantity * element.product.price);
        }, 0);

        const orderedProducts = currentUser.cart.map((item) => {
            return {
                product: item.product._id,
                quantity: item.quantity,
            }
        });

        let newOrder = new Order({
            user: req.session.user,
            products: orderedProducts,
            totalAmount: grandTotal - req.body.discount + 5,
            paymentMethod: req.body.method,
            deliveryAddress,
        });

        if (req.body.method === 'cod') {
            await newOrder.save();
        } else if (req.body.method === 'rzp') {
            // Create a Razorpay order
            const razorpayOrder = await razorpay.orders.create({
                amount: (grandTotal - req.body.discount + 5) * 100, // Total amount in paise
                currency: 'INR', // Currency code (change as needed)
                receipt: `${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}${Date.now()}`, // Provide a unique receipt ID
            });

            // Save the order details to your database
            newOrder.razorpayOrderId = razorpayOrder.id; // Save the Razorpay order ID
            await newOrder.save();

            // Redirect the user to the Razorpay checkout page
            res.render('customer/rzp', {
                order: razorpayOrder,
                key_id: process.env.RAZORPAY_ID_KEY,
                user: currentUser
            });
        } else {
            if (currentUser.wallet.balance < grandTotal + 5) {
                return res.render("customer/checkout", {
                    isLoggedIn: isLoggedIn(req, res),
                    currentUser,
                    cartProducts: currentUser.cart,
                    currentAddress: deliveryAddress,
                    discount: 0,
                    grandTotal,
                    currentCoupon: '',
                    couponError: '',
                    error: "Insufficient wallet balance.",
                });
            } else {
                await newOrder.save();
                currentUser.wallet.balance -= (grandTotal + 5);
                const transactionData = {
                    amount: grandTotal + 5,
                    description: 'Order placed.',
                    type: 'Debit',
                };
                currentUser.wallet.transactions.push(transactionData);
            }
        }

        // stock update
        currentUser.cart.forEach(async (item) => {
            const foundProduct = await Product.findById(item.product._id);
            foundProduct.stock -= item.quantity;
            await foundProduct.save();
        });

        currentUser.cart = [];
        await currentUser.save();

        // coupons
        const foundCoupon = await Coupon.findOne({
            isActive: true, minimumPurchaseAmount: { $lte: grandTotal }
        }).sort({ minimumPurchaseAmount: -1 });

        if (foundCoupon) {
            const couponExists = currentUser.earnedCoupons.some((coupon) => coupon.coupon.equals(foundCoupon._id));
            if (!couponExists) {
                currentUser.earnedCoupons.push({ coupon: foundCoupon._id });
                await currentUser.save();
            }
        }

        const currentUsedCoupon = await currentUser.earnedCoupons.find((coupon) => coupon.coupon.equals(req.body.currentCoupon));
        if (currentUsedCoupon) {
            currentUsedCoupon.isUsed = true;
            await Coupon.findByIdAndUpdate(req.body.currentCoupon, { $inc: { usedCount: 1 } });
        }

        res.redirect("/orders");
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req, res, next) => {
    try {
        const foundOrder = await Order.findById(req.body.orderId).populate('products.product');
        const foundProduct = foundOrder.products.find((order) => order.product._id.toString() === req.body.productId);
        if (foundOrder.paymentMethod !== 'cod') {
            const currentUser = await User.findById(req.session.user);

            const refundAmount = (foundProduct.product.price * foundProduct.quantity) + 5;
            currentUser.wallet.balance += refundAmount;

            const transactionData = {
                amount: refundAmount,
                description: 'Order cancelled.',
                type: 'Credit',
            };
            currentUser.wallet.transactions.push(transactionData);

            foundProduct.isCancelled = true;

            // Update the stock of the canceled product
            const foundProductTest = await Product.findById(req.body.productId);
            const currentStock = foundProductTest.stock;
            foundProductTest.stock = currentStock + foundProduct.quantity;

            // Save changes to the user's wallet, canceled product, and order
            await currentUser.save();
            await foundProductTest.save();
            await foundOrder.save();

            res.redirect("/orders");
        } else {
            foundProduct.isCancelled = true;
            const foundOrderTest = foundOrder.products.find((order) => order.product._id.toString() === req.body.productId);
            const foundProductTest = await Product.findById(req.body.productId);
            const currentStock = foundProductTest.stock;
            foundProductTest.stock = currentStock + foundOrderTest.quantity;
            await foundProductTest.save();
            await foundOrder.save();
            res.redirect("/orders");
        }
    } catch (error) {
        next(error);
    }
};

export const getReturnProductForm = async (req, res) => {
    try {
        const product = await Product.findById(req.query.product);
        const category = await Category.findById(req.query.category);
        const defaultAddress = await Address.findOne({ user: req.session.user, default: true });
        res.render("customer/returnForm", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            currentAddress: defaultAddress,
            order: req.query.order,
            category,
            product,
            activePage: 'Orders',
        });
    } catch (error) {
        next(error);
    }
};

export const requestReturnProduct = async (req, res, next) => {
    try {
        const foundOrder = await Order.findById(req.body.order).populate('products.product');
        const foundProduct = await Product.findOne({ name: req.body.product });
        const returnProduct = new Return({
            user: req.session.user,
            order: foundOrder._id,
            product: foundProduct._id,
            reason: req.body.reason,
            condition: req.body.condition,
            address: req.body.address
        });
        await returnProduct.save();

        foundOrder.products.forEach((product) => {
            if (product.product._id.toString() === foundProduct._id.toString()) {
                product.returnRequested = 'Pending';
            }
        });
        await foundOrder.save();

        res.redirect("/orders");
    } catch (error) {
        next(error);
    }
};