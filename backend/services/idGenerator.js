const Counter = require('../models/Counter');

/**
 * Generates an atomic sequential Complaint ID in the format: JS-YYYY-000001
 */
async function generateComplaintId() {
  const currentYear = new Date().getFullYear();
  const counterId = `complaintId_${currentYear}`;

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(6, '0');
  return `JS-${currentYear}-${paddedSeq}`;
}

module.exports = { generateComplaintId };
