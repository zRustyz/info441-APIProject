import express from "express";

const router = express.Router();

router.get("/myIdentity", (req, res) => {
  if (req.session.isAuthenticated) {
    res.json({
      status: "loggedin",
      userInfo: {
        name: req.session.account.name,
        username: req.session.account.username
      }
    });
  } else {
    res.json({ status: "loggedout" });
  }
});

export default router;