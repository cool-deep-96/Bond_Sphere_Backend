const express =require('express');
const postRoutes= express.Router();
const postApp = express();
const { tokenCheck }= require('../middlewares/authMiddleware');

const bodyParser = require('body-parser');
postRoutes.use(bodyParser.json());
postRoutes.use(bodyParser.urlencoded({extended:true}));

postRoutes.use(express.static('public'));

const multer = require ('multer');
const path = require('path');
const storage= multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, path.join(__dirname, '../public/allPostsImg'), (error, success)=>{
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

const postController = require ('../controllers/postController');
postRoutes.route('/createpost').post(tokenCheck, upload.single('urlToImg'), postController.createPost);
postRoutes.route('/updatepost/:id').put(tokenCheck, postController.updatePost);
postRoutes.route('/deletepost/:id').delete(tokenCheck, postController.deletePost);
postRoutes.route('/likepost/:id').put(tokenCheck, postController.likePost);
postRoutes.route("/getAllPosts").get(tokenCheck, postController.getAllPosts);
postRoutes.route('/commentpost/:id').put(tokenCheck, postController.commentPost);
postRoutes.route('/deletecomment/:id').put(tokenCheck, postController.deleteComment);


module.exports = postRoutes;