const express = require("express");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const teamRoutes = require("./routes/teamRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Task Management API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);

module.exports = app;