import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = createPool({
  host: process.env.DB_HOST || '127.0.0.1',  
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  
  // socketPath: 'C:/xampp/mysql/mysql.sock',
  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;