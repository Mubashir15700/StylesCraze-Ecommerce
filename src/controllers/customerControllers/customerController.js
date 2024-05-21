import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import User from "../../models/userModel.js";
import Order from "../../models/orderModel.js";
import Address from "../../models/addressModel.js";
import Coupon from "../../models/couponModel.js";
import Return from "../../models/returnProductsModel.js";
import Banner from "../../models/bannerModel.js";
import { razorpay } from "../../config/razorpayConfig.js";
import { isLoggedIn, getCurrentUser } from "../getCurrentUser.js";

export const getHome = async (req, res, next) => {
    try {
        const foundProducts = await Product.find({ softDeleted: false }).populate("category").limit(6);
        const foundCategories = await Category.find({ removed: false });
        const currentBanner = await Banner.findOne({ isActive: true });
        res.render("customer/home", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            productDatas: foundProducts,
            categoryDatas: foundCategories,
            currentBanner,
            activePage: "Home",
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
            activePage: "About",
        });
    } catch {
        next(error);
    }
};

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

export const getContact = async (req, res, next) => {
    try {
        res.render("customer/contact", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            activePage: "Contact",
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
            wishlistCount: currentUser.wishlist.length
        });
    } catch (error) {
        next(error);
    }
};

export const getWishlist = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.session.user).populate("wishlist");
        res.render("customer/wishlist", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            activePage: "Wishlist",
        });
    } catch (error) {
        next(error);
    }
};

export const applyCoupon = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.session.user).populate("earnedCoupons.coupon");
        await currentUser.populate("cart.product");
        await currentUser.populate("cart.product.category");
        const cartProducts = currentUser.cart;
        const defaultAddress = await Address.findOne({ user: req.session.user, default: true });
        const currentCoupon = await Coupon.findOne({ code: req.body.coupon });
        const grandTotal = cartProducts.reduce((total, element) => {
            return total + (element.quantity * element.product.actualPrice);
        }, 0);
        let couponError = "";
        let discount = 0;
        if (currentCoupon) {
            const foundCoupon = currentUser.earnedCoupons.find(coupon => coupon.coupon._id.equals(currentCoupon._id));
            if (foundCoupon) {
                if (foundCoupon.coupon.isActive) {
                    if (!foundCoupon.isUsed) {
                        if (foundCoupon.coupon.discountType === "fixedAmount") {
                            discount = foundCoupon.coupon.discountAmount;
                        } else {
                            discount = (foundCoupon.coupon.discountAmount / 100) * grandTotal;
                        }
                    } else {
                        couponError = foundCoupon.isUsed ? "Coupon already used." : "Coupon is inactive.";
                    }
                } else {
                    couponError = foundCoupon.isUsed ? "Coupon already used." : "Coupon is inactive.";
                }
            } else {
                couponError = "Invalid coupon code.";
            }
        } else {
            couponError = "Invalid coupon code.";
        }

        res.render("customer/checkout", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            cartProducts,
            currentAddress: defaultAddress,
            discount,
            grandTotal,
            currentCoupon: couponError ? "" : currentCoupon._id,
            couponError,
            error: "",
            activePage: "Cart"
        });
    } catch (error) {
        next(error);
    }
};

