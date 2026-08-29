const dotenv = require("dotenv");

if (process.env.NODE_ENV === "test") {
    dotenv.config({
        path: ".env.test"
    });
} else {
    dotenv.config();
}

const requiredEnvVariables = [
    "DB_USER",
    "DB_HOST",
    "DB_NAME",
    "DB_PASSWORD",
    "DB_PORT",
    "JWT_SECRET",
    "PORT"
];

for (const variable of requiredEnvVariables) {
    if (!process.env[variable]) {
        throw new Error(
            `Missing required environment variable: ${variable}`
        );
    }
}