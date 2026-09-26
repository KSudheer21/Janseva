const mongoose = require('mongoose');

const timelineItemSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      default: ''
    },
    performedBy: {
      type: String,
      default: 'System'
    }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Citizen',
      required: true,
      index: true
    },
    citizenName: {
      type: String,
      default: 'Citizen'
    },
    mobile: {
      type: String,
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    language: {
      type: String,
      enum: ['en', 'te', 'hi'],
      default: 'en'
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Roads',
        'Street Lights',
        'Garbage',
        'Water',
        'Drainage',
        'Electricity',
        'Public Facilities',
        'Environment',
        'Other'
      ],
      index: true
    },
    priority: {
      type: String,
      enum: ['High', 'Moderate', 'Low'],
      default: 'Moderate',
      index: true
    },
    photoUrl: {
      type: String,
      default: ''
    },
    location: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      },
      exactAddress: {
        type: String,
        default: ''
      },
      village: {
        type: String,
        default: ''
      },
      mandal: {
        type: String,
        default: ''
      },
      district: {
        type: String,
        default: ''
      }
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'ASSIGNED', 'IN PROGRESS', 'COMPLETED', 'REJECTED'],
      default: 'SUBMITTED',
      index: true
    },
    assignedOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Officer',
      default: null,
      index: true
    },
    assignedOfficerCode: {
      type: String,
      default: ''
    },
    assignedOfficerName: {
      type: String,
      default: ''
    },
    assignedAt: {
      type: Date,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    completionPhotoUrl: {
      type: String,
      default: ''
    },
    resolutionNote: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    timeline: [timelineItemSchema]
  },
  {
    timestamps: true
  }
);

// Indexes for high performance querying
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ priority: 1, createdAt: -1 });
complaintSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
