import express from "express";
import { extractVideoID, fetchVideoData, getVideoPreview } from "../utils/youtube.js";

const router = express.Router();

router.post("/", async (req, res) => {
  if (req.session.isAuthenticated) {
    try {
      const newPost = new req.models.Post({
        video_id: extractVideoID(req.body.url),
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
            videoData: await fetchVideoData(post.video_id),
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

router.post("/like", async (req, res) => {
  if (req.session.isAuthenticated) {
    try {
      let posts = await req.models.Post.find({ _id: req.body.postID });
      if (!posts[0].likes || !posts[0].likes.includes(req.session.account.username)) {
        await req.models.Post.updateOne({ _id: req.body.postID }, { $push: { likes: req.session.account.username }});
      }

      res.json({"status": "success"});
    } catch (error) {
      console.log(error);
      res.status(500).json({"status": "error", "error": error});
    }
  } else {
    res.status(401).json({
      status: "error",
      error: "not logged in"
   });
  }
});

router.post("/unlike", async (req, res) => {
  if (req.session.isAuthenticated) {
    try {
      let posts = await req.models.Post.find({ _id: req.body.postID });
      if (posts[0].likes.includes(req.session.account.username)) {
        console.log("test");
        await req.models.Post.findByIdAndUpdate(req.body.postID, { $pull: { likes: req.session.account.username }});
      }
      res.json({"status": "success"});
    } catch (error) {
      console.log(error);
      res.status(500).json({"status": "error", "error": error});
    }
  } else {
    res.status(401).json({
      status: "error",
      error: "not logged in"
   });
  }
});

export default router;