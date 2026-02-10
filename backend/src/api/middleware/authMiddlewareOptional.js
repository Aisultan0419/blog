const TokenService = require('../../infrastructure/database/security/tokenService');
const tokenService = new TokenService(process.env.JWT_SECRET);

const authMiddlewareOptional = (req, res, next) => {
  let token = req.cookies && req.cookies.token;

  if (!token && req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(); 
  }

  const decoded = tokenService.verifyToken(token);
  if (decoded) {
    req.user = decoded;
  }

  return next();
};

module.exports = authMiddlewareOptional;
