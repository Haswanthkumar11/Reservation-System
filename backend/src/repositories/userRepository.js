const User = require('../models/User');

const userRepository = {
  create: (data) => User.create(data),
  findByEmail: (email, withPassword = false) => {
    const query = User.findOne({ email: email.toLowerCase() });
    return withPassword ? query.select('+password') : query;
  },
  findById: (id) => User.findById(id),
  findAdmins: () => User.find({ role: 'admin' }),
};

module.exports = userRepository;
