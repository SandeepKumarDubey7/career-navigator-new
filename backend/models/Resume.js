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
  atsBreakdown: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  detectedSkills: {
    type: [String],
    default: [],
  },
  experienceLevel: {
    type: String,
    required: false,
  },
  targetField: {
    type: String,
    required: false,
  },
  targetImprovements: {
    type: [String],
    default: [],
  },
  roadmap: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', resumeSchema);
