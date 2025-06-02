import express from 'express';
import authMiddleware from '../utils/authMiddleware';
import User from '../models/User';
import Recommendation from '../models/Recommendation';
import redis from '../utils/redis';

const router = express.Router();


router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { recipientEmail } = req.body;

    const recipient = await User.findOne({ email: recipientEmail }).select('-password'); 
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });

    const cacheKey = `user:search:${recipient._id}`;
    await redis.set(cacheKey, JSON.stringify(recipient), 'EX', 3600);

    res.status(200).json(recipient);
  } catch (error) {
    console.error('Error searching recipient:', error);
    res.status(500).json({ error: 'Failed to search recipient' });
  }
});


router.post('/', authMiddleware, async (req, res) => {
  try {
    const { recipientEmail, propertyId } = req.body;

    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });


    const existingRec = await Recommendation.findOne({
      from: req.user!.id,
      to: recipient._id,
      property: propertyId,
    });

    if (existingRec) {
      return res.status(409).json({ error: 'Recommendation already sent' });
    }

    const rec = await Recommendation.create({
      from: req.user!.id,
      to: recipient._id,
      property: propertyId,
    });


    const cacheKey = `recommendations:received:${recipient._id}`;
    await redis.del(cacheKey);

    res.status(201).json(rec);
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ error: 'Failed to create recommendation' });
  }
});


router.get('/received', authMiddleware, async (req, res) => {
  try {
    const cacheKey = `recommendations:received:${req.user!.id}`;

    // Try cache first
    const cachedRecs = await redis.get(cacheKey);
   if (cachedRecs) {
   const parsedRecs = JSON.parse(cachedRecs);
   const isValidCache = Array.isArray(parsedRecs) && parsedRecs.some(rec => rec.property);
   if (isValidCache) {
    console.log('Serving recommendations from cache');
    return res.json(parsedRecs);
   } else {
    console.log('Cache is invalid or incomplete, fetching from DB');
   }
  }

    const recs = await Recommendation.find({ to: req.user!.id }).select('property from -_id').populate('from', 'email'); 
    await redis.set(cacheKey, JSON.stringify(recs), 'EX', 60 * 10);

    res.json(recs);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;

