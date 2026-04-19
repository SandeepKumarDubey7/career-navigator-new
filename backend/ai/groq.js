const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY ,
});

const MODEL = 'llama-3.3-70b-versatile';
const TEMPERATURE = 0.2;
const MAX_RETRIES = 3;

// ─────────────────────────────────────────────────────
// STEP 1: Unbiased Role Prediction (resume-only, no user input)
// ─────────────────────────────────────────────────────
async function predictRole(resumeText) {
  console.log('🔍 STEP 1: Predicting role from resume (unbiased)...');

  const prompt = `You are an expert resume analyzer.

IMPORTANT:
- Ignore any user preference or desired role
- Analyze ONLY the resume content
- Do NOT copy any provided role
- Be objective and accurate

Task:
Predict the most suitable job role.
Also determine if this text is actually a resume. If not, set isResume to false.
Also provide an ATS score from 0-100 based on resume quality.

Return ONLY valid JSON:

{
  "isResume": true,
  "predicted_role": "",
  "confidence": "",
  "experience_level": "",
  "detected_skills": [],
  "missing_skills": [],
  "ats_score": 0
}

If the text is NOT a resume, return:
{
  "isResume": false,
  "predicted_role": null,
  "confidence": null,
  "experience_level": null,
  "detected_skills": [],
  "missing_skills": [],
  "ats_score": 0
}

Resume:
${resumeText}`;

  return await callGroq(prompt);
}

// ─────────────────────────────────────────────────────
// STEP 2: Skill Gap Analysis (resume vs target role)
// ─────────────────────────────────────────────────────
async function skillGapAnalysis(resumeText, targetRole) {
  console.log(`🎯 STEP 2: Skill gap analysis for target role: "${targetRole}"...`);

  const prompt = `You are a strict career evaluator.

IMPORTANT:
- Compare the resume with the target role below
- Be honest and critical (avoid generic answers)
- Give specific, actionable improvements

Target Role: ${targetRole}

Return ONLY valid JSON:

{
  "missing_skills": [],
  "missing_tools": [],
  "resume_improvements": [],
  "project_suggestions": []
}

Resume:
${resumeText}`;

  return await callGroq(prompt);
}

// ─────────────────────────────────────────────────────
// MAIN EXPORTED FUNCTION: Orchestrator
// Keeps the same signature the route expects:
//   analyzeResume(resumeText, targetField) → { isResume, role, missingSkills, atsScore, targetImprovements }
// ─────────────────────────────────────────────────────
async function analyzeResume(resumeText, targetField) {
  // ── Step 1: Unbiased prediction (NEVER sees targetField) ──
  const step1 = await predictRole(resumeText);
  console.log('✅ Step 1 result:', step1);

  // If not a resume, bail out immediately
  if (step1.isResume === false) {
    return {
      isResume: false,
      role: null,
      missingSkills: [],
      atsScore: 0,
      targetImprovements: [],
    };
  }

  // Build base result from Step 1
  const result = {
    isResume: true,
    role: step1.predicted_role,
    missingSkills: step1.missing_skills || [],
    atsScore: step1.ats_score || 0,
    targetImprovements: [],
  };

  // ── Step 2: Skill gap (only if user provided a target field) ──
  if (targetField && targetField.trim().length > 0) {
    const step2 = await skillGapAnalysis(resumeText, targetField.trim());
    console.log('✅ Step 2 result:', step2);

    // Combine all gap data into targetImprovements for the frontend
    const improvements = [];

    if (step2.missing_skills && step2.missing_skills.length > 0) {
      improvements.push(`Skills to learn: ${step2.missing_skills.join(', ')}`);
    }
    if (step2.missing_tools && step2.missing_tools.length > 0) {
      improvements.push(`Tools to master: ${step2.missing_tools.join(', ')}`);
    }
    if (step2.resume_improvements) {
      step2.resume_improvements.forEach((tip) => improvements.push(tip));
    }
    if (step2.project_suggestions) {
      step2.project_suggestions.forEach((proj) => improvements.push(`Project idea: ${proj}`));
    }

    result.targetImprovements = improvements;
  }

  return result;
}

// ─────────────────────────────────────────────────────
// Groq API caller with retry logic
// ─────────────────────────────────────────────────────
async function callGroq(prompt) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        temperature: TEMPERATURE,
        response_format: { type: 'json_object' },
      });

      const text = response.choices[0]?.message?.content || '';
      console.log('📝 Raw Groq response:', text);

      return parseJsonSafely(text);
    } catch (error) {
      const isRateLimit = error.status === 429;
      if (isRateLimit && attempt < MAX_RETRIES) {
        const waitSec = attempt * 10;
        console.log(`⏳ Rate limited. Retrying in ${waitSec}s... (attempt ${attempt}/${MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
      } else {
        throw error;
      }
    }
  }
}

// ─────────────────────────────────────────────────────
// Safe JSON parser
// ─────────────────────────────────────────────────────
function parseJsonSafely(text) {
  // Try direct parse
  try {
    return JSON.parse(text);
  } catch (e) {
    console.log('⚠️ Direct JSON parse failed, attempting extraction...');
  }

  // Try markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {
      console.log('⚠️ Code block JSON parse failed...');
    }
  }

  // Try raw JSON extraction
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.log('⚠️ Extracted JSON parse failed...');
    }
  }

  throw new Error('Could not parse Groq response as JSON');
}

module.exports = { analyzeResume };
