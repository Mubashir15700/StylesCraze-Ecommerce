import Order from "../../models/orderModel.js";
import Product from "../../models/productModel.js";
import Address from "../../models/addressModel.js";
import { isLoggedIn, getCurrentUser } from "../../utils/currentUserUtil.js";
import { razorpay } from "../../config/razorpayConfig.js";
import catchAsync from "../../utils/catchAsyncUtil.js";

export const placeOrder = catchAsync(async (req, res, next) => {
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
});

export const saveRzpOrder = catchAsync(async (req, res, next) => {
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
});

export const cancelOrder = catchAsync(async (req, res, next) => {
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
});
