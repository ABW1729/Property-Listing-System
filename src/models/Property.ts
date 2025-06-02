import mongoose, { Schema, Document,Types } from 'mongoose';

export interface IProperty extends Document {
  id: string;
  title: string;
  type: string;
  price: number;
  state: string;
  city: string;
  areaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];   
  furnished: string;    // Note: the array contains pipe-separated strings
  availableFrom: Date;
  listedBy: string;
  tags: string;              // Stored as pipe-separated string
  colorTheme: string;
  rating: number;
  isVerified: boolean;
  listingType: string;
  createdBy: Types.ObjectId;
}

const PropertySchema: Schema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  areaSqFt: { type: Number, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  amenities: [{ type: String }],  // stored as string array (even if pipe-separated inside)
  furnished: { type: String, required: true },
  availableFrom: { type: Date, required: true },
  listedBy: { type: String, required: true },
  tags: { type: String },         // pipe-separated string
  colorTheme: { type: String },
  rating: { type: Number },
  isVerified: { type: Boolean },
  listingType: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model<IProperty>('Property', PropertySchema, 'propertydb');

