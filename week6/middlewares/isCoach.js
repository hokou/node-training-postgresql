const appError = require('../utils/appError')

module.exports = (req, res, next) => {
  // 401, '使用者尚未成為教練'
  if (!req.user || req.user.role !== 'coach') {
    next(appError(401, '使用者尚未成為教練'))
    return
  }
  next()
}