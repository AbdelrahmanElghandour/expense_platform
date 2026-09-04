const allowedPaymentMethods = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Other"
];

function isValidDateString(value) {
    if (typeof value !== "string") {
        return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);

    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function validateType(type) {
    if (type !== "expense" && type !== "income") {
        return "Type must be either 'expense' or 'income'";
    }

    return null;
}

function validateAmount(amount) {
    if (
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return "Amount must be a number greater than 0";
    }

    return null;
}

function validateCategory(category) {
    if (category === undefined || category === null) {
        return null;
    }

    if (typeof category !== "string") {
        return "Category must be a string or null";
    }

    const normalizedCategory = category.trim();

    if (normalizedCategory.length === 0) {
        return "Category cannot be empty";
    }

    if (normalizedCategory.length > 100) {
        return "Category must be 100 characters or fewer";
    }

    return null;
}

function validatePaymentMethod(paymentMethod) {
    if (paymentMethod === undefined || paymentMethod === null) {
        return null;
    }

    if (typeof paymentMethod !== "string") {
        return "Payment method must be a string or null";
    }

    const normalizedPaymentMethod = paymentMethod.trim();

    if (!allowedPaymentMethods.includes(normalizedPaymentMethod)) {
        return "Invalid payment method";
    }

    return null;
}

function validateNotes(notes) {
    if (notes === undefined || notes === null) {
        return null;
    }

    if (typeof notes !== "string") {
        return "Notes must be a string or null";
    }

    if (notes.trim().length > 1000) {
        return "Notes must be 1000 characters or fewer";
    }

    return null;
}

function validateTransactionDate(transactionDate) {
    if (!isValidDateString(transactionDate)) {
        return "Transaction date must be a valid date in YYYY-MM-DD format";
    }

    return null;
}

function normalizeTransactionData(data) {
    return {
        ...data,

        category:
            typeof data.category === "string"
                ? data.category.trim()
                : data.category,

        payment_method:
            typeof data.payment_method === "string"
                ? data.payment_method.trim()
                : data.payment_method,

        notes:
            typeof data.notes === "string"
                ? data.notes.trim()
                : data.notes
    };
}

function validateCreateTransaction(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return "Request body must be an object";
    }

    const errors = [
        validateType(data.type),
        validateAmount(data.amount),
        validateCategory(data.category),
        validatePaymentMethod(data.payment_method),
        validateNotes(data.notes),
        validateTransactionDate(data.transactionDate)
    ];

    return errors.find(error => error !== null) || null;
}

function validatePatchTransaction(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return "Request body must be an object";
    }

    if (Object.keys(data).length === 0) {
        return "No fields provided to update";
    }

    if (data.type !== undefined) {
        const error = validateType(data.type);
        if (error) return error;
    }

    if (data.amount !== undefined) {
        const error = validateAmount(data.amount);
        if (error) return error;
    }

    if (data.category !== undefined) {
        const error = validateCategory(data.category);
        if (error) return error;
    }

    if (data.payment_method !== undefined) {
        const error = validatePaymentMethod(data.payment_method);
        if (error) return error;
    }

    if (data.notes !== undefined) {
        const error = validateNotes(data.notes);
        if (error) return error;
    }

    if (data.transactionDate !== undefined) {
        const error = validateTransactionDate(data.transactionDate);
        if (error) return error;
    }

    return null;
}

function validateTransactionId(transactionId) {
    if (
        typeof transactionId !== "string" ||
        !/^\d+$/.test(transactionId) ||
        Number(transactionId) <= 0
    ) {
        return "Transaction ID must be a positive integer";
    }

    return null;
}

function validateTransactionFilters(filters) {
    const {
        type,
        category,
        startDate,
        endDate
    } = filters;

    if (type !== undefined) {
        const typeError = validateType(type);

        if (typeError) {
            return typeError;
        }
    }

    if (category !== undefined) {
        const categoryError = validateCategory(category);

        if (categoryError) {
            return categoryError;
        }
    }

    if (startDate !== undefined) {
        if (!isValidDateString(startDate)) {
            return "Start date must be a valid date in YYYY-MM-DD format";
        }
    }

    if (endDate !== undefined) {
        if (!isValidDateString(endDate)) {
            return "End date must be a valid date in YYYY-MM-DD format";
        }
    }

    if (
        startDate !== undefined &&
        endDate !== undefined &&
        startDate > endDate
    ) {
        return "Start date cannot be after end date";
    }

    return null;
}

module.exports = {
    validateCreateTransaction,
    validatePatchTransaction,
    normalizeTransactionData,
    validateTransactionId,
    validateTransactionFilters,
    isValidDateString
};