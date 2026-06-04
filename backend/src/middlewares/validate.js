function validate(schemas) {
  return (req, res, next) => {
    for (const key of ['body', 'params', 'query']) {
      if (schemas[key]) {
        const result = schemas[key].safeParse(req[key]);
        if (!result.success) {
          return res.status(400).json({
            success: false,
            message: 'Datos inválidos',
            errors: result.error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          });
        }
        req[key] = result.data;
      }
    }
    next();
  };
}

module.exports = validate;
