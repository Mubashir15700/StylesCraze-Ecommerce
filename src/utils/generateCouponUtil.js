import Coupon from "../models/couponModel.js";

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

export default generateCouponCode;
