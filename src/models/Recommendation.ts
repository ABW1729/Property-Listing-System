import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  property: { type: String, ref: 'Property' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Recommendation', recommendationSchema);
