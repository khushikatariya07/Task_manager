const taskRepository = require("../repositories/taskRepository");
const teamMemberRepository =
    require("../repositories/teamMemberRepository");
const teamRepository =
    require("../repositories/teamRepository");


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
    search,
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

    // Validate status
    if (status && !validStatuses.includes(status)) {
        throw new Error("Invalid status");
    }

    // Validate priority
    if (priority && !validPriorities.includes(priority)) {
        throw new Error("Invalid priority");
    }

    // Convert query parameters to numbers
    page = Number(page);
    limit = Number(limit);

    // Validate page
    if (!Number.isInteger(page) || page < 1) {
        throw new Error("Invalid page");
    }

    // Validate limit
    if (!Number.isInteger(limit) || limit < 1) {
        throw new Error("Invalid limit");
    }

    // Prevent very large requests
    if (limit > 100) {
        throw new Error("Limit cannot be greater than 100");
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get tasks
    const tasks = await taskRepository.getTasks(
        userId,
        status,
        priority,
        search,
        limit,
        offset
    );

    // Get total matching tasks
    const total = await taskRepository.getTaskCount(
        userId,
        status,
        priority,
        search
    );

    // Calculate total pages
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

async function createTeamTask(
    teamId,
    title,
    description,
    priority,
    dueDate,
    assignedTo,
    currentUserId
) {
    // 1. Validate required values
    if (!teamId) {
        throw new Error("Team is required");
    }

    if (!title || title.trim() === "") {
        throw new Error("Task title is required");
    }

    if (!currentUserId) {
        throw new Error("Authenticated user is required");
    }

    if (!assignedTo) {
        throw new Error("Assigned user is required");
    }

    // 2. Check whether team exists
    const team =
        await teamRepository.getTeamById(teamId);

    if (!team) {
        throw new Error("Team not found");
    }

    // 3. Check current user's membership
    const currentMember =
        await teamMemberRepository.getTeamMember(
            teamId,
            currentUserId
        );

    const isCreator =
        Number(team.createdby) === Number(currentUserId);

    if (!isCreator && !currentMember) {
        throw new Error(
            "Only team members can create team tasks"
        );
    }

    // 4. Determine the current user's role
    const isManager =
        isCreator ||
        currentMember.teamrole === "Manager";

    // 5. Check whether assigned user belongs to team
    const assignedMember =
        await teamMemberRepository.getTeamMember(
            teamId,
            assignedTo
        );

    if (!assignedMember) {
        throw new Error(
            "Assigned user is not a member of this team"
        );
    }

    const validPriorities = [
        "Low",
        "Medium",
        "High"
    ];

    if (priority && !validPriorities.includes(priority)) {
        throw new Error("Invalid priority");
    }

    // 6. Members can assign only to themselves
    if (
        !isManager &&
        Number(assignedTo) !== Number(currentUserId)
    ) {
        throw new Error(
            "Members can assign tasks only to themselves"
        );
    }

    // 7. Create the team task
    const task =
        await taskRepository.createTeamTask(
            title.trim(),
            description,
            priority || "Medium",
            dueDate || null,
            currentUserId,
            assignedTo,
            teamId
        );

    return task;
}

module.exports = {
    create,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getDashboard,
    createTeamTask
};