const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  resumeText: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  missingSkills: {
    type: [String],
    default: [],
  },
  atsScore: {
    type: Number,
    required: true,
  },
  targetField: {
    type: String,
    required: false,
  },
  targetImprovements: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', resumeSchema);
