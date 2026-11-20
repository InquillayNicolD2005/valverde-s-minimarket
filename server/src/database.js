import 'dotenv/config';
import { Sequelize } from 'sequelize';

const isProduction = process.env.NODE_ENV === 'production';
const usePostgres = isProduction && Boolean(process.env.DATABASE_URL);

export const sequelize = usePostgres
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
    })
  : new Sequelize(
      process.env.DB_NAME || 'valverdes_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        dialect: 'mysql',
        logging: false
      }
    );
