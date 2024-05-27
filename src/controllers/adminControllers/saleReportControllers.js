import PDFDocument from "pdfkit";
import Order from "../../models/orderModel.js";

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
