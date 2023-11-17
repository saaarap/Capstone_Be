const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    comments: {
      type: String,
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "postModel",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: true,
    },
  },
  { timestamps: true, strict: true }
);

module.exports = mongoose.model("commentModel", CommentSchema, "comments");
