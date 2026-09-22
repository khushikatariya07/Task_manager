require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");

const port = 5000;

async function startServer() {
    try {
        await pool.query("SELECT 1");

        console.log("Database connected successfully");

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
}

startServer();


