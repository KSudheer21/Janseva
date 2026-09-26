const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const officerSchema = new mongoose.Schema(
  {
    officerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    department: {
      type: String,
      default: 'Municipal Administration & Urban Development',
      trim: true
    },
    designation: {
      type: String,
      default: 'Nodal Officer',
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Method to verify password
officerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('Officer', officerSchema);
