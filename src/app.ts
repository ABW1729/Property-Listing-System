import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/property';
import favoriteRoutes from './routes/favorite';
import recommendationRoutes from './routes/recommendation';
import redis from './utils/redis';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const DB_USER = process.env.MONGO_INITDB_ROOT_USERNAME || 'root';
const DB_PASS = process.env.MONGO_INITDB_ROOT_PASSWORD || 'pass123';


const MONGODB_URI = `mongodb://${DB_USER}:${DB_PASS}@mongo:27017/propertydb?authSource=admin`;

mongoose.connect(MONGODB_URI)
  .then(() => {
  console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
