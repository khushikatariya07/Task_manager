const pool = require("../config/db");

async function addTeamMember(teamId, userId, teamRole) {

    const query = `
        INSERT INTO TeamMembers
        (
            TeamId,
            UserId,
            TeamRole
        )
        VALUES ($1, $2, $3)
        RETURNING
            Id,
            TeamId,
            UserId,
            TeamRole,
            JoinedAt;
    `;

    const values = [
        teamId,
        userId,
        teamRole
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}

async function getTeamMember(teamId, userId) {
    const query = `
        SELECT
            Id,
            TeamId,
            UserId,
            TeamRole
        FROM TeamMembers
        WHERE TeamId = $1
        AND UserId = $2;
    `;

    const result = await pool.query(query, [
        teamId,
        userId
    ]);

    return result.rows[0] || null;
}

async function getTeamMembers(teamId) {
    const query = `
        SELECT
            tm.Id,
            tm.TeamId,
            tm.UserId,
            u.Name,
            u.Email,
            tm.TeamRole,
            tm.JoinedAt
        FROM TeamMembers tm
        INNER JOIN Users u
            ON tm.UserId = u.Id
        WHERE tm.TeamId = $1
        ORDER BY tm.JoinedAt ASC;
    `;

    const result = await pool.query(query, [teamId]);

    return result.rows;
}

async function removeTeamMember(teamId, userId) {

    const query = `
        DELETE FROM TeamMembers
        WHERE TeamId = $1
        AND UserId = $2
        RETURNING
            Id,
            TeamId,
            UserId,
            TeamRole;
    `;

    const result = await pool.query(query, [
        teamId,
        userId
    ]);

    return result.rows[0] || null;
}

module.exports = {
    addTeamMember,
    getTeamMember,
    getTeamMembers,
    removeTeamMember
};