import express from "express";

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
            htmlPreview: await getURLPreview(post.url),
            id: post._id,
            likes: post.likes
          };
        } catch (error) {
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