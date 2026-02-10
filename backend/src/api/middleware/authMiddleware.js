
const TokenService = require('../../infrastructure/database/security/tokenService');
const tokenService = new TokenService(process.env.JWT_SECRET);

const authMiddleware = (req, res, next) => {
  let token = req.cookies && req.cookies.token;
  if (!token && req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = tokenService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = decoded;
  next();
};

module.exports = authMiddleware;
