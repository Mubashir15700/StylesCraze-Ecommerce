import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
            },
            isCancelled: {
                type: Boolean,
                default: false,
            },
            returnRequested: {
                type: String,
                enum: ['Nil', 'Pending', 'Approved', 'Rejected', 'Completed'],
                default: 'Nil',
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    deliveryDate: {
        type: Date,
    },
    paymentMethod: {
        type: String,
        required: true
    },
    deliveryAddress: {
        type: {
            _id: mongoose.Schema.Types.ObjectId,
            user: mongoose.Schema.Types.ObjectId,
            pincode: Number,
            state: String,
            city: String,
            building: String,
            area: String,
            default: Boolean,
            softDeleted: Boolean,
            __v: Number
        },
        ref: 'Address',
    },
    status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Pending'],
        default: 'Processing',
    },
    razorpayOrderId: {
        type: String,
    },
    transactionId: {
        type: String,
    }
});

// Add a pre-save hook to calculate the delivery date
orderSchema.pre('save', function (next) {
    const orderDate = this.orderDate;
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    this.deliveryDate = deliveryDate;

    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;