import express from 'express';
import authMiddleware from '../utils/authMiddleware';
import User from '../models/User';
import redis from '../utils/redis';

const router = express.Router();


router.post('/', authMiddleware, async (req, res) => {
  try {
    const propertyIds: string[] = req.body.propertyIds; // Expecting an array
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({ error: 'propertyIds must be a non-empty array' });
    }

    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });


    const newFavorites = propertyIds.filter(id => !user.favorites.includes(id));
    if (newFavorites.length > 0) {
      user.favorites.push(...newFavorites);
      await user.save();

      // Invalidate favorites cache
      const cacheKey = `favorites:${req.user!.id}`;
      await redis.del(cacheKey);
    }

    res.status(200).json({ added: newFavorites.length });
  } catch (error) {
    console.error('Error adding favorites:', error);
    res.status(500).json({ error: 'Failed to add favorites' });
  }
});


router.get('/', authMiddleware, async (req, res) => {
  try {
    const cacheKey = `favorites:${req.user!.id}`;


    const cachedFavorites = await redis.get(cacheKey);
    if (cachedFavorites) {
    const parsedFavorites = JSON.parse(cachedFavorites);
    if (Array.isArray(parsedFavorites) && parsedFavorites.length > 0) {
    console.log('Serving favorites from cache');
    return res.json(parsedFavorites);
  }
}

    const user = await User.findById(req.user!.id)
    console.log(user)
    if (!user) return res.status(404).json({ error: 'User not found' });
    await redis.set(cacheKey, JSON.stringify(user.favorites), 'EX', 60 * 10);
    res.json(user.favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});


router.delete('/', authMiddleware, async (req, res) => {
  try {
    const propertyIds: string[] = req.body.propertyIds;
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({ error: 'propertyIds must be a non-empty array' });
    }

    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const originalLength = user.favorites.length;
    user.favorites = user.favorites.filter(fav => !propertyIds.includes(fav.toString()));

    if (user.favorites.length !== originalLength) {
      await user.save();
      const cacheKey = `favorites:${req.user!.id}`;
      await redis.del(cacheKey);
    }

    res.sendStatus(204);
  } catch (error) {
    console.error('Error removing favorites:', error);
    res.status(500).json({ error: 'Failed to remove favorites' });
  }
});

export default router;

