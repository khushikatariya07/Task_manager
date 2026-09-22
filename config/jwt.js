const jwt = require("jsonwebtoken");

function generateToken(user) {

    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );
}

module.exports = {
    generateToken
};




























// const {
//     hashPassword,
//     comparePassword
// } = require("../utils/passwordUtils");

// async function test() {
//     const password = "Khushi@123";

//     const hash = await hashPassword(password);

//     console.log("Original:", password);
//     console.log("Hash:", hash);

//     const valid = await comparePassword(password, hash);

//     console.log("Correct password:", valid);

//     const invalid = await comparePassword("WrongPassword", hash);

//     console.log("Wrong password:", invalid);
// }

// test();