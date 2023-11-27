import express from "express";
import { getVideoPreview } from "../utils/youtube.js";

const router = express.Router();

router.post("/", async (req, res) => {
  if (req.session.isAuthenticated) {
    try {
      const newPost = new req.models.Post({
        video_id: req.body.url,
        description: req.body.description,
        category: req.body.category,
        created_date: Date.now(),
        username: req.session.account.username,
      });

      await newPost.save();

      res.json({"status": "success"});
    } catch (error) {
      res.status(500).json({"status": "error", "error": error});
    }
  } else {
    res.status(401).json({
      status: "error",
      error: "not logged in"
   });
  }
});

router.get("/", async (req, res) => {
  try {
    let posts;
    if (req.query.username) {
      posts = await req.models.Post.find({ username: req.query.username });
    } else {
      posts = await req.models.Post.find();
    }
    let postData = await Promise.all(
      posts.map(async post => {
        try {
          return {
            username: post.username,
            description: post.description,
            htmlPreview: await getVideoPreview(post.video_id),
            id: post._id,
            likes: post.likes
          };
        } catch (error) {
          console.log(error);
          return error;
        }
      })
    );
    res.json(postData);
  } catch (error) {
    res.status(500).json({"status": "error", "error": error});
  }
});

export default router;