const { validateCurrency } = require("./currencyValidation");

function validateName(name) {
    if (typeof name !== "string") {
        return "Name must be a string";
    }

    const normalizedName = name.trim();

    if (normalizedName.length === 0) {
        return "Name is required";
    }

    if (normalizedName.length > 100) {
        return "Name must be 100 characters or fewer";
    }

    return null;
}

function validateProfileUpdate(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return "Request body must be an object";
    }

    if (
        data.name === undefined &&
        data.currency === undefined
    ) {
        return "At least one field must be provided";
    }

    if (data.name !== undefined) {
        const nameError = validateName(data.name);

        if (nameError) return nameError;
    }

    if (data.currency !== undefined) {
        const currencyError = validateCurrency(data.currency);

        if (currencyError) return currencyError;
    }

    return null;
}

function normalizeProfileUpdate(data) {
    const normalized = {};

    if (data.name !== undefined) {
        normalized.name = data.name.trim();
    }

    if (data.currency !== undefined) {
        normalized.currency =
            data.currency.trim().toUpperCase();
    }

    return normalized;
}

module.exports = {
    validateProfileUpdate,
    normalizeProfileUpdate
};
