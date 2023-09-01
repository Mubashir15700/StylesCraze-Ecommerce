
export const getLogin = (req, res) => {
    res.render('admin/login', { commonError: "" });
}

export const getDashboard = (req, res) => {
    res.render('admin/dashboard');
}