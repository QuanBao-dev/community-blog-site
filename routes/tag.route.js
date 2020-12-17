const Post = require("../models/post.model");
const Tag = require("../models/tag.model");
const User = require("../models/user.model");

const router = require("express").Router();
const optionsSelectionTag = {
  _id: 0,
  tagName: 1,
  tagId: 1,
  listPostId: 1,
};
const quantitiesPosts = 5;

router.get("/", async (req, res) => {
  let { page } = req.query;
  page = parseInt(page);
  try {
    const tags = await Tag.aggregate([{ $project: optionsSelectionTag }]);
    await Promise.all(
      tags.map((data) => {
        data.quantity = JSON.parse(data.listPostId).length;
        delete data.listPostId;
        return data;
      })
    );
    res.send({
      message: {
        tags: tags
          .sort((a, b) => -a.quantity + b.quantity)
          .slice((page - 1) * 20, page * 20),
        maxPage: Math.ceil(tags.length / 20),
      },
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get("/:tagId/posts", async (req, res) => {
  const { tagId } = req.params;
  let { page } = req.query;
  page = parseInt(page);
  const optionsSelection = {
    _id: 0,
    excerpt: 1,
    title: 1,
    tags: 1,
    updatedAt: 1,
    userId: 1,
    body: 1,
    postId: 1,
    isCompleted: 1,
  };
  try {
    const tag = await Tag.findOne({ tagId })
      .lean()
      .select({ _id: 0, listPostId: 1 });
    const listPostId = JSON.parse(tag.listPostId);
    const listPost = await Promise.all(
      listPostId
        .slice((page - 1) * quantitiesPosts, page * quantitiesPosts)
        .map(async (postId) => {
          const post = await Post.findOne({ postId })
            .lean()
            .select(optionsSelection);
          const user = await User.findOne({ userId: post.userId })
            .lean()
            .select({
              username: 1,
              userId: 1,
              _id: 0,
            });
          const imageUrl = extractListImage(post, true);
          post.imageUrl = imageUrl;
          post.user = user;
          delete post.body;
          return post;
        })
    );
    res.send({
      message: listPost.sort(
        (postPrev, postNext) =>
          -new Date(postPrev.updatedAt).getTime() +
          new Date(postNext.updatedAt).getTime()
      ),
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get("/search/:tagName", async (req, res) => {
  const tagName = req.params.tagName;
  try {
    const tags = await Tag.aggregate([
      { $match: { tagName: new RegExp(tagName, "i") } },
      { $project: { _id: 0, tagName: 1 } },
    ]);
    res.send({
      message: tags,
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get("/:tagId", async (req, res) => {
  const tagId = req.params.tagId;
  try {
    const tag = await Tag.findOne({ tagId }).lean().select(optionsSelectionTag);
    const listPostId = JSON.parse(tag.listPostId);
    tag.quantity = listPostId.length;
    delete tag.listPostId;
    res.send({ message: tag });
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
});
function extractListImage(post, isFirst) {
  const body = JSON.parse(post.body);
  if (!isFirst) {
    const listImage = Object.keys(body.entityMap)
      .filter(
        (key) =>
          body.entityMap[key].type === "PHOTO" &&
          body.entityMap[key].data &&
          body.entityMap[key].data.url.match(
            /https:\/\/res.cloudinary.com\/storagecloud\/image\/upload\/v[0-9]+\/web-blog\/post-user\/[a-zA-Z0-9:/;,+=@#$%^&*\\\-_]+.(jpg|png|gif)/
          )
      )
      .map((key) => body.entityMap[key].data.url);
    return listImage;
  } else {
    const keyFirst = Object.keys(body.entityMap).find(
      (key) =>
        body.entityMap[key].type === "PHOTO" &&
        body.entityMap[key].data &&
        body.entityMap[key].data.url.match(
          /https:\/\/res.cloudinary.com\/storagecloud\/image\/upload\/v[0-9]+\/web-blog\/post-user\/[a-zA-Z0-9:/;,+=@#$%^&*\\\-_]+.(jpg|png|gif)/
        )
    );
    if (!keyFirst) return undefined;
    return body.entityMap[keyFirst].data.url;
  }
}
module.exports = router;
