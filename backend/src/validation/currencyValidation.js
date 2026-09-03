const supportedCurrencies =
    require("../config/currencies");

const supportedCurrencyCodes = new Set(
    supportedCurrencies.map(
        (currency) => currency.code
    )
);


function validateCurrency(currency) {
    if (typeof currency !== "string") {
        return "Currency must be a string";
    }

    const normalizedCurrency =
        currency.trim().toUpperCase();

    if (!supportedCurrencyCodes.has(normalizedCurrency)) {
        return "Unsupported currency";
    }

    return null;
}

module.exports = { validateCurrency };