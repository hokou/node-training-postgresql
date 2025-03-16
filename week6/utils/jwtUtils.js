const jwt = require('jsonwebtoken')
const config = require('../config/index')
const appError = require('./appError')

const generateJWT = (payload)=> {
  // 產生 JWT token
  return jwt.sign(
    payload,
    config.get('secret.jwtSecret'),
    {
      expiresIn: config.get('secret.jwtExpiresDay'),
    },
  );
}

module.exports = { 
  generateJWT,
};
