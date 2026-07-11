const tableRepository = require('../repositories/tableRepository');
const ApiError = require('../utils/ApiError');

const tableService = {
  listTables: () => tableRepository.findAll(),

  async createTable({ tableNumber, capacity }) {
    if (!tableNumber || !capacity || capacity <= 0) {
      throw new ApiError(422, 'tableNumber and a positive capacity are required');
    }
    return tableRepository.create({ tableNumber, capacity });
  },

  async updateTable(id, data) {
    const table = await tableRepository.updateById(id, data);
    if (!table) throw new ApiError(404, 'Table not found');
    return table;
  },

  async deleteTable(id) {
    const table = await tableRepository.deleteById(id);
    if (!table) throw new ApiError(404, 'Table not found');
    return table;
  },
};

module.exports = tableService;
