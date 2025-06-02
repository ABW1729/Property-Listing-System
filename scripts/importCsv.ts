import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from '../src/models/Property'; 

dotenv.config();

// Use credentials and service hostname from Docker Compose
const DB_USER = process.env.MONGO_INITDB_ROOT_USERNAME || 'root';
const DB_PASS = process.env.MONGO_INITDB_ROOT_PASSWORD || 'pass123';


const MONGODB_URI = `mongodb://${DB_USER}:${DB_PASS}@mongo:27017/propertydb?authSource=admin`;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    importCSV();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

function importCSV() {
  const filePath = path.join(__dirname, 'data', 'properties.csv'); 

  const results: any[] = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      results.push({
        _id: data._id,
        id: data.id,
        title: data.title,
        type: data.type,
        price: parseInt(data.price),
        state: data.state,
        city: data.city,
        areaSqFt: parseInt(data.areaSqFt),
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
        amenities: data.amenities,
        furnished: data.furnished,
        availableFrom: new Date(data.availableFrom),
        listedBy: data.listedBy,
        tags: data.tags, 
        colorTheme: data.colorTheme,
        rating: parseFloat(data.rating),
        isVerified: data.isVerified === 'true',
        listingType: data.listingType,
      });
    })
    .on('end', async () => {
      try {
        await Property.insertMany(results);
        console.log('✅ Properties imported successfully');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error importing properties:', err);
        process.exit(1);
      }
    });
}

