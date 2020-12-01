const { verifyRole } = require("../middleware/verifyRole");
const User = require("../models/user.model");

const router = require("express").Router();
router.get("/", verifyRole("Admin", "User"), async (req, res) => {
  const user = await User.findOne({ userId: req.user.userId })
    .lean()
    .select({ _id: 0, email: 1, username: 1, role: 1, listPost:1, userId:1 });
  if (!user) {
    return res.status(400).send({ error: "User does not exist" });
  }
  res.send({ message: user });
});

module.exports = router;
