import Return from "../../models/returnProductsModel.js";
import Order from "../../models/orderModel.js";
import catchAsync from "../../utils/catchAsyncUtil.js";

export const getReturnRequests = catchAsync(async (req, res, next) => {
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
});

export const returnRequestAction = catchAsync(async (req, res, next) => {
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
});
