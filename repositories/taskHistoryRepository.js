const pool = require("../config/db");

async function createHistory(
    taskId,
    userId,
    action,
    oldValue,
    newValue
) {
    const query = `
        INSERT INTO TaskHistory
        (
            TaskId,
            UserId,
            Action,
            OldValue,
            NewValue
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const values = [
        taskId,
        userId,
        action,
        oldValue,
        newValue
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}

async function getTaskHistory(userId, taskId) {
    const query = `
        SELECT
            th.Id,
            th.TaskId,
            th.UserId,
            u.Name AS UserName,
            th.Action,
            th.OldValue,
            th.NewValue,
            th.CreatedAt
        FROM TaskHistory th
        INNER JOIN Users u
            ON th.UserId = u.Id
        INNER JOIN Tasks t
            ON th.TaskId = t.Id
        WHERE th.TaskId = $1
        AND t.CreatedBy = $2
        ORDER BY th.CreatedAt DESC;
    `;

    const result = await pool.query(query, [
        taskId,
        userId
    ]);

    return result.rows;
}

module.exports = {
    createHistory,
    getTaskHistory
};