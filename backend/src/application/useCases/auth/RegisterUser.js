const User = require('../../../domain/entities/User');

class RegisterUser {
    constructor(userRepository, passwordHasher) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }

    async execute(registerDTO) {
        const { username, email, password } = registerDTO;

        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await this.passwordHasher.hash(password);

        const user = new User({
            id: null,
            username,
            email,
            password: hashedPassword,
            role: User.roles.USER,
            createdAt: new Date()
        });

        return await this.userRepository.create(user);
    }
}

module.exports = RegisterUser;
