import User from "../../models/userModel.js";
import { isLoggedIn, getCurrentUser } from "../../utils/currentUserUtil.js";
import catchAsync from "../../utils/catchAsyncUtil.js";

export const getWishlist = catchAsync(async (req, res, next) => {
    const currentUser = await User.findById(req.session.user).populate("wishlist");
    res.render("customer/wishlist", {
        isLoggedIn: isLoggedIn(req, res),
        currentUser,
        activePage: "Wishlist",
    });
});

export const updateWishlist = catchAsync(async (req, res, next) => {
    const currentUser = await getCurrentUser(req, res);
    if (req.body.todo === "add") {
        await currentUser.wishlist.push(req.body.productId);
    } else {
        const updatedWishlist = currentUser.wishlist.filter(
            (productId) => productId && !productId.equals(req.body.productId)
        );
        currentUser.wishlist = updatedWishlist;
    }

    await currentUser.save();

    if (req.body.goto) {
        return res.redirect("/wishlist");
    }

    return res.status(200).json({
        message: req.body.todo === "add" ? "added" : "removed",
        wishlistCount: currentUser.wishlist.length
    });
});
