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


describe("POST /transactions", () => {
    test("creates a valid expense", async () => {
        const response = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                type: "expense",
                amount: 15000,
                category: "Food",
                payment_method: "Credit Card",
                notes: "Lunch",
                transactionDate: "2026-08-28"
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.type).toBe("expense");
        expect(response.body.type).toBe("expense");
        expect(response.body.amount).toBe("15000.00");
        expect(response.body.notes).toBe("Lunch");
        expect(response.body.category_id).not.toBeNull();
    });
});

describe("PATCH /transactions/:transactionId", () => {
    test("updates an owned transaction", async () => {
        const createResponse = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                type: "expense",
                amount: 15000,
                category: "Food",
                payment_method: "Credit Card",
                notes: "Lunch",
                transactionDate: "2026-08-28"
            });

        const transactionId = createResponse.body.id;

        const response = await request(app)
            .patch(`/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount: 20000,
                notes: "Dinner"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.amount).toBe("20000.00");
        expect(response.body.notes).toBe("Dinner");
    });
});

describe("DELETE /transactions/:transactionId", () => {
    test("deletes an owned transaction", async () => {
        const createResponse = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                type: "expense",
                amount: 15000,
                category: "Food",
                transactionDate: "2026-08-28"
            });

        const transactionId = createResponse.body.id;

        const response = await request(app)
            .delete(`/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Transaction deleted successfully");
    });
});

describe("Transaction ownership", () => {
    test("cannot update another user's transaction", async () => {
        // User 1 creates a transaction
        const createResponse = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                type: "expense",
                amount: 15000,
                category: "Food",
                transactionDate: "2026-08-28"
            });

        const transactionId = createResponse.body.id;

        // Create User 2
        await request(app)
            .post("/auth/register")
            .send({
                email: "user2@example.com",
                password: "password123",
                currency: "KRW"
            });

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                email: "user2@example.com",
                password: "password123"
            });

        const user2Token = loginResponse.body.token;

        // User 2 tries to modify User 1's transaction
        const response = await request(app)
            .patch(`/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${user2Token}`)
            .send({
                amount: 99999
            });

        expect(response.statusCode).toBe(404);
    });

    test("cannot delete another user's transaction", async () => {
        const createResponse = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                type: "expense",
                amount: 15000,
                category: "Food",
                transactionDate: "2026-08-28"
            });

        const transactionId = createResponse.body.id;

        await request(app)
            .post("/auth/register")
            .send({
                email: "user2@example.com",
                password: "password123",
                currency: "KRW"
            });

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                email: "user2@example.com",
                password: "password123"
            });

        const user2Token = loginResponse.body.token;

        const response = await request(app)
            .delete(`/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${user2Token}`);

        expect(response.statusCode).toBe(404);
    });
});

describe("Transaction validation", () => {
    test("rejects an invalid transaction type", async () => {
        const response = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                type: "random",
                amount: 15000,
                category: "Food",
                transactionDate: "2026-08-28"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    test("rejects a non-positive amount", async () => {
        const response = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                type: "expense",
                amount: -100,
                category: "Food",
                transactionDate: "2026-08-28"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    test("rejects an invalid date", async () => {
        const response = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                type: "expense",
                amount: 15000,
                category: "Food",
                transactionDate: "not-a-date"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });
});

test("rejects an invalid PATCH amount", async () => {
    const createResponse = await request(app)
        .post("/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
            type: "expense",
            amount: 15000,
            category: "Food",
            transactionDate: "2026-08-28"
        });

    const transactionId = createResponse.body.id;

    const response = await request(app)
        .patch(`/transactions/${transactionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            amount: -500
        });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
});
describe("GET /transactions", () => {
    test("filters transactions by type", async () => {
        await createTransaction({
            type: "expense",
            amount: 10000,
            category: "Food",
            transactionDate: "2026-08-20"
        });

        await createTransaction({
            type: "income",
            amount: 50000,
            category: "Salary",
            transactionDate: "2026-08-21"
        });

        const response = await request(app)
            .get("/transactions?type=expense")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.transactions).toHaveLength(1);
        expect(response.body.transactions[0].type).toBe("expense");
    });

    test("filters transactions by category", async () => {
        await createTransaction({
            type: "expense",
            amount: 10000,
            category: "Food",
            transactionDate: "2026-08-20"
        });

        await createTransaction({
            type: "expense",
            amount: 30000,
            category: "Transport",
            transactionDate: "2026-08-21"
        });

        const response = await request(app)
            .get("/transactions?category=Food")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.transactions).toHaveLength(1);
        expect(response.body.transactions[0].category).toBe("Food");
    });

    test("filters transactions by date range", async () => {
        await createTransaction({
            type: "expense",
            amount: 10000,
            transactionDate: "2026-08-10"
        });

        await createTransaction({
            type: "expense",
            amount: 20000,
            transactionDate: "2026-08-20"
        });

        await createTransaction({
            type: "expense",
            amount: 30000,
            transactionDate: "2026-08-30"
        });

        const response = await request(app)
            .get("/transactions?startDate=2026-08-15&endDate=2026-08-25")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.transactions).toHaveLength(1);
        expect(response.body.transactions[0].amount).toBe("20000.00");
    });

    test("paginates transactions", async () => {
        for (let i = 1; i <= 5; i++) {
            await createTransaction({
                type: "expense",
                amount: i * 1000,
                transactionDate: `2026-08-${10 + i}`
            });
        }

        const response = await request(app)
            .get("/transactions?page=2&limit=2")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.page).toBe(2);
        expect(response.body.limit).toBe(2);
        expect(response.body.totalTransactions).toBe(5);
        expect(response.body.totalPages).toBe(3);
        expect(response.body.transactions).toHaveLength(2);
    });
});