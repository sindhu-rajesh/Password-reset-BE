import Users from "../Models/user.schema.js"
import bcrypt from "bcryptjs"
import mail from "../Services/nodemailer.services.js";
import randomString from "randomstring"


// Controller function to handle user registration
export const register = async (req, res) => {
    const { email, password } = req.body;
    try {

        const user = await Users.findOne({ email });

        if (user) {
            return res.status(200).json({
                status: false,
                message: "User already registered"
            })
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const newuser = await Users.create({ email, password: hashPassword });
        return res.status(201).json({
            status: true,
            message: "User registered"
        })

    } catch (error) {
        console.log(error);
    }
}

// Controller function to handle user login
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(200).json({
                message: "User not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return res.status(200).json({
                message: "Password matched"
            })
        }

        res.status(200).json({
            message: "login failed"
        })
    } catch (error) {
        console.log(error);
    }
}

// Controller function to handle forgot password requests
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await Users.findOne({ email });
        if (!user) {
            res.status(200).json({ message: "User not found" });
        }

        res.json({ message: "User found" });
        const randomStr = randomString.generate({
            length: 20,
            charset: "alphanumeric"
        })

        const expiryTime = new Date().getTime() + 600000;

        user.verificationString = randomStr;
        user.expiryTime = expiryTime;
        await user.save();
        mail(email, randomStr);

    } catch (error) {
        console.log(error);
    }
}

// Controller function to handle verification of password reset links
export const verifyString = async (req, res) => {
    const { verificationString} = req.body;
    const user = await Users.findOne({ verificationString });
    const currentTime = new Date().getTime();
    if (!user) {
        return res.json({ message: "not match" })
    }

    if (user.expiryTime < currentTime) {
        user.verificationString = null;
        user.expiryTime = null;
        await user.save();
        return res.json({ message: "link expired" });
    }

    res.status(200).json({ message: "matched" });
}

// Controller function to handle password changes
export const changePassword = async (req, res) => {
    const { verificationString, newPassword } = req.body;
    const user = await Users.findOne({ verificationString });

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    user.verificationString = null;
    user.expiryTime = null;
    await user.save();

    res.status(200).json({ message: "Password changed" });
}