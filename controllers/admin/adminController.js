import User from '../../models/userModel.js';
import Order from '../../models/orderModel.js';
import Coupon from '../../models/couponModel.js';
import Return from '../../models/returnProductsModel.js';

export const getLogin = (req, res) => {
    res.render('admin/login', { commonError: "" });
};

export const getDashboard = async (req, res, next) => {
    try {
        const today = new Date();
        // Calculate the start and end dates for this month
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // MongoDB aggregation pipeline to fetch the required data
        const pipeline = [
            {
                $match: {
                    orderDate: {
                        $gte: thisMonthStart,
                        $lte: thisMonthEnd,
                    },
                },
            },
            {
                $facet: {
                    todaysOrders: [
                        {
                            $match: {
                                orderDate: {
                                    $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                                    $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                                },
                            },
                        },
                        { $count: 'count' },
                    ],
                    thisMonthsOrders: [
                        { $count: 'count' },
                    ],
                    thisMonthsTotalRevenue: [
                        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
                    ],
                    totalCustomersThisMonth: [
                        {
                            $group: {
                                _id: '$user',
                            },
                        },
                        { $count: 'count' },
                    ],
                },
            },
        ];

        const order = await Order.aggregate(pipeline);

        let todaysOrders;
        let thisMonthsOrders;
        let thisMonthsTotalRevenue;
        let totalCustomersThisMonth;

        order.forEach((ord) => {
            todaysOrders = ord.todaysOrders[0] ? ord.todaysOrders[0].count : 0;
            thisMonthsOrders = ord.thisMonthsOrders[0] ? ord.thisMonthsOrders[0].count : 0;
            thisMonthsTotalRevenue = ord.thisMonthsTotalRevenue[0] ? ord.thisMonthsTotalRevenue[0].total : 0;
            totalCustomersThisMonth = ord.totalCustomersThisMonth[0] ? ord.totalCustomersThisMonth[0].count : 0;
        });

        const orderChartData = await Order.find();
        // Initialize objects to store payment method counts and monthly order counts
        const paymentMethodCounts = {};
        const monthlyOrderCountsCurrentYear = {};

        // Get the current year
        const currentYear = new Date().getFullYear();

        // Iterate through each order
        orderChartData.forEach((order) => {
            // Extract payment method and order date from the order object
            const { paymentMethod, orderDate } = order;

            // Count payment methods
            if (paymentMethod) {
                if (!paymentMethodCounts[paymentMethod]) {
                    paymentMethodCounts[paymentMethod] = 1;
                } else {
                    paymentMethodCounts[paymentMethod]++;
                }
            }

            // Count orders by month
            if (orderDate) {
                const orderYear = orderDate.getFullYear();
                if (orderYear === currentYear) {
                    const orderMonth = orderDate.getMonth(); // Get the month (0-11)

                    // Create a unique key for the month
                    const monthKey = `${orderMonth}`; // Month is 0-based

                    if (!monthlyOrderCountsCurrentYear[monthKey]) {
                        monthlyOrderCountsCurrentYear[monthKey] = 1;
                    } else {
                        monthlyOrderCountsCurrentYear[monthKey]++;
                    }
                }
            }    
        });

        const resultArray = new Array(12).fill(0);
        for (const key in monthlyOrderCountsCurrentYear) {
            const intValue = parseInt(key);
            resultArray[intValue] = monthlyOrderCountsCurrentYear[key];
        }
        
        res.render('admin/dashboard', {
            todaysOrders,
            thisMonthsOrders,
            thisMonthsTotalRevenue,
            totalCustomersThisMonth,
            paymentMethodCounts,
            monthlyOrderCountsCurrentYear: resultArray,
        });
    } catch (error) {
        next(error);
    }
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

export const getSalesReport = async (req, res, next) => {
    try {
        let filteredOrders;
        if (req.query.filtered) {
            filteredOrders = await Order.find({
                orderDate: {
                    $gte: req.body.from,
                    $lte: req.body.upto,
                },
            }).populate([
                { path: 'user' },
                { path: 'products.product' },
            ]);
        } else {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            filteredOrders = await Order.find({
                orderDate: {
                    $gte: startOfMonth,
                    $lte: endOfMonth,
                },
            }).populate([
                { path: 'user' },
                { path: 'products.product' },
            ]);
        }
        res.render('admin/salesReports', { salesReport: filteredOrders });
    } catch (error) {
        next(error);
    }
};

export const getBanner = (req, res) => {
    res.render('admin/banner/banners');
};