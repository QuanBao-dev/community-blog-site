const { verifyRole } = require("../middleware/verifyRole");
const Comment = require("../models/comment.model");
const User = require("../models/user.model");
const ignoreProperty = require("../validation/ignoreProperty");

const router = require("express").Router();
const options = {
  _id: 0,
  postId: 1,
  commentId: 1,
  username: 1,
  isAuthor: 1,
  createdAt: 1,
  quantityLikes: 1,
  content: 1,
  parentCommentId: 1,
  childLevel: 1,
  amountReply: 1,
};
const numberCommentPerPage = 6;
router.get("/post/:postId", async (req, res) => {
  const { postId } = req.params;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const parentCommentId = req.query.parentCommentId;
  try {
    if (!parentCommentId) {
      const [comments, { length }] = await Promise.all([
        Comment.aggregate([
          { $match: { postId, parentCommentId: "none" } },
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * numberCommentPerPage },
          { $limit: numberCommentPerPage },
          { $project: options },
        ]),
        Comment.find({ postId, parentCommentId: "none" })
          .lean()
          .select(options),
      ]);
      res.send({
        message: {
          comments,
          lastPage: Math.ceil(length / numberCommentPerPage),
        },
      });
    } else {
      const commentsReply = await Comment.aggregate([
        { $match: { postId, parentCommentId } },
        { $sort: { createdAt: -1 } },
        { $project: options },
      ]);
      res.send({
        message: {
          commentsReply,
        },
      });
    }
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.post("/", verifyRole("User", "Admin"), async (req, res) => {
  let { postId, content, parentCommentId, parentLevel, isAuthor } = req.body;
  isAuthor = isAuthor === "true";
  parentLevel = parseInt(parentLevel);
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(401).send({ error: "Unauthorized" });
    }
    const newComment = new Comment({
      postId,
      content,
      isAuthor,
      username: user.username,
    });
    let length = 0;
    if (parentCommentId) {
      const parentComment = await Comment.findOne({
        commentId: parentCommentId,
      });
      if (!parentComment) throw Error({ message: "Comment not found" });
      newComment.parentCommentId = parentCommentId;
      newComment.childLevel = parentLevel + 1;
      if (!parentComment.amountReply) parentComment.amountReply = 0;
      parentComment.amountReply += 1;
      let commentsReply;
      await newComment.save();
      [commentsReply] = await Promise.all([
        Comment.aggregate([
          { $match: { postId, parentCommentId } },
          { $sort: { createdAt: -1 } },
          { $project: options },
        ]),
        parentComment.save(),
      ]);
      res.send({
        message: {
          commentsReply,
        },
      });
    } else {
      [{ length }] = await Promise.all([
        Comment.find({ postId, parentCommentId: "none" })
          .lean()
          .select(options),
        newComment.save(),
      ]);
      res.send({
        message: {
          comment: ignoreProperty(newComment.toJSON(), ["_id", "__v"]),
          lastPage: Math.ceil(length / numberCommentPerPage),
        },
      });
    }
  } catch (error) {
    if (error && error.message)
      return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.put("/:commentId", verifyRole("User", "Admin"), async (req, res) => {
  const { commentId } = req.params;
  const { content, quantityLike } = req.body;
  try {
    const comment = await Comment.findOne({ commentId });
    if (!comment) throw Error({ message: "Bad Request" });
    comment.content = content;
    if (quantityLike) comment.quantityLikes = quantityLike;
    await comment.save();
    res.send({ message: ignoreProperty(comment.toJSON(), ["_id", "__v"]) });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.delete("/", verifyRole("User", "Admin"), async (req, res) => {
  const { commentId } = req.params;
  try {
    const comment = await Comment.findOne({ commentId });
    if (!comment) throw Error({ message: "Bad Request" });
    await comment.remove();
    res.send({ message: comment.commentId });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

module.exports = router;
