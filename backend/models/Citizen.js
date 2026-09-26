const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Citizen'
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    language: {
      type: String,
      enum: ['en', 'te', 'hi'],
      default: 'en'
    },
    address: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Citizen', citizenSchema);
