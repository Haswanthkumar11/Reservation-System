const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

const authService = {
  async register({ name, email, password, role }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    // Only allow explicit 'admin' role creation if you want to seed admins manually;
    // by default all public registrations become customers.
    const safeRole = role === 'admin' ? 'admin' : 'customer';

    const user = await userRepository.create({ name, email, password, role: safeRole });
    const token = generateToken(user);

    return {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user);

    return {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
  },

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return { id: user._id, name: user.name, email: user.email, role: user.role };
  },
};

module.exports = authService;
