const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const Reviews = require('./review');
const Dealerships = require('./dealership');

const app = express();
const port = Number(process.env.PORT || 3030);
const mongoUri = process.env.MONGO_URI || 'mongodb://mongo_db:27017/dealershipsDB';

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.text({ type: 'text/plain', limit: '1mb' }));

const loadSeedData = (file, key) => {
  const location = path.join(__dirname, 'data', file);
  const data = JSON.parse(fs.readFileSync(location, 'utf8'));
  if (!Array.isArray(data[key])) {
    throw new Error(`${location} does not contain the expected ${key} array`);
  }
  return data[key];
};

// Seed only an empty collection. This preserves new reviews across restarts.
async function seedIfEmpty() {
  if ((await Dealerships.countDocuments()) === 0) {
    const dealers = loadSeedData('dealerships.json', 'dealerships');
    await Dealerships.insertMany(dealers);
    console.log(`Seeded ${dealers.length} dealerships`);
  } else {
    console.log('Existing dealership data retained');
  }

  if ((await Reviews.countDocuments()) === 0) {
    const reviews = loadSeedData('reviews.json', 'reviews');
    await Reviews.insertMany(reviews);
    console.log(`Seeded ${reviews.length} reviews`);
  } else {
    console.log('Existing customer reviews retained');
  }
}

function validId(raw) {
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function sendError(res, error) {
  console.error(error);
  return res.status(500).json({ error: 'Database request failed' });
}

app.get('/', (_req, res) => res.send('Welcome to the Mongoose API'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/fetchReviews', async (_req, res) => {
  try {
    const documents = await Reviews.find().sort({ id: 1 });
    return res.json(documents);
  } catch (error) {
    return sendError(res, error);
  }
});

// Q8: Reviews for one dealer. Seed data contains a review for dealer 15.
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  const id = validId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid dealer ID' });
  try {
    const documents = await Reviews.find({ dealership: id }).sort({ id: 1 });
    return res.json(documents);
  } catch (error) {
    return sendError(res, error);
  }
});

// Q9: Fetch every dealership.
app.get('/fetchDealers', async (_req, res) => {
  try {
    const documents = await Dealerships.find().sort({ id: 1 });
    return res.json(documents);
  } catch (error) {
    return sendError(res, error);
  }
});

// Q11: Filter dealerships by state, including case-insensitive Kansas queries.
app.get('/fetchDealers/:state', async (req, res) => {
  const stateInput = req.params.state.trim();
  if (!stateInput) return res.status(400).json({ error: 'State is required' });
  if (stateInput.toLowerCase() === 'all') {
    try {
      return res.json(await Dealerships.find().sort({ id: 1 }));
    } catch (error) {
      return sendError(res, error);
    }
  }
  const state = stateInput.toUpperCase() === 'KS' ? 'Kansas' : stateInput;
  const escaped = state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const documents = await Dealerships.find({
      state: { $regex: `^${escaped}$`, $options: 'i' },
    }).sort({ id: 1 });
    return res.json(documents);
  } catch (error) {
    return sendError(res, error);
  }
});

// Q10: Lookup a particular dealer ID. Return an array as in other IBM APIs.
app.get('/fetchDealer/:id', async (req, res) => {
  const id = validId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid dealer ID' });
  try {
    const documents = await Dealerships.find({ id });
    return res.json(documents);
  } catch (error) {
    return sendError(res, error);
  }
});

// Keep this route for the later Post Review tasks.
app.post('/insert_review', async (req, res) => {
  let data = req.body;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); }
    catch (_) { return res.status(400).json({ error: 'Invalid JSON body' }); }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: 'Expected a review object' });
  }
  try {
    const newest = await Reviews.findOne().sort({ id: -1 }).lean();
    const newReview = new Reviews({
      id: newest ? newest.id + 1 : 1,
      name: data.name,
      dealership: Number(data.dealership),
      review: data.review,
      purchase: data.purchase,
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: Number(data.car_year),
    });
    const saved = await newReview.save();
    return res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Review could not be saved' });
  }
});

// Do not listen for HTTP traffic until Mongo is ready and seeded.
async function start() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 20000 });
    console.log('Connected to MongoDB');
    await seedIfEmpty();
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Unable to start dealer API:', error);
    process.exit(1);
  }
}

start();
