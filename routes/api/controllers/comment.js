import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const comments = await req.models.Comment.find({ post: req.query.postID });
    res.json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({"status": "error", "error": error});
  }
});

router.post("/", async (req, res) => {
  if (req.session.isAuthenticated) {
    try {
      const newComment = new req.models.Comment({
        comment: req.body.newComment,
        post: req.body.postID,
        created_date: Date.now(),
        username: req.session.account.username,
      });
      await newComment.save();
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

export default router;