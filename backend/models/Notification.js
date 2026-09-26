const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientType: {
      type: String,
      enum: ['citizen', 'officer'],
      required: true
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Citizen',
      index: true
    },
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Officer',
      index: true
    },
    complaintId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipientType: 1, citizenId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
