import PDFDocument from "pdfkit";
import Admin from "../../models/adminModel.js";
import User from "../../models/userModel.js";
import Order from "../../models/orderModel.js";
import Coupon from "../../models/couponModel.js";
import Return from "../../models/returnProductsModel.js";

export const getLogin = (req, res) => {
    res.render("admin/login", { commonError: "" });
};

export const getEnterEmail = (req, res) => {
    res.render("admin/forgot", { commonError: "" });
};

export const getDashboard = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.session.admin);
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
                        { $count: "count" },
                    ],
                    thisMonthsOrders: [
                        { $count: "count" },
                    ],
                    thisMonthsTotalRevenue: [
                        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
                    ],
                    totalCustomersThisMonth: [
                        {
                            $group: {
                                _id: "$user",
                            },
                        },
                        { $count: "count" },
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

        // for charts
        const orderChartData = await Order.find({ status: "Delivered" });
        // Initialize objects to store payment method counts and monthly order counts
        const paymentMethods = {};
        const monthlyOrderCountsCurrentYear = {};

        // Get the current year
        const currentYear = new Date().getFullYear();

        // Iterate through each order
        orderChartData.forEach((order) => {
            // Extract payment method and order date from the order object
            const { paymentMethod, orderDate } = order;

            // Count payment methods
            if (paymentMethod) {
                if (!paymentMethods[paymentMethod]) {
                    paymentMethods[paymentMethod] = order.totalAmount;
                } else {
                    paymentMethods[paymentMethod] += order.totalAmount;
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

        res.render("admin/dashboard", {
            todaysOrders,
            thisMonthsOrders,
            thisMonthsTotalRevenue,
            totalCustomersThisMonth,
            paymentMethods,
            monthlyOrderCountsCurrentYear: resultArray,
            activePage: "Dashboard",
            admin
        });
    } catch (error) {
        next(error);
    }
};

export const getCustomers = async (req, res, next) => {
    try {
        // pagination
        const page = parseInt(req.params.page) || 1;
        const pageSize = 3;
        const skip = (page - 1) * pageSize;
        const totalCustomers = await User.countDocuments();
        const totalPages = Math.ceil(totalCustomers / pageSize);

        let foundCustomers;
        if (req.query.search) {
            foundCustomers = await User.find({
                $or: [
                    { username: { $regex: req.body.searchQuery, $options: "i" } },
                    { email: { $regex: req.body.searchQuery, $options: "i" } },
                ]
            });

            return res.status(200).json({
                customerDatas: foundCustomers,
            });
        } else {
            foundCustomers = await User.find().skip(skip).limit(pageSize);
        }
        res.render("admin/customers", {
            customerDatas: foundCustomers,
            activePage: "Customers",
            filtered: req.query.search ? true : false,
            currentPage: page || 1,
            totalPages: totalPages || 1,
        });
    } catch (error) {
        next(error);
    }
};

export const customerAction = async (req, res, next) => {
    try {
        const state = req.body.state === "1";
        const customerId = req.params.id;
        await User.findByIdAndUpdate(customerId, { $set: { blocked: state } });
        if (!req.query.orderId) {
            res.redirect("/admin/customers/1");
        } else {
            const orderId = req.query.orderId; // Get the orderId from the query parameters
            // Pass the orderId as a parameter to the getSingleOrder function
            await getSingleOrder({ params: { id: orderId } }, res, next);
        }
    } catch (error) {
        next(error);
    }
};

export const getOrders = async (req, res, next) => {
    try {
        // Update order statuses before fetching orders
        await updateOrderStatus();

        // pagination
        const page = parseInt(req.params.page) || 1;
        const pageSize = 3;
        const skip = (page - 1) * pageSize;
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / pageSize);

        let orders;
        if (req.query.filtered) {
            let query = {};
            if (req.body.from !== "" && req.body.upto !== "") {
                let startOfMonth = new Date(req.body.from);
                let endOfMonth = new Date(req.body.upto);
                endOfMonth.setHours(23, 59, 59, 999);
                query.$and = [
                    { orderDate: { $gte: startOfMonth } },
                    { orderDate: { $lte: endOfMonth } }
                ]
            }

            if (req.body.status !== "Select Status") {
                query.status = req.body.status;
            }

            orders = await Order.find(
                query
            ).populate([
                { path: "user" },
                { path: "products.product" },
            ]).sort({ orderDate: -1 });

        } else {
            orders = await Order.find().populate([
                { path: "user" },
                { path: "products.product" },
            ]).sort({ orderDate: -1 })
                .skip(skip)
                .limit(pageSize);
        }

        res.render("admin/orders", {
            orders,
            activePage: "Orders",
            filtered: req.query.filtered ? true : false,
            currentPage: page || 1,
            totalPages: totalPages || 1,
        });
    } catch (error) {
        next(error);
    }
};

export const getSingleOrder = async (req, res, next) => {
    try {
        await updateOrderStatus(req, res, next);
        const foundOrder = await Order.findById(req.params.id).populate([
            { path: "user" },
            { path: "products.product" },
        ]);
        res.render("admin/singleOrder", { foundOrder, activePage: "Orders", });
    } catch (error) {
        next(error);
    }
};

// Function to update order status
const updateOrderStatus = async (req, res, next) => {
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        // Update orders from Processing to Shipped after two days
        await Order.updateMany(
            {
                status: "Processing",
                orderDate: { $lte: twoDaysAgo },
            },
            { $set: { status: "Shipped" } }
        );
    } catch (error) {
        next(error);
    }
};

export const manuelStatusUpdate = async (req, res, next) => {
    try {
        const foundOrder = await Order.findById(req.body.orderId);
        const allCancelled = foundOrder.products.every(product => product.isCancelled === true);
        if (!allCancelled) {
            foundOrder.status = req.body.status;
            await foundOrder.save();

            if (req.body.status === "Delivered") {
                // coupons
                const foundCoupon = await Coupon.findOne({
                    isActive: true, minimumPurchaseAmount: { $lte: foundOrder.totalAmount }
                }).sort({ minimumPurchaseAmount: -1 });

                if (foundCoupon) {
                    const currentUser = await User.findById(req.body.userId);
                    const couponExists = currentUser.earnedCoupons.some((coupon) => coupon.coupon.equals(foundCoupon._id));
                    if (!couponExists) {
                        currentUser.earnedCoupons.push({ coupon: foundCoupon._id });
                    }
                    await currentUser.save();
                }
            }

            return res.status(200).json({ message: "Order status updated successfully." });
        } else {
            return res.status(404).json({ message: "Can't Update. The user has cancelled this oreder." });
        }
    } catch (error) {
        next(error);
    }
};

export const getReturnRequests = async (req, res, next) => {
    try {
        // pagination
        const page = parseInt(req.params.page) || 1;
        const pageSize = 3;
        const skip = (page - 1) * pageSize;
        const totalRequests = await Return.countDocuments();
        const totalPages = Math.ceil(totalRequests / pageSize);

        let returnRequests;
        if (req.query.filtered) {
            let query = {};
            if (req.body.from !== "" && req.body.upto !== "") {
                let startOfMonth = new Date(req.body.from);
                let endOfMonth = new Date(req.body.upto);
                endOfMonth.setHours(23, 59, 59, 999);
                query.$and = [
                    { createdAt: { $gte: startOfMonth } },
                    { createdAt: { $lte: endOfMonth } }
                ]
            }

            if (req.body.status !== "Select Status") {
                query.status = req.body.status;
            }

            returnRequests = await Return.find(query).populate([
                { path: "user" },
                { path: "order" },
                { path: "product" },
            ]);
        } else {
            returnRequests = await Return.find().populate([
                { path: "user" },
                { path: "order" },
                { path: "product" },
            ]).skip(skip).limit(pageSize);
        }

        res.render("admin/returns", {
            returnRequests,
            activePage: "Orders",
            filtered: req.query.search ? true : false,
            currentPage: page || 1,
            totalPages: totalPages || 1,
        });
    } catch (error) {
        next(error);
    }
};

export const returnRequestAction = async (req, res, next) => {
    try {
        const foundRequet = await Return.findById(req.body.request);
        const foundOrders = await Order.findById(req.body.order);
        const currentProduct = foundOrders.products.find((product) => product.product.toString() === req.body.product.toString());
        currentProduct.returnRequested = "";
        if (req.body.action === "approve") {
            foundRequet.status = "Approved";
            currentProduct.returnRequested = "Approved";
        } else {
            foundRequet.status = "Rejected";
            currentProduct.returnRequested = "Rejected";
        }
        await foundRequet.save();
        await foundOrders.save();
        res.redirect("/admin/return-requests/1");
    } catch (error) {
        next(error);
    }
};

export const getCoupons = async (req, res, next) => {
    try {
        // pagination
        const page = parseInt(req.params.page) || 1;
        const pageSize = 3;
        const skip = (page - 1) * pageSize;
        const totalCoupons = await Coupon.countDocuments();
        const totalPages = Math.ceil(totalCoupons / pageSize);

        let foundCoupons;
        if (req.query.search) {
            foundCoupons = await Coupon.find({
                isActive: req.body.searchQuery === "1" ? true : false
            });
            return res.status(200).json({
                couponDatas: foundCoupons,
            });
        } else {
            foundCoupons = await Coupon.find().skip(skip).limit(pageSize);
            res.render("admin/coupons/coupons", {
                foundCoupons,
                activePage: "Coupons",
                filtered: req.query.search ? true : false,
                currentPage: page || 1,
                totalPages: totalPages || 1,
            });
        }
    } catch (error) {
        next(error);
    }
};

export const getAddNewCoupon = (req, res) => {
    res.render("admin/coupons/newCoupon", {
        error: "",
        activePage: "Coupons",
    });
};

export const addNewCoupon = async (req, res, next) => {
    try {
        const { description, discountType, discountAmount, minimumPurchaseAmount, usageLimit } = req.body;
        if (!description || !discountType || !discountAmount || !minimumPurchaseAmount || !usageLimit) {
            res.render("admin/coupons/newCoupon", {
                error: "All fields are required",
                activePage: "Coupons",
            });
        } else {
            if (description.length < 4 || description.length > 100) {
                return res.render("admin/coupons/newCoupon", {
                    error: "Description must be between 4 and 100 characters",
                    activePage: "Coupons",
                });
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

                res.redirect("/admin/coupons/1");
            }
        }
    } catch (error) {
        next(error);
    }
};

function generateCouponCode() {
    const codeRegex = /^[A-Z0-9]{5,15}$/;
    let code = "";
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
        res.redirect("/admin/coupons/1");
    } catch (error) {
        next(error);
    }
};

