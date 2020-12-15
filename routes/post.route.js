const { verifyRole } = require("../middleware/verifyRole");
const Post = require("../models/post.model");
const ignoreProperty = require("../validation/ignoreProperty");
const {
  validatePostDataUpdate,
  validatePostCreate,
} = require("../validation/post");
const Tag = require("../models/tag.model");
const User = require("../models/user.model");
const cloudinary = require("cloudinary");
const { nanoid } = require("nanoid");
const Comment = require("../models/comment.model");

const router = require("express").Router();
const optionsSelection = {
  _id: 0,
  excerpt: 1,
  body: 1,
  title: 1,
  tags: 1,
  updatedAt: 1,
  userId: 1,
  postId: 1,
  isCompleted: 1,
  colorStyleMapString: 1,
  upVotesUserIdList: 1,
  downVotesUserIdList: 1,
};
const quantityPosts = 5;

router.get("/", async (req, res) => {
  let { tags, page, authorId } = req.query;
  if (typeof tags === "string") {
    tags = [tags];
  }
  page = +page;
  const opts = ignoreProperty(optionsSelection, [
    "colorStyleMapString",
    "isCompleted",
  ]);
  try {
    let posts;
    if (tags && tags.length > 0)
      posts = await Post.aggregate([
        { $match: { isCompleted: true, "tags.tagName": { $in: tags } } },
        { $sort: { updatedAt: -1 } },
        { $skip: (page - 1) * quantityPosts },
        { $limit: quantityPosts },
        { $project: opts },
      ]);
    else if (authorId)
      posts = await Post.aggregate([
        { $match: { userId: authorId, isCompleted: true } },
        { $sort: { updatedAt: -1 } },
        { $skip: (page - 1) * quantityPosts },
        { $limit: quantityPosts },
        { $project: opts },
      ]);
    else
      posts = await Post.aggregate([
        { $match: { isCompleted: true } },
        { $sort: { updatedAt: -1 } },
        { $skip: (page - 1) * quantityPosts },
        { $limit: quantityPosts },
        { $project: opts },
      ]);
    posts = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findOne({ userId: post.userId }).lean().select({
          username: 1,
          userId: 1,
          _id: 0,
        });
        const imageUrl = extractListImage(post, true);
        const ans = {
          ...post,
          user,
          imageUrl: imageUrl,
        };
        delete ans.body;
        return ans;
      })
    );
    res.send({
      message: posts,
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get("/:title/search", async (req, res) => {
  const page = parseInt(req.query.page || "1");
  const title = req.params.title;
  try {
    let posts = await Post.aggregate([
      { $match: { title: new RegExp(title, "i"), isCompleted: true } },
      { $skip: (page - 1) * quantityPosts },
      { $limit: quantityPosts },
      { $project: optionsSelection },
    ]);
    posts = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findOne({ userId: post.userId }).lean().select({
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
    res.send({ message: posts });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});
router.get("/user/:userId", async (req, res) => {
  const page = req.query.page;
  const userId = req.params.userId;
  try {
    let posts = await Post.aggregate([
      { $match: { userId, isCompleted: true } },
      { $skip: (page - 1) * quantityPosts },
      { $limit: quantityPosts },
      { $project: optionsSelection },
    ]);
    posts = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findOne({ userId: post.userId }).lean().select({
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
    res.send({ message: posts });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});
router.get("/personal", verifyRole("Admin", "User"), async (req, res) => {
  let { isCompleted = "true", page = "1" } = req.query;
  page = +page;
  isCompleted = isCompleted === "true";
  const opts = ignoreProperty(optionsSelection, ["body"]);
  try {
    let posts = await Post.aggregate([
      { $match: { isCompleted, userId: req.user.userId } },
      { $sort: { updatedAt: -1 } },
      { $skip: (page - 1) * quantityPosts },
      { $limit: quantityPosts },
      { $project: opts },
    ]);
    posts = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findOne({ userId: post.userId }).lean().select({
          username: 1,
          userId: 1,
          _id: 0,
        });
        const ans = {
          ...post,
          user,
        };
        return ans;
      })
    );
    res.send({ message: posts });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.get("/:postId/votes", async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findOne({ postId }).lean().select({
    _id: 0,
    upVotesUserIdList: 1,
    downVotesUserIdList: 1,
  });
  if (!post) {
    return res.status(400).send({ error: "Post doesn't exist" });
  }
  res.send({
    message: {
      upVotesUserIdList: post.upVotesUserIdList || "[]",
      downVotesUserIdList: post.downVotesUserIdList || "[]",
    },
  });
});

router.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findOne({ postId }).lean().select(optionsSelection);
    if (!post) {
      return res.status(404).send({ error: "Post is not found" });
    }
    post.user = await User.findOne({ userId: post.userId })
      .lean()
      .select({ _id: 0, userId: 1, username: 1 });
    const listImage = extractListImage(post);
    post.listImageString = JSON.stringify(listImage);
    res.send({ message: post });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.post("/", verifyRole("User", "Admin"), async (req, res) => {
  try {
    let {
      postId,
      title,
      excerpt,
      body,
      tags,
      isCompleted,
      colorStyleMapString,
    } = req.body;
    isCompleted = isCompleted === "true";
    req.body.isCompleted = isCompleted;
    if (typeof tags === "string") {
      tags = JSON.parse(tags);
      if (typeof tags === "string") {
        tags = JSON.parse(tags);
      }
      req.body.tags = tags;
    }
    const result = validatePostCreate(req.body);
    if (result.error) {
      return res.status(401).send({ error: result.error.details[0].message });
    }
    let filterTagsDB = [];
    await Promise.all(
      tags.map(async (tag) => {
        const matchedTagDB = await Tag.findOne({ tagName: tag.tagName });
        if (!matchedTagDB) {
          const newTag = new Tag({
            tagName: tag.tagName,
          });
          if (isCompleted) {
            newTag.listPostId = JSON.stringify([postId]);
            await newTag.save();
          }
          filterTagsDB.push(ignoreProperty(newTag.toJSON(), ["_id"]));
        } else {
          let listPostId = JSON.parse(matchedTagDB.listPostId);
          if (isCompleted) {
            if (!listPostId.includes(postId)) listPostId.push(postId);
            matchedTagDB.listPostId = JSON.stringify(listPostId);
            await matchedTagDB.save();
          } else {
            listPostId = listPostId.filter((postIdDB) => postIdDB !== postId);
            if (listPostId.length === 0) {
              await matchedTagDB.remove();
            } else {
              matchedTagDB.listPostId = JSON.stringify(listPostId);
              await matchedTagDB.save();
            }
          }
          filterTagsDB.push(ignoreProperty(matchedTagDB.toJSON(), ["_id"]));
        }
      })
    );
    let post = await Post.findOneAndUpdate(
      { postId },
      {
        excerpt,
        title,
        tags: filterTagsDB,
        userId: req.user.userId,
        isCompleted,
        colorStyleMapString,
      },
      {
        upsert: true,
        new: true,
      }
    );
    let tempBody = {};
    const bodyObject = JSON.parse(body);
    const entityMap = bodyObject.entityMap;
    tempBody.blocks = bodyObject.blocks;
    if (entityMap) {
      await Promise.all(
        Object.keys(entityMap).map(async (key) => {
          if (
            entityMap[key].type === "PHOTO" &&
            entityMap[key].data &&
            entityMap[key].data.url.match(
              /data:image\/[a-zA-Z0-9:/;,+=@#$%^&*\\]+/
            )
          ) {
            const result = await cloudinary.v2.uploader.upload(
              entityMap[key].data.url,
              {
                folder: "web-blog/post-user/" + postId + "/" + nanoid(),
                invalidate: true,
                public_id: "image",
                overwrite: true,
              }
            );
            entityMap[key].data.url = result.secure_url;
          }
        })
      );
    }
    tempBody.entityMap = entityMap || {};
    post.body = JSON.stringify(tempBody);
    await post.save();
    body = JSON.parse(post.body);
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
    const user = await User.findOne({ userId: post.userId }).lean().select({
      username: 1,
      userId: 1,
      _id: 0,
    });
    const ans = {
      ...ignoreProperty(post.toJSON(), ["_id", "__v"]),
      user,
      listImageString: JSON.stringify(listImage || []),
    };
    res.send({ message: ans });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.put("/image/:postId", verifyRole("User", "Admin"), async (req, res) => {
  const { body } = req.body;
  const { postId } = req.params;
  const post = await Post.findOne({ postId });
  if (!post) {
    return res.status(400).send({ error: "Post doesn't exist" });
  }
  if (post.userId !== req.user.userId) {
    return res.status(401).send({ error: "You do not have permission" });
  }
  try {
    await Promise.all([
      filterValidImage(body, postId),
      filterColorStyleMap(body, post),
    ]);
    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
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

async function filterColorStyleMap(body, post) {
  const colorStyleMapString = post.colorStyleMapString;
  const parsedBody = JSON.parse(body);
  if (colorStyleMapString) {
    const colorStyleMap = JSON.parse(colorStyleMapString);
    const listInlineStyleRanges = parsedBody.blocks
      .filter(({ inlineStyleRanges }) => inlineStyleRanges.length > 0)
      .map(({ inlineStyleRanges }) => {
        return inlineStyleRanges.map(({ style }) => style);
      });

    const keyColorStyleMap = Object.keys(colorStyleMap).filter((key) =>
      checkListInlineStyleRanges(listInlineStyleRanges, key)
    );
    const colorStyleMapAfter = keyColorStyleMap.reduce((ans, key) => {
      ans[key] = colorStyleMap[key];
      return ans;
    }, {});
    post.colorStyleMapString = JSON.stringify(colorStyleMapAfter);
    await post.save();
  }
}

function checkListInlineStyleRanges(array, colorCheck) {
  let check = false;
  for (let i = 0; i < array.length; i++) {
    if (array[i].includes(colorCheck)) {
      check = true;
      break;
    }
  }
  return check;
}

router.put("/:postId/votes", verifyRole("User", "Admin"), async (req, res) => {
  const { postId } = req.params;
  let { isUpVote } = req.body;
  isUpVote = isUpVote === "true";
  let post = await Post.findOne({ postId });
  if (!post) {
    return res.status(400).send({ error: "Post doesn't exist" });
  }
  if (isUpVote !== undefined && isUpVote !== null) {
    if (!post.upVotesUserIdList) post.upVotesUserIdList = "[]";
    if (!post.downVotesUserIdList) post.downVotesUserIdList = "[]";
    let upVotesUserIdList = JSON.parse(post.upVotesUserIdList);
    let downVotesUserIdList = JSON.parse(post.downVotesUserIdList);
    if (isUpVote === true) {
      if (!upVotesUserIdList.includes(req.user.userId))
        upVotesUserIdList.push(req.user.userId);
      else
        upVotesUserIdList = upVotesUserIdList.filter(
          (userId) => userId !== req.user.userId
        );
      if (downVotesUserIdList.includes(req.user.userId))
        downVotesUserIdList = downVotesUserIdList.filter(
          (userId) => userId !== req.user.userId
        );
    } else {
      if (upVotesUserIdList.includes(req.user.userId))
        upVotesUserIdList = upVotesUserIdList.filter(
          (userId) => userId !== req.user.userId
        );
      if (!downVotesUserIdList.includes(req.user.userId))
        downVotesUserIdList.push(req.user.userId);
      else
        downVotesUserIdList = downVotesUserIdList.filter(
          (userId) => userId !== req.user.userId
        );
    }
    post.upVotesUserIdList = JSON.stringify(upVotesUserIdList);
    post.downVotesUserIdList = JSON.stringify(downVotesUserIdList);
  }
  try {
    await post.save();
    res.send({
      message: {
        upVotesUserIdList: post.upVotesUserIdList || "[]",
        downVotesUserIdList: post.downVotesUserIdList || "[]",
      },
    });
  } catch (error) {
    if (error) {
      return res.status(400).send({ error: error.message });
    }
    res.status(404).send({ error: "Something went wrong" });
  }
});

//TODO change tags excerpt title
router.put("/:postId", verifyRole("User", "Admin"), async (req, res) => {
  const { postId } = req.params;
  if (req.body.excerpt.trim() === "") delete req.body.excerpt;
  if (req.body.title.trim() === "") delete req.body.title;
  if (req.body.tags.trim() === '[""]') delete req.body.tags;
  const isCompleted = req.body.isCompleted === "true";
  delete req.body.isCompleted;
  const modifiedObject = req.body;
  if (modifiedObject.tags) {
    modifiedObject.tags = JSON.parse(modifiedObject.tags).map((tag) =>
      tag.toLocaleLowerCase()
    );
  }
  const result = validatePostDataUpdate(modifiedObject);
  if (result.error) {
    return res.status(401).send({ error: result.error.details[0].message });
  }
  let post = await Post.findOne({ postId });
  if (!post) {
    return res.status(400).send({ error: "Post doesn't exist" });
  }
  if (post.userId !== req.user.userId) {
    return res.status(401).send({ error: "You do not have permission" });
  }
  const updatedPostTagDB = [];
  try {
    if (modifiedObject.tags && modifiedObject.tags.length > 0) {
      await Promise.all(
        post.tags.map(async ({ tagName }) => {
          const tagDB = await Tag.findOne({ tagName: tagName });
          if (tagDB) {
            let listPostId = JSON.parse(tagDB.listPostId);
            listPostId = listPostId.filter((postIdDB) => postIdDB !== postId);
            tagDB.listPostId = JSON.stringify(listPostId);
            if (listPostId.length === 0) {
              await tagDB.remove();
            } else {
              if (isCompleted) await tagDB.save();
            }
          }
        })
      );
      await Promise.all(
        modifiedObject.tags.map(async (tag) => {
          const tagDB = await Tag.findOne({ tagName: tag });
          if (tagDB) {
            const listPostId = JSON.parse(tagDB.listPostId);
            if (!listPostId.includes(postId)) listPostId.push(postId);
            tagDB.listPostId = JSON.stringify(listPostId);
            updatedPostTagDB.push(
              ignoreProperty(tagDB.toJSON(), ["_id", "listPostId"])
            );
            if (isCompleted) await tagDB.save();
          } else {
            const newTag = new Tag({ tagName: tag });
            newTag.listPostId = JSON.stringify([postId]);
            updatedPostTagDB.push(
              ignoreProperty(newTag.toJSON(), ["_id", "listPostId"])
            );
            if (isCompleted) await newTag.save();
          }
        })
      );
    }
    if (modifiedObject.title) post.title = modifiedObject.title;
    if (modifiedObject.excerpt) post.excerpt = modifiedObject.excerpt;
    if (modifiedObject.tags && modifiedObject.tags.length > 0)
      post.tags = updatedPostTagDB;
    const [user] = await Promise.all([
      User.findOne({ userId: post.userId }).lean().select({
        username: 1,
        userId: 1,
        _id: 0,
      }),
      post.save(),
    ]);
    const ans = {
      ...post.toJSON(),
      user,
    };
    res.send({
      message: ignoreProperty(ans, [
        "_id",
        "__v",
        "body",
        "colorStyleMapString",
        "listImageString",
      ]),
    });
  } catch (error) {
    if (error) {
      return res.status(400).send({ error: error.message });
    }
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.delete("/:postId", verifyRole("User", "Admin"), async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findOne({ postId });
  if (!post) {
    return res.status(400).send({ error: "Post doesn't exist" });
  }
  if (post.userId !== req.user.userId) {
    return res.status(400).send({ error: "You do not have permission" });
  }
  Comment.deleteMany({ postId })
    .then((v) => {
      console.log(v.n);
    })
    .catch(() => {
      console.log("Something went wrong");
    });
  const body = post.body;
  const listTag = post.tags;
  try {
    const urlCloudinaryList = body.match(
      /https:\/\/res.cloudinary.com\/storagecloud\/image\/upload\/[a-zA-Z0-9:/;,+=@#$%^&*\\\-_]+.png/g
    );
    try {
      if (urlCloudinaryList) {
        await cloudinary.v2.api.delete_resources_by_prefix(
          "web-blog/post-user/" + postId
        );
        await cloudinary.v2.api.delete_folder("web-blog/post-user/" + postId);
      }
    } catch (error) {}
    await Promise.all([
      Promise.all(
        listTag.map(async (tag) => {
          let matchedTagDB = await Tag.findOne({
            tagName: tag.toJSON().tagName,
          });
          if (matchedTagDB) {
            const listPostId = JSON.parse(matchedTagDB.listPostId);
            matchedTagDB.listPostId = JSON.stringify(
              listPostId.filter((postIdDB) => postIdDB !== postId)
            );
            if (JSON.parse(matchedTagDB.listPostId).length === 0) {
              await matchedTagDB.remove();
            } else await matchedTagDB.save();
          }
        })
      ),
      post.remove(),
    ]);
    res.send({ message: "success" });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

module.exports = router;

async function filterValidImage(body, postId) {
  const allMyImageUrl =
    body.match(
      /https:\/\/res.cloudinary.com\/storagecloud\/image\/upload\/v[0-9]+\/web-blog\/post-user\/[a-zA-Z0-9:/;,+=@#$%^&*\\\-_]+.(jpg|png|gif)/g
    ) || [];
  try {
    let { resources } = await cloudinary.v2.api.resources({
      type: "upload",
      prefix: "web-blog/post-user/" + postId,
    });
    resources = resources.map((resource) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
    }));
    let length = resources.length;
    await Promise.all(
      resources.map(async ({ public_id, secure_url }) => {
        if (!allMyImageUrl.includes(secure_url)) {
          try {
            await cloudinary.v2.api.delete_resources_by_prefix(
              public_id.replace("/image", "")
            );
            await cloudinary.v2.api.delete_folder(
              public_id.replace("/image", "")
            );
            length -= 1;
            if (length === 0)
              await cloudinary.v2.api.delete_folder(
                "web-blog/post-user/" + postId
              );
          } catch (error) {
            console.log(error);
          }
        }
      })
    );
  } catch (error) {
    console.log(error);
  }
}
