import mongoose from "mongoose";
import User from "../../models/userModel.js";
import Address from "../../models/addressModel.js";
import Coupon from "../../models/couponModel.js";
import Order from "../../models/orderModel.js";
import { sendToMail } from '../../utils/sendMail.js';
import { isLoggedIn, getCurrentUser } from '../getCurrentUser.js';

export const getProfile = async (req, res, next) => {
    try {
        const addresses = await Address.find({ user: req.session.user });
        res.render("customer/profile", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            error: "",
            addresses,
            activePage: 'Profile',
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    const { profile, username, phone, email } = req.body;
    try {
        if (!username || !phone || !email) {
            const addresses = await Address.find({ user: req.session.user });
            return res.render("customer/profile", {
                isLoggedIn: isLoggedIn(req, res),
                currentUser: await getCurrentUser(req, res),
                error: "Username, mobile and email are required.",
                addresses,
                activePage: 'Profile',
            });
        } else {
            const currentUser = await User.findById(req.session.user);

            let updatedObj = {
                username, phone, email
            };

            if (profile && profile.length) {
                updatedObj.profile = "/profiles/" + profile;
            }

            await currentUser.updateOne(updatedObj);

            if (currentUser.email !== email) {
                currentUser.verified = false;
                await currentUser.save();
                sendToMail(req, res, req.session.user, false);
            } else {
                res.redirect("/profile");
            }
        }
    } catch (error) {
        next(error);
    }
};

export const removeProfileImage = async (req, res, next) => {
    try {
        let removeProfile = {
            profile: '',
        };
        const currentUser = await User.findById(req.session.user);
        await currentUser.updateOne(removeProfile);
        res.redirect("/profile");
    } catch (error) {
        next(error);
    }
};

export const getNewAddress = async (req, res, next) => {
    try {
        res.render("customer/address/newAddress", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            error: "",
            activePage: 'Profile',
        });
    } catch (error) {
        next(error);
    }
};

export const addNewAddress = async (req, res, next) => {
    try {
        const { pincode, state, city, building, area } = req.body;
        if (pincode, state, city, building, area) {
            const otherAddress = await Address.find({ user: req.session.user });
            const newAddress = new Address({
                user: req.session.user,
                pincode,
                state,
                city,
                building,
                area,
                default: (otherAddress.length === 0) ? true : false,
            });
            await newAddress.save();
            res.redirect("/profile");
        }
    } catch (error) {
        next(error);
    }
};

export const getEditAddress = async (req, res, next) => {
    try {
        const currentAddress = await Address.findOne({ _id: req.params.id });
        res.render("customer/address/editAddress", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            currentAddress,
            error: "",
            activePage: 'Profile',
        });
    } catch (error) {
        next(error);
    }
};

export const editAddress = async (req, res, next) => {
    try {
        const { pincode, state, city, building, area } = req.body;
        if (!pincode || !state || !city || !building || !area) {
            const currentAddress = await Address.findOne({ _id: req.params.id });
            res.render("customer/address/editAddress", {
                isLoggedIn: isLoggedIn(req, res),
                currentUser: await getCurrentUser(req, res),
                currentAddress,
                error: "All fields are required.",
                activePage: 'Profile',
            });
        } else {
            await Address.updateOne(
                {
                    _id: req.params.id,
                },
                {
                    $set: {
                        pincode,
                        state,
                        city,
                        building,
                        area,
                    },
                }
            );
            res.redirect("/profile");
        }
    } catch (error) {
        next(error);
    }
};

export const deleteAddress = async (req, res, next) => {
    try {
        await Address.deleteOne({ _id: req.params.id });
        res.redirect("/profile");
    } catch (error) {
        next(error);
    }
};

export const getAddresses = async (req, res, next) => {
    try {
        const addresses = await Address.find({ user: req.session.user });
        res.render("customer/address/selectAddress", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            addresses,
            activePage: 'Profile',
        });
    } catch (error) {
        next(error);
    }
};

export const changeDefaultAddress = async (req, res, next) => {
    try {
        await Address.updateOne({ user: req.session.user, default: true }, { $set: { default: false } });
        await Address.findByIdAndUpdate(req.body.addressId, { $set: { default: true } });
        // Redirect to the previous page (referrer)
        const previousPage = req.headers.referer || '/checkout'; // Default to '/checkout' if no referrer is found
        res.redirect(previousPage);
    } catch (error) {
        next(error);
    }
};

export const getChangePassword = async (req, res, next) => {
    try {
        const currentUser = await getCurrentUser(req, res);
        res.render("customer/auth/changePassword", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser: await getCurrentUser(req, res),
            error: "",
            email: currentUser.email,
            activePage: 'Profile',
        });
    } catch (error) {
        next(error);
    }
};

export const getWallet = async (req, res, next) => {
    try {
        // fix sorting
        const currentUser = await User.findById(req.session.user).sort({ 'wallet.transactions.timestamp': -1 });
        res.render("customer/wallet", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            activePage: 'Profile',
        });
    } catch (error) {
        next(error);
    }
};

export const getCoupons = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.session.user).populate('earnedCoupons.coupon');
        const allCoupons = await Coupon.find({ isActive: true });
        const earnedCoupons = currentUser.earnedCoupons;

        // Convert the list of earned coupon IDs to an array
        const earnedCouponIds = earnedCoupons.map((coupon) => coupon.coupon._id.toString());
        // Filter out earned coupons from the active coupons list
        const remainingCoupons = allCoupons.filter((coupon) => !earnedCouponIds.includes(coupon._id.toString()));

        res.render("customer/coupons", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            allCoupons: remainingCoupons,
            earnedCoupons,
            activePage: 'Profile',
        });
    } catch (error) {
        next(error);
    }
};

export const getOrders = async (req, res, next) => {
    try {
        // Update order statuses before fetching orders
        await updateOrderStatus();

        const currentUser = await User.findById(req.session.user);
        const orders = await Order.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.session.user) } },
            { $unwind: "$products" },
            {
                $lookup: {
                    from: "products",
                    localField: "products.product",
                    foreignField: "_id",
                    as: "orderedProducts"
                }
            },
            { $sort: { orderDate: -1 } }
        ]);

        res.render("customer/orders", {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            orders,
            activePage: 'Profile',
        });
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