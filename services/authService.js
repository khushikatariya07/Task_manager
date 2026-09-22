const userRepository = require("../repositories/userRepository");
const {
    hashPassword,
    comparePassword
} = require("../utils/passwordUtils");
const { generateToken } = require("../config/jwt");


async function register(name, email, password) {

    validateRegisterData(name, email, password);

    email = email.trim().toLowerCase();

    const existingUser = await userRepository.getUserByEmail(email);

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const passwordHash = await hashPassword(password);

    const user = await userRepository.createUser(
        name,
        email,
        passwordHash
    );

    return user;
}

function validateRegisterData(name, email, password) {

    if (!name || name.trim() === "") {
        throw new Error("Name is required");
    }

    if (!email || email.trim() === "") {
        throw new Error("Email is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
    }

    if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }
}

async function login(email, password) {

    if (!email || email.trim() === "") {
        throw new Error("Email is required");
    }

    if (!password) {
        throw new Error("Password is required");
    }

    email = email.trim().toLowerCase();

    const user = await userRepository.getUserByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(
        password,
        user.passwordhash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = generateToken(user);

    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    return {
        user: safeUser,
        token
    };
}


module.exports = {
    register,
    login
};