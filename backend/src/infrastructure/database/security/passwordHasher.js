const bcrypt = require('bcryptjs');

class PasswordHasher {
    async hash(password) {
        return await bcrypt.hash(password, 10);
    }

    async compare(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = PasswordHasher;