export const placeOrder = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        await currentUser.populate("cart.product");
        const deliveryAddress = await Address.findOne({ user: req.session.user, default: true });

        const grandTotal = currentUser.cart.reduce((total, element) => {
            let price = element.product.actualPrice;
            if (element.product.productOfferPrice && element.product.categoryOfferPrice) {
                price = Math.min(element.product.productOfferPrice, element.product.categoryOfferPrice);
            } else if (element.product.productOfferPrice || element.product.categoryOfferPrice) {
                price = element.product.categoryOfferPrice ? element.product.categoryOfferPrice : element.product.productOfferPrice;
            }
            return total + (element.quantity * price);
        }, 0);

        const orderedProducts = currentUser.cart.map((item) => {
            let price = item.product.actualPrice;
            if (item.product.productOfferPrice && item.product.categoryOfferPrice) {
                price = Math.min(item.product.productOfferPrice, item.product.categoryOfferPrice);
            } else if (item.product.productOfferPrice || item.product.categoryOfferPrice) {
                price = item.product.categoryOfferPrice ? item.product.categoryOfferPrice : item.product.productOfferPrice;
            }

            return {
                product: item.product._id,
                finalPrice: item.quantity * price,
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

        if (req.body.method === "cod") {
            await newOrder.save();
        } else if (req.body.method === "rzp") {
            // Create a Razorpay order
            const razorpayOrder = await razorpay.orders.create({
                amount: (grandTotal - req.body.discount + 5) * 100, // Total amount in paise
                currency: "INR", // Currency code (change as needed)
                receipt: `${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}${Date.now()}`, // Provide a unique receipt ID
            });

            // Save the order details to your database
            newOrder.razorpayOrderId = razorpayOrder.id;

            // Redirect the user to the Razorpay checkout page
            return res.render("customer/rzp", {
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
                    currentCoupon: "",
                    couponError: "",
                    error: "Insufficient wallet balance.",
                });
            } else {
                await newOrder.save();
                currentUser.wallet.balance -= (grandTotal + 5);
                const transactionData = {
                    amount: grandTotal + 5,
                    description: "Order placed.",
                    type: "Debit",
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

        // coupons
        const currentUsedCoupon = await currentUser.earnedCoupons.find((coupon) => coupon.coupon.equals(req.body.currentCoupon));
        if (currentUsedCoupon) {
            currentUsedCoupon.isUsed = true;
            await Coupon.findByIdAndUpdate(req.body.currentCoupon, { $inc: { usedCount: 1 } });
        }

        await currentUser.save();
        res.redirect("/orders");
    } catch (error) {
        next(error);
    }
};

export const saveRzpOrder = async (req, res, next) => {
    try {
        const { transactionId, orderId, signature } = req.body;
        const amount = parseInt(req.body.amount / 100);
        const currentUser = await getCurrentUser(req, res);
        await currentUser.populate("cart.product");
        const deliveryAddress = await Address.findOne({ user: req.session.user, default: true });
        if (transactionId && orderId && signature) {
            // stock update
            currentUser.cart.forEach(async (item) => {
                const foundProduct = await Product.findById(item.product._id);
                foundProduct.stock -= item.quantity;
                await foundProduct.save();
            });

            const orderedProducts = currentUser.cart.map((item) => {
                let price = item.product.actualPrice;
                if (item.product.productOfferPrice && item.product.categoryOfferPrice) {
                    price = Math.min(item.product.productOfferPrice, item.product.categoryOfferPrice);
                } else if (item.product.productOfferPrice || item.product.categoryOfferPrice) {
                    price = item.product.categoryOfferPrice ? item.product.categoryOfferPrice : item.product.productOfferPrice;
                }
    
                return {
                    product: item.product._id,
                    finalPrice: item.quantity * price,
                    quantity: item.quantity,
                }
            });

            let newOrder = new Order({
                user: req.session.user,
                products: orderedProducts,
                totalAmount: amount,
                paymentMethod: "rzp",
                deliveryAddress,
            });
            await newOrder.save();

            currentUser.cart = [];

            // coupons
            const currentUsedCoupon = await currentUser.earnedCoupons.find((coupon) => coupon.coupon.equals(req.body.currentCoupon));
            if (currentUsedCoupon) {
                currentUsedCoupon.isUsed = true;
                await Coupon.findByIdAndUpdate(req.body.currentCoupon, { $inc: { usedCount: 1 } });
            }

            await currentUser.save();

            return res.status(200).json({
                message: "order placed successfully",
            });
        }
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req, res, next) => {
    try {
        const foundOrder = await Order.findById(req.body.orderId).populate("products.product");
        const foundProduct = foundOrder.products.find((order) => order.product._id.toString() === req.body.productId);
        const currentUser = await User.findById(req.session.user);
        if (foundOrder.paymentMethod !== "cod") {

            const refundAmount = foundProduct.finalPrice;
            currentUser.wallet.balance += refundAmount;

            foundOrder.totalAmount -= (foundProduct.finalPrice * foundProduct.quantity);
            if (foundOrder.totalAmount === 5) {
                foundOrder.totalAmount = 0;
            }

            const transactionData = {
                amount: refundAmount,
                description: "Product cancelled.",
                type: "Credit",
            };
            currentUser.wallet.transactions.push(transactionData);

            foundProduct.isCancelled = true;

            // Update the stock of the canceled product
            const foundCurrentProduct = await Product.findById(req.body.productId);
            foundCurrentProduct.stock += foundProduct.quantity;

            await foundCurrentProduct.save();
        } else {
            foundOrder.totalAmount -= (foundProduct.finalPrice * foundProduct.quantity);
            if (foundOrder.totalAmount === 5) {
                foundOrder.totalAmount = 0;
            }
            foundProduct.isCancelled = true;
            const foundCurrentOrder = foundOrder.products.find((order) => order.product._id.toString() === req.body.productId);
            const foundCurrentProduct = await Product.findById(req.body.productId);
            foundCurrentProduct.stock += foundCurrentOrder.quantity;
            await foundCurrentProduct.save();
        }

        // Function to check if all products in the order are cancelled
        function areAllProductsCancelled(order) {
            for (const product of order.products) {
                if (!product.isCancelled) {
                    return false;
                }
            }
            return true;
        }

        if (areAllProductsCancelled(foundOrder)) {
            foundOrder.status = "Cancelled";
            currentUser.wallet.balance += 5;
            const transactionData = {
                amount: 5,
                description: "Order cancelled.",
                type: "Credit",
            };
            currentUser.wallet.transactions.push(transactionData);
        }

        await foundOrder.save();
        await currentUser.save();
        res.redirect("/orders");
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
            quantity: req.query.quantity,
            activePage: "Orders",
        });
    } catch (error) {
        next(error);
    }
};

export const requestReturnProduct = async (req, res, next) => {
    try {
        const foundOrder = await Order.findById(req.body.order).populate("products.product");
        const foundProduct = await Product.findOne({ name: req.body.product });
        const returnProduct = new Return({
            user: req.session.user,
            order: foundOrder._id,
            product: foundProduct._id,
            quantity: parseInt(req.body.quantity),
            reason: req.body.reason,
            condition: req.body.condition,
            address: req.body.address
        });
        await returnProduct.save();

        foundOrder.products.forEach((product) => {
            if (product.product._id.toString() === foundProduct._id.toString()) {
                product.returnRequested = "Pending";
            }
        });
        await foundOrder.save();

        res.redirect("/orders");
    } catch (error) {
        next(error);
    }
};
