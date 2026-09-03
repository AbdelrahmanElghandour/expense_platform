export function formatCurrency(amount, currency) {
    if (amount === null || amount === undefined) {
        return "";
    }

    const currencyCode = currency || "USD";

    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode
    }).format(Number(amount));
}
