const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).send({
      errorType: "Token non presente",
      statusCode: 401,
      message: "per poter utilizzare questo endpoint è necessario un token",
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    next();
  } catch (error) {
    res.status(403).send({
      errorType: "token error",
      statusCode: 403,
      message: "token scaduto o non valido",
    });
  }
};
