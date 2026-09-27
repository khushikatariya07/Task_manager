const teamService = require("../services/teamService");

async function createTeam(req, res) {
    try {
        const { name, description } = req.body;

        const userId = req.user.sub;

        const team = await teamService.createTeam(
            name,
            description,
            userId
        );

        return res.status(201).json({
            message: "Team created successfully",
            team
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            message: error.message
        });
    }
}

async function getTeamById(req, res) {
    try {
        const { teamId } = req.params;
        const currentUserId = req.user.sub;

        const team = await teamService.getTeamById(
            teamId,
            currentUserId
        );

        return res.status(200).json({
            message: "Team fetched successfully",
            team
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            message: error.message
        });
    }
}

module.exports = {
    createTeam,
    getTeamById
};