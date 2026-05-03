/**
 * @desc Logs incoming HTTP requests
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Callback to next middleware
 */
module.exports = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};