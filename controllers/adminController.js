
export const getLogin = (req, res) => {
    res.render('admin/login', { commonError: "" });
};

export const getDashboard = (req, res) => {
    res.render('admin/dashboard');
};

export const getNotifications = (req, res) => {
    res.render('admin/notifications');
};

export const getProfile = (req, res) => {
    res.render('admin/profile');
};

export const getOrders = (req, res) => {
    res.render('admin/orders');
};

export const getProducts = (req, res) => {
    res.render('admin/products');
};

export const getCategories = (req, res) => {
    res.render('admin/categories');
};

export const getCustomers = (req, res) => {
    res.render('admin/customers');
};

export const getSalesReport = (req, res) => {
    res.render('admin/salesReport');
};

export const getBanner = (req, res) => {
    res.render('admin/banner');
};