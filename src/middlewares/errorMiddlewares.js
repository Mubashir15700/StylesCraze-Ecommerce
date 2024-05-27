const customError = (err, req, res, next) => {
    console.log("Err Middleware: ", err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    
    res.status(err.statusCode).render("error/internalError", {
        status: err.status,
        error: err.message
    });
};

export const newProductErrorPage = function (req, res, error, categories) {
    res.render("admin/products/newProduct", {
        categoryOptions: categories,
        error: error || "An error occurred",
        activePage: "Products"
    });
};

export const editProductErrorPage = function (req, res, error, product, foundCategories) {
    res.render("admin/products/editProduct", {
        productData: product,
        categoryOptions: foundCategories,
        error: error || "An error occurred",
        activePage: "Products"
    });
};

export default customError;
