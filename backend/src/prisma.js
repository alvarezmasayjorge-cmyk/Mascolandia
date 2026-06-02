require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const Database = require('better-sqlite3');

const connectionString = process.env.DATABASE_URL;
let prisma;

if (connectionString && connectionString.startsWith('postgres')) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  // file:./dev.db -> ./dev.db
  const adapter = new PrismaBetterSqlite3({ url: connectionString || 'file:./dev.db' });
  prisma = new PrismaClient({ adapter });
}

module.exports = prisma;
