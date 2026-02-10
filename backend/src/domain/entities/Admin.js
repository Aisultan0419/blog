class Admin extends User {
    constructor(data) {
        super(data);
        this.role = User.roles.ADMIN;
    }

    static isAdmin(user) {
        return user.role === User.roles.ADMIN;
    }

    canManageUsers() {
        return true;
    }

    canManageAllContent() {
        return true;
    }

    canModerateComments() {
        return true;
    }
}

module.exports = Admin;
