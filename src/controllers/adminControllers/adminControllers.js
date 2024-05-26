import User from "../../models/userModel.js";
import Order from "../../models/orderModel.js";
import Return from "../../models/returnProductsModel.js";

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

export const getNotifications = (req, res) => {
    res.render("admin/notifications",
        {
            activePage: ""
        }
    );
};
