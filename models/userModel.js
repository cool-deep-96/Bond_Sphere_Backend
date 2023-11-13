const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        urlToImg: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        followings: [{
                userId: {
                    type: String,
                }
            }],
        followers: [{
            userId: {
                type: String,
            }
        }],
        bio: {
            type: String,
            max: 500,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);