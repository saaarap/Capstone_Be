const validatePost = (req, res, next) => {
  const errors = [];
  const { title, description, image, author } = req.body;

  if (typeof title != "string") {
    errors.push("titolo deve essere una stirna");
  }
  if (typeof description != "string") {
    errors.push("descrizione deve essere una stirna");
  }
  if (typeof author != "string") {
    errors.push("author deve essere una stringa");
  }
  if (errors.length > 0) {
    res.status(400).send({ errors });
  } else {
    next();
  }
};

module.exports = validatePost;
