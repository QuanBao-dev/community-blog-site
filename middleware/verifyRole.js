const { verify } = require("jsonwebtoken");

module.exports.verifyRole = (...roles) => {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];
    if (token === "undefined") {
      token = null;
    };
    if (!token || process.env.NODE_ENV === "production")
      token = req.signedCookies.idBloggerUser;
    if (!token) return res.status(401).send({ error: "Access denied" });
    try {
      const userVm = verify(token, process.env.JWT_KEY);
      if (!roles.includes(userVm.role)) {
        return res.status(401).send({ error: "You do not have permission" });
      }
      req.user = userVm;
      next();
    } catch (error) {
      res.status(401).send({ error: "Invalid token" });
    }
  };
};
