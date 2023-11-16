const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('../middlewares/bcrypt');
const { revokeToken } = require('../middlewares/authMiddleware');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const upload = async (fileURLToPath) => {
    console.log("1");
    const response = await cloudinary.uploader.upload(fileURLToPath, {folder: "BOND_SPHERE/PROFILES"}, (error, result) => {
        if(error){
            console.log("error", error);
            throw new Error (error);
        }
        console.log("result ", result);
        return result;
    })
    return response;
}

const getuser =  async (req, res) => {
    try{
        const Users = await User.find({userId : req.params.userId}).select('-password -updatedAt -createdAt -__v');
        res.status(200).json(Users);
    
    } catch(err){
        console.log(err);
        res.status(500).json("error");
    }
}


const createUser = async (req, res) => {
    try {
        const file = req.file;
        if(!file){
            return res.status(400).json({
                success: "false",
                message: "profile photo is required"
            })
        }

        const isEmail = await User.findOne({ email: req.body.email });
        const isUserId = await User.findOne({ userId: req.body.userId });
        if (isEmail || isUserId) {
            if (isEmail) {
                return res.status(400).send({
                    success: false,
                    message: "Email is Already Registered please login",
                });
            }
            return res.status(400).send({
                success: false,
                message: "UserId is Already Register please enter different userId",
            });
        }

        const fileURLToPath = `public/userImg/${req.file.filename}`;

        const result = await upload(fileURLToPath);
        console.log("fgfg",result);
        fs.unlink(fileURLToPath, (error) =>{
            if(error){
                throw new Error({
                    message: "internal server error"
                })
            }
        });

        const hashedPassword = await bcrypt.hashPassword(req.body.password);
        const newPost = new User({
            userId: req.body.userId,
            urlToImg: result.url,
            email: req.body.email,
            bio: req.body.bio,
            password: hashedPassword
        });
        await newPost.save();
        res.status(200).json({
            message : `${req.body.userId} is Resigtered successfully`

        });
    } catch (err) {
        console.log("err",err);
        res.status(500).json(err);
    }
};

const login = async (req, res) => {
    try {
        const userId = req.body.userId;
        const password = req.body.password;

        const userDB = await User.findOne({ userId: userId });
        if (!userDB) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }
        const check = await bcrypt.comparePassword(password, userDB.password);
        if (!check) {
            return res.status(404).send({
                success: false,
                message: "Invalid userId or Password",
            });
        }

        const payload = { userId: userDB.userId };
        const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: "1h"
        });
        res.status(200).send({
            success: true,
            message: "You have successfully login",
            token,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

const logout = async (req, res) => {
    console.log(req.user.userId);
    const token = req.header("authorization").replace("Bearer ", "");
    console.log(token);
    revokeToken(token);


    res.status(200).send("token have been varified");

}

const allUsers = async (req, res) => {
    try{
    const allUsers = await User.find({$nor : [{userId : req.user.userId}]}).select('-password -updatedAt -createdAt -__v');
    res.status(200).json(allUsers);

    } catch(err){
        console.log(err);
        res.status(500).json("error");
    }
}
// // const updateUser = async (req, res) => {
// //     try {
// //         const user = await User.findById(req.params.id);
// //         await user.updateOne({


// //         });
// //         res.status(200).json("the User has been updated");
// //     } catch (err) {
// //         res.status(500).json(err);
// //     }
// // };

const followUser = async (req, res) => {
    try {
        if(req.params.userId === req.user.userId) {
            return res.status(300).json("you can not follow yourself");
        }

        const user = await User.findOne({ userId :req.params.userId});
        if (!user) {
            return res.status(300).json("User not found");
        }

        const followed = await User.findOne({ "followers.userId" : req.user.userId});
        console.log(followed);

        if (!followed) {
            await User.updateOne({ userId: req.user.userId }, {
                $push: {

                    followings: { userId: req.params.userId }
                }
            });
            await User.updateOne({ userId: req.params.userId },
                {
                    $push: {
                        followers: {userId: req.user.userId}
                        
                    }
                });
            res.status(200).json("The User has been followed");
        } else {
            await User.updateOne({ userId: req.user.userId }, {
                $pull: {

                    followings: { userId: req.params.userId }
                }
            });
            await User.updateOne({ userId: req.params.userId },
                {
                    $pull: {
                        followers:{ userId : req.user.userId}     
                    }
                });
            res.status(200).json("The User has been unfollowed");
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};

const updateUser = async (req, res) => {
    if(req.params.userId != req.user.userId){
        res.status(400).json({
            message: " you can't update other's details"
        })
    }
    const bio = req.body.bio;

}

module.exports = {
    createUser,
    login,
    logout,
    updateUser,
    followUser,
    allUsers,
    getuser
}