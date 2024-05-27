import Admin from "../../models/adminModel.js";
import Order from "../../models/orderModel.js";
import catchAsync from "../../utils/catchAsyncUtil.js";

export const getDashboard = catchAsync(async (req, res, next) => {
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
});
