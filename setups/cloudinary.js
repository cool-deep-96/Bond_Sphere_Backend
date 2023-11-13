require("dotenv").config();
const cloudinary = require('cloudinary').v2

const cloudinaryConnect = async () => {
    await cloudinary.config({
        cloud_name : process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    })
}

module.exports = cloudinaryConnect;