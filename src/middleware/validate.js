const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message }); // return only first error, avoid leaking full schema shape
  }
  req.body = result.data; // replace body with parsed, sanitized version
  next();
};

module.exports = validate;