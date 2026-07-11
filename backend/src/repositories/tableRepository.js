const Table = require('../models/Table');

const tableRepository = {
  create: (data) => Table.create(data),
  findAll: (filter = {}) => Table.find(filter).sort({ capacity: 1 }),
  // Tables with capacity >= guestCount, sorted smallest-first (smallest suitable table wins)
  findSuitableTables: (guestCount) =>
    Table.find({ isActive: true, capacity: { $gte: guestCount } }).sort({ capacity: 1 }),
  findById: (id) => Table.findById(id),
  updateById: (id, data) => Table.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  deleteById: (id) => Table.findByIdAndDelete(id),
};

module.exports = tableRepository;
