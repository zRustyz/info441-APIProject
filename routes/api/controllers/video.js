import express from "express";
import { getVideoPreview } from "../utils/youtube.js";

const router = express.Router();

router.get("/preview", async (req, res) => {
  try {
    const urlPreview = await getVideoPreview(req.query.url);
    res.send(urlPreview);
  } catch (err) {
    console.log(err);
  }
});



export default router;