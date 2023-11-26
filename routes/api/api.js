import express from "express";

import postRouter from "./controllers/post.js";
import commentRouter from "./controllers/comment.js";
import videoRouter from "./controllers/video.js";
import userRouter from "./controllers/user.js";

const router = express.Router();

router.use("/post", postRouter);
router.use("/comment", commentRouter);
router.use("/video", videoRouter);
router.use("/user", userRouter);

export default router;