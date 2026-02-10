const RegisterDTO = require('../../application/dto/RegisterDTO');
const LoginDTO = require('../../application/dto/LoginDTO');
const RegisterUser = require('../../application/useCases/auth/RegisterUser');
const LoginUser = require('../../application/useCases/auth/LoginUser');
const LogoutUser = require('../../application/useCases/auth/LogoutUser');
const GetCurrentUser = require('../../application/useCases/auth/GetCurrentUser');

const UserRepository = require('../../infrastructure/database/mongodb/repositories/UserRepository');
const PasswordHasher = require('../../infrastructure/database/security/passwordHasher');
const TokenService = require('../../infrastructure/database/security/tokenService');

const userRepository = new UserRepository();
const passwordHasher = new PasswordHasher();
const tokenService = new TokenService(process.env.JWT_SECRET);

const register = async (req, res, next) => {
  try {
    const registerDTO = new RegisterDTO(req.body);
    const registerUser = new RegisterUser(userRepository, passwordHasher);
    const user = await registerUser.execute(registerDTO);

    delete user.password;

    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const loginDTO = new LoginDTO(req.body);
    const loginUser = new LoginUser(userRepository, passwordHasher, tokenService);
    const { user, token } = await loginUser.execute(loginDTO);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 
    });

    delete user.password;

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const logoutUser = new LogoutUser();
    await logoutUser.execute();

    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const getCurrentUser = new GetCurrentUser(userRepository);
    const user = await getCurrentUser.execute(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    delete user.password;

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  me
};
