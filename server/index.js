import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDB, sequelize } from './config/db.js';
import routes from './routes/index.js';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '.env');
dotenv.config({ path: envPath });


connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://elcontadorec.store'] // Revisar  puerto. Puede que tenga que agregar el backend aqui
    : ['http://localhost:3000', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  maxAge: 86400 // CORS preflight cache time in seconds (24 hours)
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Home route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Sync database models - using sync({ force: false }) to not alter tables
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database models synchronized');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err);
    process.exit(1);
  });

export default app; 