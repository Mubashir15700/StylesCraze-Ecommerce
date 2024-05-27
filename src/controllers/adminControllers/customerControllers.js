import User from "../../models/userModel.js";

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
