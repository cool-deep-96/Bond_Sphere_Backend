const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        urlToImg: {
            type: String,
            required: true
        },
        likes: [{
                userId: {
                    type: String,
                }
            }],
        caption: {
            type: String,
            max: 500,
        },
        comments: [
            {
                commentedBY: {
                    type: String,

                },
                comment: {
                    type: String,

                }
            }
        ],



    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);