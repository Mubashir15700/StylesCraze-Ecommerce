
const customError = (err, req, res, next) => {
    console.log(err.stack);
    res.status(500).render('error', { error: err.message });
};

export default customError;