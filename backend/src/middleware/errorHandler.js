function notFoundHandler(req, res) {
    return res.status(404).json({
        error: "Route not found"
    });
}

function errorHandler(error, req, res, next) {
    console.error(error);

    if (error.type === "entity.too.large") {
        return res.status(413).json({
            error: "Request body too large"
        });
    }

    return res.status(500).json({
        error: "Internal server error"
    });
}

module.exports = {
    notFoundHandler,
    errorHandler
};