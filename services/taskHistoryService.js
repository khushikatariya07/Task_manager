const taskHistoryRepository = require("../repositories/taskHistoryRepository");

async function getTaskHistory(userId, taskId) {
    return await taskHistoryRepository.getTaskHistory(
        userId,
        taskId
    );
}

module.exports = {
    getTaskHistory
};