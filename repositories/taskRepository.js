const pool = require("../config/db");

async function createTask(
    title,
    description,
    priority,
    status,
    dueDate,
    createdBy,
    assignedTo
) {

    const query = `
    INSERT INTO Tasks
    (
        Title,
        Description,
        Priority,
        Status,
        DueDate,
        CreatedBy,
        AssignedTo
    )
    VALUES
    ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
`;

const values = [
    title,
    description,
    priority,
    status,
    dueDate,
    createdBy,
    assignedTo
];

const result = await pool.query(query, values);

return result.rows[0];

}

async function getTasks(
    userId,
    status,
    priority,
    search,
    limit,
    offset
) {
    let query = `
        SELECT
            Id,
            Title,
            Description,
            Priority,
            Status,
            DueDate,
            CreatedBy,
            AssignedTo,
            CreatedAt,
            UpdatedAt
        FROM Tasks
        WHERE CreatedBy = $1
    `;

    const values = [userId];
    let parameterIndex = 2;

    // Filter by status
    if (status) {
        query += ` AND Status = $${parameterIndex}`;
        values.push(status);
        parameterIndex++;
    }

    // Filter by priority
    if (priority) {
        query += ` AND Priority = $${parameterIndex}`;
        values.push(priority);
        parameterIndex++;
    }

    // Search by title
    if (search) {
        query += ` AND Title ILIKE $${parameterIndex}`;
        values.push(`%${search}%`);
        parameterIndex++;
    }

    query += `
        ORDER BY CreatedAt DESC
        LIMIT $${parameterIndex}
        OFFSET $${parameterIndex + 1}
    `;

    values.push(limit);
    values.push(offset);

    const result = await pool.query(query, values);

    return result.rows;
}


async function getTaskCount(
    userId,
    status,
    priority,
    search
) {
    let query = `
        SELECT COUNT(*) AS total
        FROM Tasks
        WHERE CreatedBy = $1
    `;

    const values = [userId];
    let parameterIndex = 2;

    // Filter by status
    if (status) {
        query += ` AND Status = $${parameterIndex}`;
        values.push(status);
        parameterIndex++;
    }

    // Filter by priority
    if (priority) {
        query += ` AND Priority = $${parameterIndex}`;
        values.push(priority);
        parameterIndex++;
    }

    // Search by title
    if (search) {
        query += ` AND Title ILIKE $${parameterIndex}`;
        values.push(`%${search}%`);
        parameterIndex++;
    }

    const result = await pool.query(query, values);

    return Number(result.rows[0].total);
}

async function getTaskById(userid, id){
    const query = `SELECT id , title, priority, status, dueDate , createdBy , assignedTo FROM Tasks WHERE CreatedBy = $1 AND id = $2 ;`;
    const values = [userid,id]
    const result = await pool.query(query, values);
    return result.rows[0] || null;
}

async function updateTask(
    userId,
    taskId,
    title,
    description,
    priority,
    dueDate
) {
    const query = `
        UPDATE Tasks
        SET
            Title = $1,
            Description = $2,
            Priority = $3,
            DueDate = $4,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE Id = $5
        AND CreatedBy = $6
        RETURNING
            Id,
            Title,
            Description,
            Priority,
            Status,
            DueDate,
            CreatedBy,
            AssignedTo,
            UpdatedAt;
    `;

    const values = [
        title,
        description,
        priority,
        dueDate,
        taskId,
        userId
    ];

    const result = await pool.query(query, values);

    return result.rows[0] || null;
}

async function deleteTask(userId, taskId) {
    const query = `
        DELETE FROM Tasks
        WHERE Id = $1
        AND CreatedBy = $2
        RETURNING Id;
    `;

    const values = [taskId, userId];

    const result = await pool.query(query, values);

    return result.rows[0] || null;
}

async function updateTaskStatusWithHistory(
    userId,
    taskId,
    newStatus
) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Get current status
        const existingResult = await client.query(
            `
            SELECT Id, Status
            FROM Tasks
            WHERE Id = $1
            AND CreatedBy = $2;
            `,
            [taskId, userId]
        );

        const existingTask = existingResult.rows[0];

        if (!existingTask) {
            await client.query("ROLLBACK");
            return null;
        }

        const oldStatus = existingTask.status;

        // 2. Don't create unnecessary history
        if (oldStatus === newStatus) {
            await client.query("ROLLBACK");
            throw new Error("Task already has this status");
        }

        // 3. Update task
        const updateResult = await client.query(
            `
            UPDATE Tasks
            SET
                Status = $1,
                UpdatedAt = CURRENT_TIMESTAMP
            WHERE Id = $2
            AND CreatedBy = $3
            RETURNING
                Id,
                Title,
                Description,
                Priority,
                Status,
                DueDate,
                CreatedBy,
                AssignedTo,
                UpdatedAt;
            `,
            [newStatus, taskId, userId]
        );

        const task = updateResult.rows[0];

        // 4. Insert history
        await client.query(
            `
            INSERT INTO TaskHistory
            (
                TaskId,
                UserId,
                Action,
                OldValue,
                NewValue
            )
            VALUES ($1, $2, $3, $4, $5);
            `,
            [
                taskId,
                userId,
                "Status Changed",
                oldStatus,
                newStatus
            ]
        );

        // 5. Everything succeeded
        await client.query("COMMIT");

        return task;

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }
}

async function getDashboard(userId) {
    const query = `
        SELECT
            COUNT(*) AS total,

            COUNT(
                CASE
                    WHEN Status = 'Pending'
                    THEN 1
                END
            ) AS pending,

            COUNT(
                CASE
                    WHEN Status = 'In Progress'
                    THEN 1
                END
            ) AS "inProgress",

            COUNT(
                CASE
                    WHEN Status = 'Completed'
                    THEN 1
                END
            ) AS completed,

            COUNT(
                CASE
                    WHEN DueDate < CURRENT_DATE
                    AND Status != 'Completed'
                    THEN 1
                END
            ) AS overdue

        FROM Tasks
        WHERE CreatedBy = $1;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0];
}

async function createTeamTask(
    title,
    description,
    priority,
    dueDate,
    createdBy,
    assignedTo,
    teamId
) {
    const query = `
        INSERT INTO Tasks
        (
            Title,
            Description,
            Priority,
            DueDate,
            CreatedBy,
            AssignedTo,
            TeamId
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
            Id,
            Title,
            Description,
            Priority,
            Status,
            DueDate,
            CreatedBy,
            AssignedTo,
            TeamId,
            CreatedAt,
            UpdatedAt;
    `;

    const values = [
        title,
        description,
        priority,
        dueDate,
        createdBy,
        assignedTo,
        teamId
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}



module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatusWithHistory,
    getDashboard,
    getTaskCount,
    createTeamTask
};