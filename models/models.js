import mongoose from "mongoose";
import "dotenv/config";

let models = {};

async function main() {
  console.log("connecting to mongodb");
  await mongoose.connect(`mongodb+srv://test-user:${process.env.MONGO_PW}@cluster0.nhmgs9q.mongodb.net/ytvideosharer`);

  console.log("successfully connected to mongodb!");

  const postSchema = new mongoose.Schema({
    video_id: String,
    description: String,
    created_date: Date,
    username: String,
    likes: [String],
    commentsCount: { type: Number, default: 0 }
  });

  const commentSchema = new mongoose.Schema({
    username: String,
    comment: String,
    post: mongoose.Schema.Types.ObjectId,
    created_date: Date
  });

  const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    bio: String,
    last_login: Date,
  });

  models.Post = mongoose.model("Post", postSchema);
  models.Comment = mongoose.model("Comment", commentSchema);
  models.User = mongoose.model("User", userSchema);

  console.log("mongoose models created");


  // await updateCommentsCount();
}

async function updateCommentsCount() {
  const posts = await models.Post.find();

  for (const post of posts) {
    const commentsCount = await models.Comment.countDocuments({ post: post._id });
    post.commentsCount = commentsCount;
    await post.save();
  }

  console.log('Updated comments count for all posts.');
}

main().catch(err => console.log(err));

export default models;
