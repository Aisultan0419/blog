class LoginUser {
    constructor(userRepository, passwordHasher, tokenService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }

    async execute(loginDTO) {
        const { email, password } = loginDTO;

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await this.passwordHasher.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = this.tokenService.generateToken({ id: user.id, role: user.role });

        return { user, token };
    }
}

module.exports = LoginUser;
