import User from '../../models/userModel.js';
import Order from '../../models/orderModel.js';
import Coupon from '../../models/couponModel.js';
import Return from '../../models/returnProductsModel.js';

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

export const getCustomers = async (req, res, next) => {
    try {
        const foundCustomers = await User.find();
        res.render('admin/customers', { customerDatas: foundCustomers });
    } catch (error) {
        next(error);
    }
};

export const customerAction = async (req, res, next) => {
    try {
        const state = req.body.state === "1";
        const customerId = req.params.id;
        await User.findByIdAndUpdate(customerId, { $set: { blocked: state } });
        res.redirect('/admin/customers');
    } catch (error) {
        next(error);
    }
};

export const getOrders = async (req, res, next) => {
    try {
        // Update order statuses before fetching orders
        await updateOrderStatus();
        const orders = await Order.find().populate([
            { path: 'user' },
            { path: 'products.product' },
        ]);

        res.render('admin/orders', { orders });
    } catch (error) {
        next(error);
    }
};

// Function to update order status
const updateOrderStatus = async () => {
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        // Update orders from Processing to Shipped after two days
        await Order.updateMany(
            {
                status: 'Processing',
                orderDate: { $lte: twoDaysAgo },
            },
            { $set: { status: 'Shipped' } }
        );

        const currentDate = new Date();

        // Update orders from Shipped to Delivered if the deliveryDate is in the past
        await Order.updateMany(
            {
                status: 'Shipped',
                deliveryDate: { $lte: currentDate },
            },
            { $set: { status: 'Delivered' } }
        );
    } catch (error) {
        console.error('Error updating order statuses:', error);
    }
};

export const getReturnRequests = async (req, res, next) => {
    try {
        const returnRequests = await Return.find().populate([
            { path: 'user' },
            { path: 'order' },
            { path: 'product' },
        ]);
        res.render("admin/returns", { returnRequests });
    } catch (error) {
        next(error);
    }
};

export const returnRequestAction = async (req, res, next) => {
    try {
        const foundRequet = await Return.findById(req.body.request);
        const foundOrders = await Order.findById(req.body.order);
        const currentProduct = foundOrders.products.find((product) => product.product.toString() === req.body.product.toString());
        currentProduct.returnRequested = '';
        if (req.body.action === "approve") {
            foundRequet.status = 'Approved';
            const currentProduct = foundOrders.products.find((product) => product.product.toString() === req.body.product.toString());
            currentProduct.returnRequested = 'Approved';
        } else {
            foundRequet.status = 'Rejected';
            const currentProduct = foundOrders.products.find((product) => product.product.toString() === req.body.product.toString());
            currentProduct.returnRequested = 'Rejected';
        }
        await foundRequet.save();
        await foundOrders.save();
        res.redirect('/admin/return-requests');
    } catch (error) {
        next(error);
    }
};

export const getCoupons = async (req, res, next) => {
    try {
        const foundCoupons = await Coupon.find();
        res.render('admin/coupons/coupons', { foundCoupons });
    } catch (error) {
        next(error);
    }
};

export const getAddNewCoupon = (req, res) => {
    res.render('admin/coupons/newCoupon', { error: "" });
};

export const addNewCoupon = async (req, res, next) => {
    try {
        const { description, discountType, discountAmount, minimumPurchaseAmount, usageLimit } = req.body;
        if (!description || !discountType || !discountAmount || !minimumPurchaseAmount || !usageLimit) {
            res.render('admin/coupons/newCoupon', { error: "All fields are required" });
        } else {
            if (description.length < 4 || description.length > 100) {
                return res.render('admin/coupons/newCoupon', { error: "Description must be between 4 and 100 characters" });
            } else {
                const uniqueCode = await generateCouponCode();
                const newCoupon = new Coupon({
                    code: uniqueCode,
                    discountType,
                    description,
                    discountAmount,
                    minimumPurchaseAmount,
                    usageLimit,
                });

                await newCoupon.save();

                res.redirect("/admin/coupons");
            }
        }
    } catch (error) {
        next(error);
    }
};

function generateCouponCode() {
    const codeRegex = /^[A-Z0-9]{5,15}$/;
    let code = '';
    while (!codeRegex.test(code)) {
        code = Math.random().toString(36).substring(7);
    }
    return Coupon.findOne({ code }).then(existingCoupon => {
        if (existingCoupon) {
            return generateCouponCode();
        }
        return code;
    });
}

export const couponAction = async (req, res, next) => {
    try {
        const state = req.body.state === "";
        const couponId = req.params.id;
        await Coupon.findByIdAndUpdate(couponId, { $set: { isActive: state } });
        res.redirect('/admin/coupons');
    } catch (error) {
        next(error);
    }
};

export const getSalesReport = (req, res) => {
    res.render('admin/salesReports');
};

export const getBanner = (req, res) => {
    res.render('admin/banners');
};