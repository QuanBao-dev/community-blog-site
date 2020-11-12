const User = require("../models/user.model");
const ignoreProperty = require("../validation/ignoreProperty");
const bcryptjs = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const { verifyRole } = require("../middleware/verifyRole");
const {
  validateRegister,
  validateLogin,
  validateEdit,
} = require("../validation/user");

const router = require("express").Router();
router.get("/", async (req, res) => {
  const user = await User.aggregate([{ $project: { username: 1 } }]);
  res.send({ message: user.length });
});
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findOne({ userId })
    .lean()
    .select({ _id: 0, username: 1 });
  res.send({ message: user });
});
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const result = validateRegister(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    return res.status(401).send({ error: "email existed" });
  }
  const salt = await bcryptjs.genSalt(10);
  const passwordCrypt = await bcryptjs.hash(password, salt);
  try {
    const newUser = new User({
      username,
      email,
      password: passwordCrypt,
    });
    const savedUser = await newUser.save();
    res.send({
      message: ignoreProperty(savedUser.toJSON(), ["_id", "__v", "password"]),
    });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  if (req.signedCookies.idBloggerUser) {
    return res.status(401).send({ error: "You already logged in" });
  }
  const { email, password } = req.body;
  const result = validateLogin(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).send({ error: "email doesn't exist" });
  }
  const verifiedPassword = await bcryptjs.compare(password, user.password);
  if (!verifiedPassword) {
    return res.status(400).send({ error: "Invalid Password" });
  }
  const userVm = ignoreProperty(user.toJSON(), [
    "_id",
    "__v",
    "password",
    "email",
    "username",
    "createdAt",
    "updatedAt",
  ]);
  try {
    let token = sign(userVm, process.env.JWT_KEY, {
      expiresIn: "12h",
    });
    let options = {
      expires: new Date(Date.now() + 43200000),
      signed: true,
      path: "/",
    };
    if (process.env.NODE_ENV === "production") {
      options = {
        ...options,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      };
    }
    res.cookie("idBloggerUser", token, options);
    res.send({ message: token });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

router.delete("/logout", verifyRole("User", "Admin"), (req, res) => {
  let options = {
    expires: new Date(Date.now() - 43200000),
    signed: true,
    path: "/",
  };
  if (process.env.NODE_ENV === "production") {
    options = {
      ...options,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    };
  }
  res.cookie("idBloggerUser", "", options);
  res.send({ message: "log out successfully" });
});

router.put("/account/edit", verifyRole("Admin", "User"), async (req, res) => {
  const userVm = req.user;
  let { newEmail, newPassword, currentPassword, newUsername } = req.body;
  if (newEmail === "") delete req.body.newEmail;
  if (newPassword === "") delete req.body.newPassword;
  if (newUsername === "") delete req.body.newUsername;
  const result = validateEdit(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }
  const user = await User.findOne({ userId: userVm.userId });
  const verifyPassword = await bcryptjs.compare(currentPassword, user.password);
  if (!verifyPassword) {
    return res.status(401).send({ error: "Invalid password" });
  }
  let data = {};
  if (newUsername) data.username = newUsername;
  if (newEmail) {
    const isEmailExist = await User.findOne({ email: newEmail })
      .lean()
      .select();
    if (isEmailExist) {
      return res.status(400).send({ error: "Email has been used" });
    }
    data.email = newEmail;
  }
  if (newPassword) {
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);
    data.password = hashPassword;
  }
  if (Object.keys(data).length === 0) {
    return res
      .status(400)
      .send({ error: "Make sure at least 1 info to change" });
  }
  try {
    const updatedUser = await User.findOneAndUpdate(
      {
        userId: userVm.userId,
      },
      data,
      {
        new: true,
      }
    ).lean();
    const updatedUserVm = ignoreProperty(updatedUser, [
      "_id",
      "__v",
      "password",
    ]);
    const token = sign(updatedUserVm, process.env.JWT_KEY, {
      expiresIn: "12h",
    });
    let options = {
      expires: new Date(Date.now() + 43200000),
      sameSite: "lax",
      path: "/",
    };
    if (process.env.NODE_ENV === "production") {
      options = {
        ...options,
        httpOnly: true,
        secure: true,
      };
    }
    res.cookie("idBloggerUser", token, options);
    res.send({ message: token });
  } catch (error) {
    if (error) return res.status(400).send({ error: error.message });
    res.status(404).send({ error: "Something went wrong" });
  }
});

module.exports = router;
