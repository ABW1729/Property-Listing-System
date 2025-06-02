import express from 'express';
import Property from '../models/Property';
import authMiddleware from '../utils/authMiddleware';
import redis from '../utils/redis'; 
import crypto from "crypto";



const router = express.Router();
function generateFilterCacheKey(body: object) {
  const str = JSON.stringify(body);
  return "filter:" + crypto.createHash("md5").update(str).digest("hex");
}

router.post('/', authMiddleware, async (req, res) => {
  try {

    const latestProperty = await Property.findOne({})
      .sort({ id: -1 })
      .collation({ locale: 'en_US', numericOrdering: true }); 
      console.log(latestProperty)
    
    let newIdNumber = 1025; 
    if (latestProperty && latestProperty.id) {
      const match = latestProperty.id.match(/^PROP(\d+)$/);
      if (match) {
        newIdNumber = parseInt(match[1]) + 1;
      }
    }

    const newPropertyId = `PROP${newIdNumber}`;

   
    const property = await Property.create({
      ...req.body,
      id: newPropertyId,
      createdBy: req.user!.id
    });
    const cacheKey = `property:${property.id}`;
    await redis.set(cacheKey, JSON.stringify(property), 'EX', 60 * 10);


    await redis.del('property:list');
    res.status(201).json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});



router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const cacheKey = `property:${propertyId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log('Cache hit for', cacheKey);
      const property = JSON.parse(cached);
      return res.json(property);
    } else {
      console.log('Cache miss for', cacheKey);
      const property = await Property.findOne({ id: propertyId });
      if (!property) return res.status(404).json({ error: 'Property not found' });
      await redis.set(cacheKey, JSON.stringify(property), 'EX', 60 * 10);

      return res.json(property);
    }
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findOne({ id: propertyId });

    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (property.createdBy.toString() !== req.user!.id) return res.sendStatus(403);

    Object.assign(property, req.body);
    await property.save();
    const cacheKey = `property:${propertyId}`;
    await redis.del(cacheKey);

    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const property = await Property.findOne({ id: req.params.id });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    if (property.createdBy?.toString() !== req.user!.id) {
      return res.sendStatus(403);
    }

    await property.deleteOne();
    const cacheKey = `property:${req.params.id}`;
    await redis.del(cacheKey);

    await redis.del('property:list');
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

router.post("/search", async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ error: "Keyword is required for search." });
    }

    const cacheKey = `search:title:${keyword.toLowerCase()}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("Search cache hit");
      return res.json(JSON.parse(cached));
    }

    const query = {
      title: new RegExp(keyword, "i")
    };

    const results = await Property.find(query).limit(100);
    await redis.set(cacheKey, JSON.stringify(results), 'EX', 60 * 10); 

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Server error" });
  }
});



router.post("/filter", async (req, res) => {
  try {
    const cacheKey = generateFilterCacheKey(req.body);
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("Filter cache hit");
      return res.json(JSON.parse(cached));
    }

    const {
      type, state, city, listedBy, furnished, isVerified,
      minPrice, maxPrice, bedrooms, bathrooms, tags, amenities
    } = req.body;

    const query: any = {};

    if (type) query.type = type;
    if (state) query.state = state;
    if (city) query.city = city;
    if (listedBy) query.listedBy = listedBy;
    if (furnished) query.furnished = furnished;
    if (isVerified !== undefined) query.isVerified = isVerified === true;
    if (bedrooms) query.bedrooms = bedrooms;
    if (bathrooms) query.bathrooms = bathrooms;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    if (tags?.length > 0) {
      query.tags = { $in: tags.map((t: string) => new RegExp(`\\b${t}\\b`, "i")) };
    }

    if (amenities?.length > 0) {
      query.amenities = { $in: amenities.map((a: string) => new RegExp(`\\b${a}\\b`, "i")) };
    }

    const properties = await Property.find(query).limit(100);
    await redis.set(cacheKey, JSON.stringify(properties), 'EX', 60 * 10);

    res.json(properties);
  } catch (err) {
    console.error("Filter error:", err);
    res.status(500).json({ error: "Server error" });
  }
});





export default router;
