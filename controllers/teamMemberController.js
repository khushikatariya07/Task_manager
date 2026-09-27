const teamMemberService = require("../services/teamMemberService");

async function addTeamMember(req, res) {
    try {
        const { teamId } = req.params;
        const { userId, teamRole } = req.body;
        const currentUserId = req.user.sub;

        const teamMember = await teamMemberService.addTeamMember(
            teamId,
            userId,
            teamRole,
            currentUserId
        );

        return res.status(201).json({
            message: "Team member added successfully",
            teamMember
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            message: error.message
        });
    }
}

async function getTeamMembers(req, res) {
    try {
        const { teamId } = req.params;

        const currentUserId = req.user.sub;

        const members = await teamMemberService.getTeamMembers(
            teamId,
            currentUserId
        );

        return res.status(200).json({
            message: "Team members fetched successfully",
            members
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            message: error.message
        });
    }
}

async function removeTeamMember(req, res) {
    try {
        const { teamId, userId } = req.params;

        const currentUserId = req.user.sub;

        const removedMember =
            await teamMemberService.removeTeamMember(
                teamId,
                userId,
                currentUserId
            );

        return res.status(200).json({
            message: "Team member removed successfully",
            removedMember
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            message: error.message
        });
    }
}

module.exports = {
    addTeamMember,
    getTeamMembers,
    removeTeamMember
};
