const router = require("express").Router();
const path = require("path");
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

router.get("/account/edit", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

router.get("/posts/search/:title", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

router.get("/posts/user/:userId", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

router.get("/auth/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

router.get("/auth/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

router.get("/tags/:tagId", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

router.get("/tags", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

router.get("/blog/:postId/:isPending", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

router.get("/blog/:postId", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

router.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

module.exports = router;
