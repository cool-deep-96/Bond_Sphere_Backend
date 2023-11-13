const Post = require('../models/postModel');
const User = require('../models/userModel');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const upload = async (fileURLToPath) => {
  console.log("1");
  const response = await cloudinary.uploader.upload(fileURLToPath, {folder: "BOND_SPHERE/POSTS"}, (error, result) => {
      if(error){
          console.log("error", error);
          throw new Error (error);
      }
      console.log("result ", result);
      return result;
  })
  return response;
}

const createPost = async (req, res) => {
  try {
    
    const file = req.file;
    if(!file){
        return res.status(400).json({
            success: "false",
            message: "Post is required"
        })
    }

    const fileURLToPath = `public/allPostsImg/${req.file.filename}`;
        const result = await upload(fileURLToPath);
        console.log("fgfg",result);
        fs.unlink(fileURLToPath, (error) =>{
            if(error){
                throw new Error({
                    message: "internal server error"
                })
            }
    });
    const newPost = new Post({
      userId: req.user.userId,
      urlToImg: result.url,
      caption: req.body.caption
    });

    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(403).json("post not found");
    }
    if (post.userId === req.user.userId) {

      await post.updateOne({
        caption: req.body.caption
      });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).select('-createdAt -updatedAt -__v');
    
    // const postsAndProfile = await posts.map(async (post) => {
    //   const profileUrl = await User.find({userId: posts.userId}).select('urlToImg');
    //   console.log(profileUrl.urlToImg);
    //     post['profileUrl'] = profileUrl.urlToImg;
    //     console.log(post);
    // })
    // console.log(postsAndProfile)

    res.status(200).json(
      posts
      );

  } catch (err) {
    console.log(err);
    res.status(500).json("error")
  }
}

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.user.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(300).json("Post not found");
    }

    const liked = await Post.findOne({ $and: [{ _id: post._id }, { "likes.userId": req.user.userId }] })

    if (!liked) {
      await Post.updateOne({ _id: post._id },
        {
          $push: {
            likes: { userId: req.user.userId }
          }
        });
      res.status(200).json("The post has been liked");
    } else {
      await Post.updateOne({ _id: post._id },
        {
          $pull: {
            likes: { userId: req.user.userId }
          }
        });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

const commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(300).json("Post not found");
    }

    await Post.updateOne({ _id: req.params.id }, {
      $push: {
        comments: {
          commentedBY: req.user.userId,
          comment: req.body.comment
        }
      }

    });
    res.status(200).json("comment added successfully");

  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

const deleteComment = async (req, res) => {
  try {
    console.log(req.params.id)
    console.log(req.body.cid);
    console.log(req.user.userId)
    const post = await Post.findOne({ $and: [{ _id: req.params.id }] });
    if (post) {
      const comment =await Post.findOne({ $and: [{ _id: req.params.id }, { "comments._id": req.body.cid }] });
      if(comment){
        const commenter = await Post.findOne({ $and: [{ _id: req.params.id }, { "comments._id": req.body.cid }, { "comments.commentedBY": req.user.userId }] });
        if(commenter){
        await Post.updateOne({ "comments._id": req.body.cid },
        {
          $pull: {
            comments: { _id: req.body.cid }
          }
        })
        return res.status(200).json('Comment deleted');
      }else{
        return res.status(200).json("can't be deleted commented by other's");
      }

      
      }
    else{
      return res.status(300).json("comment not found");
    }
      

    }
    else {
      return res.status(300).json("Post not found ");
    }
  }
  catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}


module.exports = {
  createPost,
  updatePost,
  deletePost,
  likePost,
  commentPost,
  deleteComment,
  getAllPosts
}

