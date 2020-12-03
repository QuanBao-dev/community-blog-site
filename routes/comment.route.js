const { verifyRole } = require("../middleware/verifyRole");
const Comment = require("../models/comment.model");
const Post = require("../models/post.model");
const User = require("../models/user.model");
const ignoreProperty = require("../validation/ignoreProperty");

const router = require("express").Router();
const options = {
  _id: 0,
  postId: 1,
  commentId: 1,
  userId: 1,
  isAuthor: 1,
  createdAt: 1,
  quantityLikes: 1,
  content: 1,
  parentCommentId: 1,
  childLevel: 1,
  amountReply: 1,
  userIdLikes: 1,
  commentIdList: 1,
};
const numberCommentPerPage = 6;
router.get("/post/:postId", async (req, res) => {
  const { postId } = req.params;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const parentCommentId = req.query.parentCommentId;
  try {
    if (!parentCommentId) {
      let [comments, { length }] = await Promise.all([
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
      comments = await Promise.all(
        comments.map(async (comment) => {
          const user = await User.findOne({ userId: comment.userId })
            .lean()
            .select({ _id: 0, username: 1, userId: 1 });
          return {
            ...comment,
            username: user.username,
            userId: user.userId,
          };
        })
      );
      res.send({
        message: {
          comments,
          lastPage: Math.ceil(length / numberCommentPerPage),
        },
      });
    } else {
      let commentsReply = await Comment.aggregate([
        { $match: { postId, parentCommentId } },
        { $sort: { createdAt: -1 } },
        { $project: options },
      ]);
      commentsReply = await Promise.all(
        commentsReply.map(async (comment) => {
          const user = await User.findOne({ userId: comment.userId })
            .lean()
            .select({ _id: 0, username: 1, userId: 1 });
          return {
            ...comment,
            username: user.username,
            userId: user.userId,
          };
        })
      );
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
    const [user, post] = await Promise.all([
      User.findOne({ userId: req.user.userId }),
      Post.findOne({ postId: postId }),
    ]);
    if (!user || !post) {
      return res.status(401).send({ error: "Unauthorized" });
    }
    const newComment = new Comment({
      userId: req.user.userId,
      postId,
      content,
      isAuthor,
      username: user.username,
    });
    let length = 0;
    if (parentCommentId) {
      let commentIdList = [newComment.commentId];
      const parentComment = await Comment.findOne({
        commentId: parentCommentId,
      });
      commentIdList = [...parentComment.commentIdList, ...commentIdList];
      if (!parentComment) throw Error({ message: "Comment not found" });
      newComment.parentCommentId = parentCommentId;
      newComment.childLevel = parentLevel + 1;
      newComment.commentIdList = commentIdList;
      if (!parentComment.amountReply) parentComment.amountReply = 0;
      parentComment.amountReply += 1;
      let commentsReply;
      const [user] = await Promise.all([
        User.findOne({ userId: req.user.userId })
          .lean()
          .select({ _id: 0, username: 1, userId: 1 }),
        newComment.save(),
      ]);
      const object = { ...newComment.toJSON() };
      object.username = user.username;
      object.userId = user.userId;

      [commentsReply] = await Promise.all([
        Comment.aggregate([
          { $match: { postId, parentCommentId } },
          { $sort: { createdAt: -1 } },
          { $project: options },
        ]),
        parentComment.save(),
      ]);
      commentsReply = await Promise.all(
        commentsReply.map(async (comment) => {
          const user = await User.findOne({ userId: comment.userId })
            .lean()
            .select({ _id: 0, username: 1, userId: 1 });
          return {
            ...comment,
            username: user.username,
            userId: user.userId,
          };
        })
      );

      res.send({
        message: {
          commentsReply,
          comment: ignoreProperty(object, ["_id", "__v"]),
        },
      });
    } else {
      let commentIdList = [newComment.commentId];
      newComment.commentIdList = commentIdList;
      let user;
      [{ length }, user] = await Promise.all([
        Comment.find({ postId, parentCommentId: "none" })
          .lean()
          .select(options),
        User.findOne({ userId: req.user.userId })
          .lean()
          .select({ _id: 0, username: 1, userId: 1 }),
        newComment.save(),
      ]);
      const object = { ...newComment.toJSON() };
      object.username = user.username;
      object.userId = user.userId;
      res.send({
        message: {
          comment: ignoreProperty(object, ["_id", "__v"]),
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
  const { content, userId } = req.body;
  const user = await User.findOne({ userId });
  if (!user) {
    return res.status(401).send({ error: "Unauthorized" });
  }
  try {
    const comment = await Comment.findOne({ commentId });
    if (!comment) throw Error({ message: "Bad Request" });
    if (content) comment.content = content;
    if (userId) {
      if (!comment.userIdLikes) comment.userIdLikes = "[]";
      let userIdLikes = JSON.parse(comment.userIdLikes);
      if (!userIdLikes.includes(userId)) {
        userIdLikes.push(userId);
      } else {
        userIdLikes = userIdLikes.filter((userIdLike) => userIdLike !== userId);
      }
      comment.userIdLikes = JSON.stringify(userIdLikes);
      comment.quantityLikes = userIdLikes.length;
    }
    await comment.save();
    res.send({ message: ignoreProperty(comment.toJSON(), ["_id", "__v"]) });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.delete("/:commentId", verifyRole("User", "Admin"), async (req, res) => {
  const { commentId } = req.params;
  try {
    const comment = await Comment.findOneAndDelete({ commentId }).lean();
    if (!comment) throw Error({ message: "Bad Request" });
    const [dataDelete, dataUpdate] = await Promise.all([
      Comment.deleteMany({
        commentIdList: { $in: comment.commentIdList },
        childLevel: { $gt: comment.childLevel },
      }).lean(),
      Comment.updateMany(
        {
          commentId: { $in: comment.commentIdList },
          commentIdList: { $in: comment.commentIdList },
          childLevel: comment.childLevel - 1,
        },
        {
          $inc: { amountReply: -1 },
        }
      ).lean(),
    ]);
    console.log(dataDelete.n, dataUpdate.n);
    res.send({
      message: { commentId },
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

module.exports = router;
