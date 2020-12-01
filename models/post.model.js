const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const postSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  postId: {
    type: String,
    default: nanoid,
  },
  userId: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  tags: {
    type: [
      new mongoose.Schema({
        tagName: {
          type: String,
          required: true,
        },
        tagId: {
          type: String,
          required: true,
        },
        _id: false,
      }),
    ],
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  colorStyleMapString:{
    type: String,
    default:"{}"
  }
});

postSchema.pre("findOneAndUpdate", function (next) {
  this._update.updatedAt = new Date(Date.now());
  next();
});

module.exports = mongoose.model("post", postSchema);
