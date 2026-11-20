import 'dotenv/config';
import { sequelize } from '../src/database.js';
import '../src/models.js';

try {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log('Database schema is up to date.');
} finally {
  await sequelize.close();
}
