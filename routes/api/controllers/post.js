import express from "express";
import { getVideoPreview } from "../utils/youtube.js";

const router = express.Router();

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