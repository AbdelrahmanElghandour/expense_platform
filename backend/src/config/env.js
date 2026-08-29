const dotenv = require("dotenv");
const path = require("path");

if (process.env.NODE_ENV === "test") {
    dotenv.config({
        path: path.resolve(__dirname, "../../.env.test"),
        quiet: true
    });
} else {
    dotenv.config({
        path: path.resolve(__dirname, "../../.env"),
        quiet: true
    });
}

const requiredEnvVariables = [
    "DB_USER",
    "DB_HOST",
    "DB_NAME",
    "DB_PASSWORD",
    "DB_PORT",
    "JWT_SECRET",
    "PORT",
    "FRONTEND_URL"
];

for (const variable of requiredEnvVariables) {
    if (!process.env[variable]) {
        throw new Error(
            `Missing required environment variable: ${variable}`
        );
    }
}