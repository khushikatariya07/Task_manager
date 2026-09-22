const taskHistoryService = require("../services/taskHistoryService");

async function getTaskHistory(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.sub;

        const history = await taskHistoryService.getTaskHistory(
            userId,
            id
        );

        return res.status(200).json({
            message: "Task history fetched successfully",
            history
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch task history"
        });
    }
}

module.exports = {
    getTaskHistory
};