
export const getHome = (req, res) => {
    let isLoggedIn;
    if (req.session.user) {
        isLoggedIn = true;
    } else {
        isLoggedIn = false;
    }
    res.render("customer/home", { isLoggedIn: isLoggedIn });
};

export const getAbout = (req, res) => {
    res.render("customer/about");
};

export const getShop = (req, res) => {
    res.render("customer/shop");
};

export const getSingle = (req, res) => {
    res.render("customer/single");
};

export const getContact = (req, res) => {
    res.render("customer/contact");
};

export const getLogin = (req, res) => {
    res.render("customer/login", { commonError: "" });
};

export const getRegister = (req, res) => {
    res.render("customer/register", { commonError: "" });
};

export const getProfile = (req, res) => {
    res.render("customer/profile");
};

export const updateProfile = (req, res) => {
    try {
        console.log(req.body);
    } catch (error) {
        console.log(error);
    }
};

export const getWishlist = (req, res) => {
    res.render("customer/wishlist");
};

export const getCart = (req, res) => {
    res.render("customer/cart");
};