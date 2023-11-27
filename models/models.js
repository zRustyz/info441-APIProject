import mongoose from "mongoose";
import "dotenv/config";

let models = {};

main().catch(err => console.log(err))
async function main(){
  console.log("connecting to mongodb");
  await mongoose.connect(`mongodb+srv://test-user:${process.env.MONGO_PW}@cluster0.nhmgs9q.mongodb.net/ytvideosharer`);

  console.log("succesffully connected to mongodb!");

  const postSchema = new mongoose.Schema({
    video_id: String,
    description: String,
    created_date: Date,
    username: String,
    likes: [String]
  });

  const commentSchema = new mongoose.Schema({
    username: String,
    comment: String,
    post: mongoose.Schema.Types.ObjectId,
    created_date: Date
  });

  models.Post = mongoose.model("Post", postSchema);
  models.Comment = mongoose.model("Comment", commentSchema);
  console.log("mongoose models created");
}

export default models;