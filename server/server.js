import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
import dns from 'dns';

// Fix for Node.js DNS resolution order preference causing ECONNREFUSED
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());

// List of all 18 collections discovered in the MongoDB database
const collections = [
  'shops',
  'products',
  'refreshtokens',
  'communitymemberships',
  'communities',
  'reports',
  'savedposts',
  'follows',
  'notifications',
  'usercommunityaccesses',
  'comments',
  'admins',
  'services',
  'posts',
  'likes',
  'auctions',
  'users',
  'bids'
];

// Establish MongoDB connection
console.log('Connecting to MongoDB...');
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();
console.log(`Connected to database: "${db.databaseName}"`);

// 1. GET / - Simple API Home Screen
app.get('/', (req, res) => {
  res.send(`
    <body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 3rem; text-align: center;">
      <h1>Mohalla Dynamic GET-Only Backend Server</h1>
      <p style="color: #94a3b8;">GET endpoints registered explicitly for all 18 collections.</p>
      <a href="/api/collections" style="color: #6366f1; text-decoration: none; font-weight: bold;">View Collections List</a>
    </body>
  `);
});

// 2. GET /api/collections - List all database collections
app.get('/api/collections', async (req, res) => {
  try {
    const dbCollections = await db.listCollections().toArray();
    res.json(dbCollections.map(c => c.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Programmatically register dedicated GET routes for each collection
collections.forEach((colName) => {

  // GET /api/collectionName - Retrieve all documents inside the collection
  app.get(`/api/${colName}`, async (req, res) => {
    try {
      const data = await db.collection(colName).find().toArray();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/collectionName/:id - Retrieve a single document by its _id
  app.get(`/api/${colName}/:id`, async (req, res) => {
    try {
      const _id = /^[0-9a-fA-F]{24}$/.test(req.params.id) ? new ObjectId(req.params.id) : req.params.id;
      const doc = await db.collection(colName).findOne({ _id });
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      res.json(doc);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

});

// Start listening
app.listen(PORT, HOST, () => {
  console.log(`🚀 Dedicated GET Server is running on: http://${HOST}:${PORT}`);
});
