const AuthService = require('../services/AuthService');
const asyncHandler = require('../utils/asyncHandler');
const Validator = require('../utils/Validator');

class AuthController {
  register = asyncHandler(async (req, res) => {
    Validator.assert(req.body, {
      name:     ['required', { maxLength: 80 }],
      email:    ['required', 'email'],
      password: ['required', { minLength: 6 }],
    });

    const { name, email, password } = req.body;
    const result = await AuthService.register(name, email, password);
    res.status(201).json({ success: true, ...result });
  });

  login = asyncHandler(async (req, res) => {
    Validator.assert(req.body, {
      email:    ['required', 'email'],
      password: ['required'],
    });

    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json({ success: true, ...result });
  });

  getMe = asyncHandler(async (req, res) => {
    const user = await AuthService.getMe(req.user.id);
    res.status(200).json({ success: true, user });
  });
}

module.exports = new AuthController();
