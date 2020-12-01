const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const tagsSchema = new mongoose.Schema({
  tagName: { type: String, required: true },
  tagId: { type: String, default: nanoid },
  listPostId: { type:String, default:"[]"}
});

module.exports = mongoose.model("tag", tagsSchema);
