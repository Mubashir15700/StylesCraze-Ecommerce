
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

export const newProduct = (req, res) => {
    res.render('admin/newProduct');
};

export const addNewProduct = (req, res) => {
    console.log("add new product");
};

export const getProduct = (req, res) => {
    res.render('admin/editProduct');
};

export const editProduct = (req, res) => {
    console.log("edit product");
};

export const getCategories = (req, res) => {
    res.render('admin/categories');
};

export const newCategory = (req, res) => {
    res.render('admin/newCategory');
};

export const addNewCategory = (req, res) => {
    console.log("add new category");
};

export const getCategory = (req, res) => {
    res.render('admin/editCategory');
};

export const editCategory = (req, res) => {
    console.log("edit category");
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