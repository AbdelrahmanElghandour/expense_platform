const request = require("supertest");
const app = require("../src/app");
const { resetDatabase } = require("./helpers/database");

beforeEach(async () => {
    await resetDatabase();
});

describe("POST /auth/register", () => {
    test("registers a valid user", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                email: "test@example.com",
                password: "password123",
                currency: "KRW"
            });
        console.log(response.statusCode);
        console.log(response.body);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("user");

        expect(response.body.user.email).toBe("test@example.com");
        expect(response.body.user.default_currency).toBe("KRW");
    });

    test("rejects an invalid email", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                email: "bad-email",
                password: "password123",
                currency: "KRW"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });
    test("rejects a duplicate email", async () => {
    const userData = {
        email: "test@example.com",
        password: "password123",
        currency: "KRW"
    };

    const firstResponse = await request(app)
        .post("/auth/register")
        .send(userData);

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app)
        .post("/auth/register")
        .send(userData);

    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.body).toHaveProperty("error");
});
test("logs in with valid credentials", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                email: "test@example.com",
                password: "password123",
                currency: "KRW"
            });

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "test@example.com",
                password: "password123"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user.email).toBe("test@example.com");
    });

    test("rejects a wrong password", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                email: "test@example.com",
                password: "password123",
                currency: "KRW"
            });

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "test@example.com",
                password: "wrongpassword"
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe("Invalid email or password");
    });

    test("rejects a nonexistent user", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "nobody@example.com",
                password: "password123"
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe("Invalid email or password");
    });
    test("rejects request without token", async () => {
        const response = await request(app)
            .get("/transactions");

        expect(response.statusCode).toBe(401);
    });

    test("rejects request with invalid token", async () => {
        const response = await request(app)
            .get("/transactions")
            .set("Authorization", "Bearer invalid-token");

        expect(response.statusCode).toBe(401);
    });

    test("accepts request with valid token", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                email: "test@example.com",
                password: "password123",
                currency: "KRW"
            });

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                email: "test@example.com",
                password: "password123"
            });

        const token = loginResponse.body.token;

        const response = await request(app)
            .get("/transactions")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
    });
});