const teamRepository = require("../repositories/teamRepository");
const teamMemberRepository =
    require("../repositories/teamMemberRepository");

async function createTeam(name, description, userId) {

    if (!name || name.trim() === "") {
        throw new Error("Team name is required");
    }

    if (!userId) {
        throw new Error("User is required");
    }

    const team = await teamRepository.createTeam(
        name.trim(),
        description,
        userId
    );

    return team;
}

async function getTeamById(teamId, currentUserId) {

    if (!teamId) {
        throw new Error("Team is required");
    }

    if (!currentUserId) {
        throw new Error("Authenticated user is required");
    }

    // Check whether team exists
    const team = await teamRepository.getTeamById(teamId);

    if (!team) {
        throw new Error("Team not found");
    }

    // Check whether current user is the creator
    const isCreator =
        Number(team.createdby) === Number(currentUserId);

    if (!isCreator) {

        // If not creator, check membership
        const currentMember =
            await teamMemberRepository.getTeamMember(
                teamId,
                currentUserId
            );

        if (!currentMember) {
            throw new Error(
                "Only team members can view team details"
            );
        }
    }

    return team;
}

module.exports = {
    createTeam,
    getTeamById
};

