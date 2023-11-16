const express =require('express');
const userRoutes= express.Router();

const userApp = express();

const authMiddleware= require('../middlewares/authMiddleware');



const bodyParser = require('body-parser');
userApp.use(bodyParser.json());
userApp.use(bodyParser.urlencoded({extended:true}));

userApp.use(express.static('public'));

const multer = require ('multer');
const path = require('path');
const storage= multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, path.join(__dirname, '../public/userImg'), (error, success)=>{
            if(error){
                console.log(error);
            }
        });
    },
    filename:(req, file, cb)=>{
       const name= Date.now()+'-'+file.originalname;
        cb(null, name, (error, success)=>{
            if(error){
                console.log(error);
            }
        });
    }
});
const upload = multer({storage:storage});

const userController = require ('../controllers/userController')
userRoutes.route('/createuser').post(upload.single('urlToImg'), userController.createUser);
userRoutes.route('/login').post(userController.login);
userRoutes.route('/logout').post(authMiddleware.tokenCheck, userController.logout);
userRoutes.route('/getAllUsers').get(authMiddleware.tokenCheck, userController.allUsers);
userRoutes.route('/getuser/:userId').get(authMiddleware.tokenCheck, userController.getuser);
userRoutes.route('/updateuser/:userId').put(authMiddleware.tokenCheck, userController.updateUser);
userRoutes.route('/followuser/:userId').put(authMiddleware.tokenCheck, userController.followUser);


module.exports = userRoutes;

