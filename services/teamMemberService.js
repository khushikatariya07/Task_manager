const teamMemberRepository = require("../repositories/teamMemberRepository");
const teamRepository = require("../repositories/teamRepository");

async function addTeamMember(
    teamId,
    userId,
    teamRole = "Member",
    currentUserId
) {
    if (!teamId) {
        throw new Error("Team is required");
    }

    if (!userId) {
        throw new Error("User is required");
    }

    if (!currentUserId) {
        throw new Error("Authenticated user is required");
    }

    const validRoles = [
        "Manager",
        "Member"
    ];

    if (!validRoles.includes(teamRole)) {
        throw new Error("Invalid team role");
    }

    const team = await teamRepository.getTeamById(teamId);

    if (!team) {
        throw new Error("Team not found");
    }

    const isCreator =
        Number(team.createdby) === Number(currentUserId);

    if (!isCreator) {

        const currentMember =
            await teamMemberRepository.getTeamMember(
                teamId,
                currentUserId
            );

        if (!currentMember || currentMember.teamrole !== "Manager") {
            throw new Error(
                "Only the team creator or manager can add members"
            );
        }
    }

    const teamMember =
        await teamMemberRepository.addTeamMember(
            teamId,
            userId,
            teamRole
        );

    return teamMember;
}

async function getTeamMembers(teamId, currentUserId) {

    if (!teamId) {
        throw new Error("Team is required");
    }

    if (!currentUserId) {
        throw new Error("Authenticated user is required");
    }

    const team = await teamRepository.getTeamById(teamId);

    if (!team) {
        throw new Error("Team not found");
    }

    // Team creator automatically has access
    const isCreator =
        Number(team.createdby) === Number(currentUserId);

    if (!isCreator) {

        const currentMember =
            await teamMemberRepository.getTeamMember(
                teamId,
                currentUserId
            );

        if (!currentMember) {
            throw new Error(
                "Only team members can view team members"
            );
        }
    }

    const members =
        await teamMemberRepository.getTeamMembers(teamId);

    return members;
}

async function removeTeamMember(
    teamId,
    targetUserId,
    currentUserId
) {
    if (!teamId) {
        throw new Error("Team is required");
    }

    if (!targetUserId) {
        throw new Error("Target user is required");
    }

    if (!currentUserId) {
        throw new Error("Authenticated user is required");
    }

    // 1. Check whether the team exists
    const team = await teamRepository.getTeamById(teamId);

    if (!team) {
        throw new Error("Team not found");
    }

    // 2. Creator cannot be removed
    if (
        Number(targetUserId) === Number(team.createdby)
    ) {
        throw new Error(
            "Team creator cannot be removed"
        );
    }

    // 3. Find the target member
    const targetMember =
        await teamMemberRepository.getTeamMember(
            teamId,
            targetUserId
        );

    if (!targetMember) {
        throw new Error(
            "Team member not found"
        );
    }

    // 4. Check whether current user is the creator
    const isCreator =
        Number(team.createdby) === Number(currentUserId);

    // 5. If not creator, current user must be a Manager
    let currentMember = null;

    if (!isCreator) {
        currentMember =
            await teamMemberRepository.getTeamMember(
                teamId,
                currentUserId
            );

        if (
            !currentMember ||
            currentMember.teamrole !== "Manager"
        ) {
            throw new Error(
                "Only the team creator or manager can remove members"
            );
        }
    }

    // 6. Manager cannot remove another Manager
    if (
        !isCreator &&
        targetMember.teamrole === "Manager"
    ) {
        throw new Error(
            "Managers cannot remove other managers"
        );
    }

    // 7. Remove the member
    const removedMember =
        await teamMemberRepository.removeTeamMember(
            teamId,
            targetUserId
        );

    return removedMember;
}

module.exports = {
    addTeamMember,
    getTeamMembers,
    removeTeamMember
};