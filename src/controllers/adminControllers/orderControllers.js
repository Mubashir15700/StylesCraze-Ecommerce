import Order from "../../models/orderModel.js";
import Coupon from "../../models/couponModel.js";
import catchAsync from "../../utils/catchAsyncUtil.js";

export const getOrders = catchAsync(async (req, res, next) => {
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
});

export const getSingleOrder = catchAsync(async (req, res, next) => {
    await updateOrderStatus(req, res, next);
    const foundOrder = await Order.findById(req.params.id).populate([
        { path: "user" },
        { path: "products.product" },
    ]);
    res.render("admin/singleOrder", { foundOrder, activePage: "Orders", });
});

// Function to update order status
const updateOrderStatus = catchAsync(async (req, res, next) => {
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
});

export const manuelStatusUpdate = catchAsync(async (req, res, next) => {
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
});
