const customError = (err, req, res, next) => {
    console.log("Err Middleware: ", err.stack);
    res.status(500).render("error/internalError", { error: err.message });
};

export const newProductErrorPage = function (req, res, error, categories) {
    res.render("admin/products/newProduct", {
        categoryOptions: categories,
        error: error || "An error occurred",
        activePage: "Products"
    });
}

export const editProductErrorPage = function (req, res, error, product, foundCategories) {
    res.render("admin/products/editProduct", {
        productData: product,
        categoryOptions: foundCategories,
        error: error || "An error occurred",
        activePage: "Products"
    });
}

export default customError;
