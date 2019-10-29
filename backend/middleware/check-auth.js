const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "secret_this_should_be_longer");
    res.locals.userId = decodedToken.userId;
    next();
  } catch (e) {
    res.status(401).json({message: "Access denied"});
  }
};
