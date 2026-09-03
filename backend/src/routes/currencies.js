const express = require("express");
const supportedCurrencies =
    require("../config/currencies");

const router = express.Router();

router.get("/", (req, res) => {
    return res.json({
        currencies: supportedCurrencies
    });
});

module.exports = router;