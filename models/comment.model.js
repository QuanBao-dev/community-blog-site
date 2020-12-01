const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const commentSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
  commentId: {
    type: String,
    default: nanoid,
  },
  username: {
    type: String,
    required: true,
  },
  isAuthor: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  quantityLikes: {
    type: Number,
    default: 0,
  },
  content: {
    type: String,
    required: true,
  },
  parentCommentId: {
    type: String,
    default: "none",
  },
  childLevel: {
    type: Number,
    default: 0,
  },
  amountReply: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("comment", commentSchema);
