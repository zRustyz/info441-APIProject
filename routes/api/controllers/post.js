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
    let sortOption = {};
    switch (req.query.sort) {
        case 'likes':
            sortOption = { 'likes.length': -1 };
            break;
        case 'comments':
            sortOption = { 'commentsCount': -1 };
            break;
        case 'date_asc':
            sortOption = { created_date: 1 };
            break;
        case 'date_desc':
        default:
            sortOption = { created_date: -1 };
            break;
    }

    let posts = await req.models.Post.find().sort(sortOption);
    let postData = await Promise.all(
      posts.map(async post => {
        try {
          return {
            username: post.username,
            description: post.description,
            videoData: await fetchVideoData(post.video_id),
            created_date: post.created_date,
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

router.delete("/:postId", async (req, res) => {
  if (req.session.isAuthenticated) {
    try {
      await req.models.Post.findByIdAndDelete(req.params.postId);
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