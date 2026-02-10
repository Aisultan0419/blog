class AdminUpdateDTO {
    constructor({ role, isActive, permissions }) {
        this.role = role;
        this.isActive = isActive;
        this.permissions = permissions;
    }
}

module.exports = AdminUpdateDTO;
