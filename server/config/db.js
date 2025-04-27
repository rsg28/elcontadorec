import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(dirname(__dirname), '.env');
dotenv.config({ path: envPath });

// Database configuration with fallbacks
const DB_NAME = process.env.DB_NAME || 'mydb';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    dialect: 'mysql',
    port: DB_PORT,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully');
    console.log(`Connected to: ${DB_NAME} at ${DB_HOST}:${DB_PORT}`);
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    console.error('Connection attempted with:', { DB_HOST, DB_USER, DB_NAME });
    process.exit(1);
  }
};

export { sequelize, connectDB };
export default connectDB; 