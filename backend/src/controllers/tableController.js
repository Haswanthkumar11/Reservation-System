const asyncHandler = require('../utils/asyncHandler');
const tableService = require('../services/tableService');

const tableController = {
  list: asyncHandler(async (req, res) => {
    const tables = await tableService.listTables();
    res.status(200).json({ success: true, data: tables });
  }),

  create: asyncHandler(async (req, res) => {
    const table = await tableService.createTable(req.body);
    res.status(201).json({ success: true, data: table });
  }),

  update: asyncHandler(async (req, res) => {
    const table = await tableService.updateTable(req.params.id, req.body);
    res.status(200).json({ success: true, data: table });
  }),

  remove: asyncHandler(async (req, res) => {
    await tableService.deleteTable(req.params.id);
    res.status(200).json({ success: true, data: null });
  }),
};

module.exports = tableController;
