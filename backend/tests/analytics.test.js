const request = require("supertest");
const app = require("../src/app");
const { resetDatabase } = require("./helpers/database");

let token;

beforeEach(async () => {
    await resetDatabase();

    const registerResponse = await request(app)
        .post("/auth/register")
        .send({
            name: "Test User",
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

describe("GET /analytics/trends", () => {
    test("groups transactions by day", async () => {
        await createTransaction({
            type: "income",
            amount: 100000,
            transactionDate: "2026-08-20"
        });

        await createTransaction({
            type: "expense",
            amount: 20000,
            transactionDate: "2026-08-20"
        });

        await createTransaction({
            type: "expense",
            amount: 30000,
            transactionDate: "2026-08-21"
        });

        const response = await request(app)
            .get("/analytics/trends?groupBy=day")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.groupBy).toBe("day");

        expect(response.body.trends).toEqual([
            {
                period: "2026-08-20",
                income: "100000.00",
                expenses: "20000.00"
            },
            {
                period: "2026-08-21",
                income: "0",
                expenses: "30000.00"
            }
        ]);
    });

    test("groups transactions by month", async () => {
        await createTransaction({
            type: "income",
            amount: 500000,
            transactionDate: "2026-07-10"
        });

        await createTransaction({
            type: "expense",
            amount: 100000,
            transactionDate: "2026-07-20"
        });

        await createTransaction({
            type: "income",
            amount: 700000,
            transactionDate: "2026-08-05"
        });

        await createTransaction({
            type: "expense",
            amount: 200000,
            transactionDate: "2026-08-25"
        });

        const response = await request(app)
            .get("/analytics/trends?groupBy=month")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.trends).toEqual([
            {
                period: "2026-07",
                income: "500000.00",
                expenses: "100000.00"
            },
            {
                period: "2026-08",
                income: "700000.00",
                expenses: "200000.00"
            }
        ]);
    });

    test("groups transactions by year", async () => {
        await createTransaction({
            type: "income",
            amount: 1000000,
            transactionDate: "2025-06-10"
        });

        await createTransaction({
            type: "expense",
            amount: 250000,
            transactionDate: "2025-11-20"
        });

        await createTransaction({
            type: "income",
            amount: 2000000,
            transactionDate: "2026-03-15"
        });

        await createTransaction({
            type: "expense",
            amount: 500000,
            transactionDate: "2026-08-20"
        });

        const response = await request(app)
            .get("/analytics/trends?groupBy=year")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.trends).toEqual([
            {
                period: "2025",
                income: "1000000.00",
                expenses: "250000.00"
            },
            {
                period: "2026",
                income: "2000000.00",
                expenses: "500000.00"
            }
        ]);
    });

    test("filters trends by date range", async () => {
        await createTransaction({
            type: "income",
            amount: 100000,
            transactionDate: "2026-07-10"
        });

        await createTransaction({
            type: "income",
            amount: 200000,
            transactionDate: "2026-08-10"
        });

        await createTransaction({
            type: "expense",
            amount: 50000,
            transactionDate: "2026-08-20"
        });

        const response = await request(app)
            .get(
                "/analytics/trends?groupBy=month&startDate=2026-08-01&endDate=2026-08-31"
            )
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.trends).toEqual([
            {
                period: "2026-08",
                income: "200000.00",
                expenses: "50000.00"
            }
        ]);
    });

    test("does not shift a month because of timezone conversion", async () => {
        await createTransaction({
            type: "expense",
            amount: 10000,
            transactionDate: "2026-08-01"
        });

        const response = await request(app)
            .get("/analytics/trends?groupBy=month")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.trends[0].period).toBe("2026-08");
    });

    test("rejects an invalid groupBy value", async () => {
        const response = await request(app)
            .get("/analytics/trends?groupBy=week")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(400);

        expect(response.body.error).toBe(
            "groupBy must be 'day', 'month', or 'year'"
        );
    });
});