const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/janseva';
  
  try {
    // Attempt connecting to the configured MongoDB URI with a short timeout
    console.log(`[JanSeva DB] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000 // 2 seconds timeout to check if local mongod is up
    });
    console.log('[JanSeva DB] Connected successfully to external MongoDB server.');
  } catch (err) {
    console.warn(`[JanSeva DB] Could not connect to external MongoDB (${err.message}).`);
    console.log('[JanSeva DB] Initializing MongoMemoryServer for standalone zero-config execution...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      
      await mongoose.connect(memoryUri);
      console.log(`[JanSeva DB] Connected successfully to in-memory MongoDB at: ${memoryUri}`);
    } catch (mmsErr) {
      console.error('[JanSeva DB] Failed to start in-memory MongoDB:', mmsErr.message);
      throw mmsErr;
    }
  }

  // Ensure default demo officer exists
  await ensureDefaultDemoData();
};

async function ensureDefaultDemoData() {
  try {
    const Officer = require('../models/Officer');
    const bcrypt = require('bcryptjs');

    const existingDemoOfficer = await Officer.findOne({ officerId: 'OFF001' });
    if (!existingDemoOfficer) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('1234', salt);

      await Officer.create({
        officerId: 'OFF001',
        name: 'Sri Rajesh Sharma',
        passwordHash: hashedPassword,
        department: 'Municipal Corporation Grievance Redressal',
        designation: 'Senior Municipal Nodal Officer',
        phone: '+91 98765 43210',
        email: 'officer.rajesh@janseva.gov.in'
      });
      console.log('[JanSeva DB] Demo Officer initialized: OFF001 / 1234');
    }

    // Auto-seed sample complaints if collection is empty
    const Complaint = require('../models/Complaint');
    const count = await Complaint.countDocuments();
    if (count === 0) {
      const { seedComplaints } = require('../scripts/sampleData');
      await seedComplaints();
    }
  } catch (seedErr) {
    console.error('[JanSeva DB] Error ensuring demo data:', seedErr.message);
  }
}

module.exports = { connectDB };
