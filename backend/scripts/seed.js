require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { seedComplaints } = require('./sampleData');
const Complaint = require('../models/Complaint');
const Citizen = require('../models/Citizen');
const Officer = require('../models/Officer');
const Counter = require('../models/Counter');
const Notification = require('../models/Notification');

async function runSeed() {
  try {
    await connectDB();
    console.log('[JanSeva Seeder] Resetting existing collections for clean seed...');
    await Complaint.deleteMany({});
    await Citizen.deleteMany({});
    await Officer.deleteMany({});
    await Counter.deleteMany({});
    await Notification.deleteMany({});

    await seedComplaints();
    console.log('[JanSeva Seeder] Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[JanSeva Seeder] Error during seed:', err);
    process.exit(1);
  }
}

runSeed();
