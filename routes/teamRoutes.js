const express = require("express");

const teamController = require("../controllers/teamController");
const { authenticateToken } = require("../middleware/authMiddleware");
const teamMemberController = require("../controllers/teamMemberController");
const taskController = require("../controllers/taskController");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    teamController.createTeam
);

router.post(
    "/:teamId/members",
    authenticateToken,
    teamMemberController.addTeamMember
);

router.get(
    "/:teamId/members",
    authenticateToken,
    teamMemberController.getTeamMembers
);

router.delete(
    "/:teamId/members/:userId",
    authenticateToken,
    teamMemberController.removeTeamMember
);

router.get(
    "/:teamId",
    authenticateToken,
    teamController.getTeamById
);

router.post(
    "/:teamId/tasks",
    authenticateToken,
    taskController.createTeamTask
);

module.exports = router;