export const getSalesReport = async (req, res, next) => {
    try {
        let startOfMonth;
        let endOfMonth;
        if (req.query.filtered) {
            startOfMonth = new Date(req.body.from);
            endOfMonth = new Date(req.body.upto);
            endOfMonth.setHours(23, 59, 59, 999);
        } else {
            const today = new Date();
            startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }
        const filteredOrders = await Order.aggregate([
            {
                $match: {
                    status: "Delivered",
                    orderDate: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
                $unwind: "$products" // Unwind the products array
            },
            {
                $lookup: {
                    from: "products", // Replace with the actual name of your products collection
                    localField: "products.product",
                    foreignField: "_id",
                    as: "productInfo" // Store the product info in the "productInfo" array
                }
            },
            {
                $addFields: {
                    "products.productInfo": {
                        $arrayElemAt: ["$productInfo", 0] // Get the first (and only) element of the "productInfo" array
                    }
                }
            },
            {
                $match: {
                    "products.returnRequested": { $in: ["Nil", "Rejected"] }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            {
                $unwind: "$userInfo"
            },
            {
                $project: {
                    _id: 1,
                    userInfo: 1,
                    totalAmount: 1,
                    paymentMethod: 1,
                    deliveryAddress: 1,
                    status: 1,
                    orderDate: 1,
                    deliveryDate: 1,
                    "products.quantity": 1,
                    "products.isCancelled": 1,
                    "products.returnRequested": 1,
                    "products.productInfo": 1
                }
            }
        ]);

        res.render("admin/salesReports", {
            salesReport: filteredOrders,
            activePage: "SalesReport",
        });
    } catch (error) {
        next(error);
    }
};

export const downloadSalesReport = (req, res, next) => {
    try {
        const salesReport = JSON.parse(req.query.salesReport);
        // Create a new PDF document
        const doc = new PDFDocument();

        // Set the PDF response headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=sales-report.pdf");

        // Pipe the PDF document to the response
        doc.pipe(res);

        // Add content to the PDF
        doc.fontSize(16).text("Sales Report", { align: "center" });
        doc.moveDown();
        doc.fontSize(12);

        // Iterate over the salesReport data and add it to the PDF
        salesReport.forEach((report) => {
            doc.text(`User: ${report.userInfo.username}`);
            doc.text(`Email: ${report.userInfo.email}`);
            doc.text(`Phone: ${report.userInfo.phone}`);
            doc.moveDown();

            // Iterate over the products for each report
            doc.text(`Product Name: ${report.products.productInfo.name}`);
            doc.text(`Price: ${report.products.productInfo.actualPrice}`);
            doc.text(`Quantity: ${report.products.quantity}`);
            doc.text(`Payment Method: ${report.products.paymentMethod}`);
            doc.moveDown();

            doc.text(`Order Date: ${report.orderDate}`);
            doc.text(`Delivery Date: ${report.deliveryDate}`);
            doc.text(`Delivery Address: ${report.deliveryAddress.state}, ${report.deliveryAddress.city}, ${report.deliveryAddress.area}`);
            doc.text(`Pincode: ${report.deliveryAddress.pincode}`);
            doc.text(`House No.: ${report.deliveryAddress.building}`);
            doc.moveDown();
        });

        // Add total statistics
        doc.text(`Total orders done: ${salesReport.length}`);
        doc.text(`Total products sold: ${req.query.productsCount}`);
        doc.text(`Total Revenue: ₹${req.query.revenue}`);
        doc.moveDown();

        // Finalize and end the PDF document
        doc.end();
    } catch (error) {
        next(error);
    }
};

export const getBanner = (req, res) => {
    res.render("admin/banner/banners", {
        activePage: "Banner",
    });
};

export const getNotifications = (req, res) => {
    res.render("admin/notifications",
        {
            activePage: ""
        }
    );
};
