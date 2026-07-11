const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  }),

  profile: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: user });
  }),
};

module.exports = authController;
