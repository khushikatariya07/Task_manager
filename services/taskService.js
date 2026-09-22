const taskRepository = require("../repositories/taskRepository");


async function create(
    title,
    description,
    priority = "Medium",
    dueDate,
    userId
) {
    // Validate title
    if (!title || title.trim() === "") {
        throw new Error("Title is required");
    }

    // Validate priority
    const validPriorities = ["Low", "Medium", "High"];

    if (!validPriorities.includes(priority)) {
        throw new Error("Invalid priority");
    }

    // Validate user
    if (!userId) {
        throw new Error("User is required");
    }

    // Individual task rules
    const status = "Pending";
    const createdBy = userId;
    const assignedTo = userId;

    const task = await taskRepository.createTask(
        title.trim(),
        description,
        priority,
        status,
        dueDate,
        createdBy,
        assignedTo
    );

    return task;
}

async function getTasks(
    userId,
    status,
    priority,
    page,
    limit
) {
    const validStatuses = [
        "Pending",
        "In Progress",
        "Completed"
    ];

    const validPriorities = [
        "Low",
        "Medium",
        "High"
    ];

    if (status && !validStatuses.includes(status)) {
        throw new Error("Invalid status");
    }

    if (priority && !validPriorities.includes(priority)) {
        throw new Error("Invalid priority");
    }

    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
        throw new Error("Invalid page");
    }

    if (!Number.isInteger(limit) || limit < 1) {
        throw new Error("Invalid limit");
    }

    if (limit > 100) {
        throw new Error("Limit cannot be greater than 100");
    }

    const offset = (page - 1) * limit;

    const tasks = await taskRepository.getTasks(
        userId,
        status,
        priority,
        limit,
        offset
    );

    const total = await taskRepository.getTaskCount(
        userId,
        status,
        priority
    );

    const totalPages = Math.ceil(total / limit);

    return {
        tasks,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };
}

async function getTaskById(userid ,id){
    const task = await taskRepository.getTaskById(userid, id);

    return task;
}

async function updateTask(
    userId,
    taskId,
    title,
    description,
    priority,
    dueDate
) {
    if (!title || title.trim() === "") {
        throw new Error("Title is required");
    }

    const validPriorities = ["Low", "Medium", "High"];

    if (!validPriorities.includes(priority)) {
        throw new Error("Invalid priority");
    }

    const task = await taskRepository.updateTask(
        userId,
        taskId,
        title.trim(),
        description,
        priority,
        dueDate
    );

    return task;
}

async function deleteTask(userId, taskId) {
    const task = await taskRepository.deleteTask(
        userId,
        taskId
    );

    return task;
}

async function updateTaskStatus(userId, taskId, status) {

    const validStatuses = [
        "Pending",
        "In Progress",
        "Completed"
    ];

    if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
    }

    return await taskRepository.updateTaskStatusWithHistory(
        userId,
        taskId,
        status
    );
}

async function getDashboard(userId) {
    const dashboard = await taskRepository.getDashboard(userId);

    return {
        total: Number(dashboard.total),
        pending: Number(dashboard.pending),
        inProgress: Number(dashboard.inProgress),
        completed: Number(dashboard.completed),
        overdue: Number(dashboard.overdue)
    };
}

module.exports = {
    create,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getDashboard
};