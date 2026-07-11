require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Table = require('../models/Table');

const DEFAULT_TABLES = [
  { tableNumber: 'T1', capacity: 2 },
  { tableNumber: 'T2', capacity: 4 },
  { tableNumber: 'T3', capacity: 6 },
  { tableNumber: 'T4', capacity: 8 },
];

async function seed() {
  await connectDB();
  await Table.deleteMany({});
  await Table.insertMany(DEFAULT_TABLES);
  console.log('Seeded tables:', DEFAULT_TABLES.map((t) => t.tableNumber).join(', '));
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
