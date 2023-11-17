const mongoose = require("mongoose");

const PostsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    cover: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
    },
    comments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "commentModel",
    },
  },
  { timestamps: true, strict: true }
);

module.exports = mongoose.model("postModel", PostsSchema, "posts");
