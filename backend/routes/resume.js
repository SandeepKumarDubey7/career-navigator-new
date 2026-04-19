const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../ai/groq');

const router = express.Router();

// Configure multer for file upload (store in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC/DOCX files are allowed'));
    }
  },
});

// POST /analyze-resume
router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    console.log('📄 Resume upload received');
    const targetField = req.body.targetField || '';

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📁 File: ${req.file.originalname} (${req.file.mimetype})`);

    // Extract text from PDF
    let resumeText = '';

    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
      console.log(resumeText);
    } else {
      // For DOC/DOCX, extract as text (basic extraction)
      resumeText = req.file.buffer.toString('utf-8');
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from resume' });
    }

    console.log(`📝 Extracted ${resumeText.length} characters from resume`);

    // Send to Groq API for analysis
    const analysis = await analyzeResume(resumeText, targetField);
    console.log('✅ Analysis complete:', analysis);

    if (analysis.isResume === false) {
      return res.status(400).json({ error: 'The uploaded document does not appear to be a valid resume. Please upload a resume.' });
    }

    // Save to MongoDB
    const savedResume = await Resume.create({
      resumeText: resumeText.substring(0, 10000), // Limit stored text
      role: analysis.role,
      missingSkills: analysis.missingSkills,
      atsScore: analysis.atsScore,
      targetField: targetField,
      targetImprovements: analysis.targetImprovements || [],
    });

    console.log(`💾 Saved to database: ${savedResume._id}`);

    // Return result to frontend
    res.json({
      success: true,
      data: {
        role: analysis.role,
        missingSkills: analysis.missingSkills,
        atsScore: analysis.atsScore,
        targetField: targetField,
        targetImprovements: analysis.targetImprovements || [],
      },
    });
  } catch (error) {
    console.error('❌ Error analyzing resume:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to analyze resume',
    });
  }
});

module.exports = router;
