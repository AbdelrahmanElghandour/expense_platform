require("./src/config/env");

const app = require("./src/app");

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});