const bcrypt = require("bcrypt");

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function comparePassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
}

module.exports = {
    hashPassword,
    comparePassword
};