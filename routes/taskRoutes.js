const express = require("express");

const taskController = require("../controllers/taskController");
const { authenticateToken } = require("../middleware/authMiddleware");
const taskHistoryController = require("../controllers/taskHistoryController");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    taskController.createTask
);

router.get("/", authenticateToken, taskController.getTasks);

router.get(
    "/dashboard",
    authenticateToken,
    taskController.getDashboard
);

router.patch(
    "/:id/status",
    authenticateToken,
    taskController.updateTaskStatus
);

router.get(
    "/:id/history",
    authenticateToken,
    taskHistoryController.getTaskHistory
);

router.get(
    "/:id",
    authenticateToken,
    taskController.getTaskById
);

router.put(
    "/:id",
    authenticateToken,
    taskController.updateTask
);

router.delete(
    "/:id",
    authenticateToken,
    taskController.deleteTask
);



module.exports = router;