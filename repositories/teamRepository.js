const pool = require("../config/db");

async function createTeam(name, description, createdBy) {

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Create the team
        const teamQuery = `
            INSERT INTO Teams
            (
                Name,
                Description,
                CreatedBy
            )
            VALUES ($1, $2, $3)
            RETURNING
                Id,
                Name,
                Description,
                CreatedBy,
                CreatedAt,
                UpdatedAt;
        `;

        const teamResult = await client.query(
            teamQuery,
            [name, description, createdBy]
        );

        const team = teamResult.rows[0];

        // 2. Add creator as Manager
        const memberQuery = `
            INSERT INTO TeamMembers
            (
                TeamId,
                UserId,
                TeamRole
            )
            VALUES ($1, $2, $3);
        `;

        await client.query(
            memberQuery,
            [team.id, createdBy, "Manager"]
        );

        // 3. Commit both operations
        await client.query("COMMIT");

        return team;

    } catch (error) {

        // Undo all changes if anything fails
        await client.query("ROLLBACK");

        throw error;

    } finally {
        client.release();
    }
}

async function getTeamById(teamId) {

    const query = `
        SELECT
            Id,
            Name,
            Description,
            CreatedBy,
            CreatedAt,
            UpdatedAt
        FROM Teams
        WHERE Id = $1;
    `;

    const result = await pool.query(query, [teamId]);

    return result.rows[0] || null;
}

module.exports = {
    createTeam,
    getTeamById
};
