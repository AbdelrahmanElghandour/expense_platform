function normalizeEmail(email) {
    if (typeof email !== "string") {
        return email;
    }

    return email.trim().toLowerCase();
}

function validateEmail(email) {
    if (typeof email !== "string") {
        return "Email must be a string";
    }

    const normalizedEmail = normalizeEmail(email);

    if (normalizedEmail.length === 0) {
        return "Email is required";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
        return "Invalid email format";
    }

    if (normalizedEmail.length > 255) {
        return "Email must be 255 characters or fewer";
    }

    return null;
}

function validatePassword(password) {
    if (typeof password !== "string") {
        return "Password must be a string";
    }

    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }

    if (password.length > 128) {
        return "Password must be 128 characters or fewer";
    }

    return null;
}

const supportedCurrencies = [
    "KRW",
    "USD",
    "EUR",
    "JPY"
];

function normalizeCurrency(currency) {
    if (typeof currency !== "string") {
        return currency;
    }

    return currency.trim().toUpperCase();
}

function validateCurrency(currency) {
    if (typeof currency !== "string") {
        return "Currency must be a string";
    }

    const normalizedCurrency = normalizeCurrency(currency);

    if (!supportedCurrencies.includes(normalizedCurrency)) {
        return "Unsupported currency";
    }

    return null;
}

function validateRegistration(data) {
    const emailError = validateEmail(data.email);
    if (emailError) return emailError;

    const passwordError = validatePassword(data.password);
    if (passwordError) return passwordError;

    const currencyError = validateCurrency(data.currency);
    if (currencyError) return currencyError;

    return null;
}

function normalizeRegistrationData(data) {
    return {
        ...data,
        email: normalizeEmail(data.email),
        currency: normalizeCurrency(data.currency)
    };
}

function validateLogin(data) {
    if (typeof data.email !== "string") {
        return "Email must be a string";
    }

    if (typeof data.password !== "string") {
        return "Password must be a string";
    }

    if (data.email.trim().length === 0) {
        return "Email is required";
    }

    if (data.password.length === 0) {
        return "Password is required";
    }

    return null;
}

module.exports = {
    validateRegistration,
    normalizeRegistrationData,
    validateLogin,
    normalizeEmail
};