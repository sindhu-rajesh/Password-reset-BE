import mongoose from "mongoose";

// Define the schema for the User model
const userSchema = mongoose.Schema({
    email: String,
    password: String,
    verificationString: {
        type: String,
        default: null
    },
    expiryTime: {
        type: Number,
        default: null
    }
})

// Create a Mongoose model named 'Users' based on the userSchema
const Users = mongoose.model("Users", userSchema);

export default Users;