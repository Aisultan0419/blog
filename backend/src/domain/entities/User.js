class User {
    constructor({ id, username, email, password, role, createdAt, isActive = true }) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role || User.roles.USER;
        this.createdAt = createdAt || new Date();
        this.isActive = isActive;
    }

    static roles = {
        USER: 'user',
        ADMIN: 'admin',
        MODERATOR: 'moderator'
    };

    isAdmin() {
        return this.role === User.roles.ADMIN;
    }

    isModerator() {
        return this.role === User.roles.MODERATOR;
    }

    canEditContent(contentAuthorId) {
        return this.id === contentAuthorId || this.isAdmin() || this.isModerator();
    }

    canDeleteContent(contentAuthorId) {
        return this.id === contentAuthorId || this.isAdmin();
    }
}

module.exports = User;
