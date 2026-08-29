const request = require("supertest");
const app = require("../src/app");
const { resetDatabase } = require("./helpers/database");

let token;

beforeEach(async () => {
    await resetDatabase();

    const registerResponse = await request(app)
        .post("/auth/register")
        .send({
            email: "test@example.com",
            password: "password123",
            currency: "KRW"
        });

    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email: "test@example.com",
            password: "password123"
        });

    expect(loginResponse.statusCode).toBe(200);

    token = loginResponse.body.token;
    expect(token).toBeDefined();
});

async function createTransaction(data) {
    return request(app)
        .post("/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send(data);
}

describe("GET /analytics/summary", () => {
    test("returns correct income, expense, and balance totals", async () => {
        await createTransaction({
            type: "income",
            amount: 100000,
            category: "Salary",
            transactionDate: "2026-08-10"
        });

        await createTransaction({
            type: "expense",
            amount: 30000,
            category: "Food",
            transactionDate: "2026-08-11"
        });

        await createTransaction({
            type: "expense",
            amount: 20000,
            category: "Transport",
            transactionDate: "2026-08-12"
        });

        const response = await request(app)
            .get("/analytics/summary")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.totalIncome).toBe("100000.00");
        expect(response.body.totalExpenses).toBe("50000.00");
        expect(response.body.balance).toBe("50000.00");
    });

    test("filters summary by date range", async () => {
        await createTransaction({
            type: "income",
            amount: 100000,
            transactionDate: "2026-08-01"
        });

        await createTransaction({
            type: "income",
            amount: 50000,
            transactionDate: "2026-08-20"
        });

        await createTransaction({
            type: "expense",
            amount: 10000,
            transactionDate: "2026-08-21"
        });

        const response = await request(app)
            .get(
                "/analytics/summary?startDate=2026-08-15&endDate=2026-08-25"
            )
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.totalIncome).toBe("50000.00");
        expect(response.body.totalExpenses).toBe("10000.00");
        expect(response.body.balance).toBe("40000.00");
    });

    test("returns zero totals when there are no transactions", async () => {
        const response = await request(app)
            .get("/analytics/summary")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.totalIncome).toBe("0");
        expect(response.body.totalExpenses).toBe("0");
        expect(response.body.balance).toBe("0.00");
    });
});

describe("GET /analytics/categories", () => {
    test("returns expense totals grouped by category", async () => {
        await createTransaction({
            type: "expense",
            amount: 50000,
            category: "Food",
            transactionDate: "2026-08-10"
        });

        await createTransaction({
            type: "expense",
            amount: 20000,
            category: "Food",
            transactionDate: "2026-08-11"
        });

        await createTransaction({
            type: "expense",
            amount: 30000,
            category: "Transport",
            transactionDate: "2026-08-12"
        });

        const response = await request(app)
            .get("/analytics/categories")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.totalExpenses).toBe("100000.00");

        expect(response.body.categories).toHaveLength(2);

        expect(response.body.categories[0]).toEqual({
            category: "Food",
            total: "70000.00",
            percentage: 70
        });

        expect(response.body.categories[1]).toEqual({
            category: "Transport",
            total: "30000.00",
            percentage: 30
        });
    });

    test("groups transactions without a category as Uncategorized", async () => {
        await createTransaction({
            type: "expense",
            amount: 10000,
            transactionDate: "2026-08-10"
        });

        const response = await request(app)
            .get("/analytics/categories")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.categories).toEqual([
            {
                category: "Uncategorized",
                total: "10000.00",
                percentage: 100
            }
        ]);
    });

    test("does not include income in expense category analytics", async () => {
        await createTransaction({
            type: "expense",
            amount: 20000,
            category: "Food",
            transactionDate: "2026-08-10"
        });

        await createTransaction({
            type: "income",
            amount: 100000,
            category: "Salary",
            transactionDate: "2026-08-10"
        });

        const response = await request(app)
            .get("/analytics/categories")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.totalExpenses).toBe("20000.00");
        expect(response.body.categories).toHaveLength(1);
        expect(response.body.categories[0].category).toBe("Food");
    });
});