require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const sslRedirect = require("heroku-ssl-redirect").default;
const app = express();
const port = 5000;
cloudinary.config({
  cloud_name: "storagecloud",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("connect to db");
    }
  }
);
app.use(sslRedirect());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.static(path.join(__dirname, "build")));
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production")
    res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});
const commentsRoute = require("./routes/comment.route");
const indexRoute = require("./routes/index.route");
const tokenRoute = require("./routes/token.route");
const usersRoute = require("./routes/users.route");
const postsRoute = require("./routes/post.route");
const tagsRoute = require("./routes/tag.route");
app.use("/api/tags", tagsRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);
app.use("/api", tokenRoute);
app.use("/", indexRoute);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
