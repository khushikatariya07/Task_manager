const authService = require("../services/authService");

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        

        const user = await authService.register(
            name,
            email,
            password
        );

        return res.status(201).json({
            message: "User registered successfully",
            user
        });

    } catch (error) {
        console.error(error);

        if (error.message === "Email already registered") {
            return res.status(409).json({
                message: error.message
            });
        }

        return res.status(400).json({
            message: error.message
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        return res.status(200).json({
            message: "User logged in successfully",
            user: result.user,
            token: result.token
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            message: error.message
        });
    }
}


function profile(req, res) {

    return res.status(200).json({
        message: "Profile fetched successfully",
        user: req.user
    });
}



module.exports = {
    register,
    login,
    profile
};