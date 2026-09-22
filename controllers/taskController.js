const taskService = require("../services/taskService");

async function createTask(req, res) {
    try {
        const { 
            title,
            description,
            priority,
            dueDate
        } = req.body;

        // Get logged-in user's ID from JWT
        const userId = req.user.sub;

        const task = await taskService.create(
            title,
            description,
            priority,
            dueDate,
            userId
        );

        return res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            message: error.message
        });
    }
}

async function getTasks(req, res) {
    try {
        const userId = req.user.sub;

        const {
            status,
            priority,
            page = 1,
            limit = 10
        } = req.query;

        const result = await taskService.getTasks(
            userId,
            status,
            priority,
            page,
            limit
        );

        return res.status(200).json({
            message: "Tasks fetched successfully",
            tasks: result.tasks,
            pagination: result.pagination
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            message: error.message
        });
    }
}

async function getTaskById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.sub;

        const task = await taskService.getTaskById(userId, id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            message: "Task fetched successfully",
            task
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch task"
        });
    }
}

async function updateTask(req, res) {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            priority,
            dueDate
        } = req.body;

        const userId = req.user.sub;

        const task = await taskService.updateTask(
            userId,
            id,
            title,
            description,
            priority,
            dueDate
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            message: error.message
        });
    }
}

async function deleteTask(req, res) {
    try {
        const { id } = req.params;

        const userId = req.user.sub;

        const task = await taskService.deleteTask(
            userId,
            id
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to delete task"
        });
    }
}

async function updateTaskStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const userId = req.user.sub;

        const task = await taskService.updateTaskStatus(
            userId,
            id,
            status
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            message: "Task status updated successfully",
            task
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            message: error.message
        });
    }
}

async function getDashboard(req, res) {
    try {
        const userId = req.user.sub;

        const dashboard = await taskService.getDashboard(userId);

        return res.status(200).json({
            message: "Dashboard fetched successfully",
            dashboard
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch dashboard"
        });
    }
}

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getDashboard
};