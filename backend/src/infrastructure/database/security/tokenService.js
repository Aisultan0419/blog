const jwt = require('jsonwebtoken');

class TokenService {
    constructor(secret) {
        this.secret = secret;
    }

    generateToken(payload) {
        return jwt.sign(payload, this.secret, { expiresIn: '24h' });
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.secret);
        } catch (error) {
            return null;
        }
    }
}

module.exports = TokenService;
