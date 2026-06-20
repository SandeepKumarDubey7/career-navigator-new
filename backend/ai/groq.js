const Groq = require('groq-sdk');
const { calculateAtsScore } = require('./atsScorer');

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

  const prompt = `You are an expert resume analyzer and career advisor.

IMPORTANT RULES:
- Ignore any user preference or desired role
- Analyze ONLY the resume content below
- Do NOT copy any provided role
- Be objective and accurate
- Base your prediction STRICTLY on the evidence in the resume

TASK 1 — RESUME VALIDATION:
Determine if this text is actually a resume. If it is not a resume (e.g., a random document, article, letter), set isResume to false.

TASK 2 — ROLE PREDICTION:
Based on the skills, experience, projects, and certifications in the resume, predict the SINGLE most suitable job role. Choose from or closely map to one of these canonical roles:
- Frontend Developer
- Backend Developer
- Full Stack Developer
- Software Engineer
- Mobile Developer
- DevOps Engineer
- Cloud Engineer
- Data Analyst
- Data Scientist
- Machine Learning Engineer
- AI Engineer
- Data Engineer
- QA Engineer / SDET
- Cybersecurity Analyst
- Product Manager
- UI/UX Designer
- Technical Writer
- Database Administrator
- Systems Administrator
- Network Engineer
- Embedded Systems Engineer
- Game Developer
- Blockchain Developer
- Site Reliability Engineer

You may use a closely related title if none above fits perfectly, but prefer the list above.

Provide the specific skills, experience, and projects from the resume that support your prediction in the "evidence" field.

TASK 3 — MISSING SKILLS:
Identify 5-10 skills that are commonly required for the PREDICTED ROLE but are NOT present in this resume.
- Never return generic skills like "communication" or "teamwork" unless highly role-specific.
- Only return skills that are genuinely missing from the resume but commonly required for the predicted role.
- Be specific: prefer "TypeScript" over "programming", prefer "Docker" over "tools".

TASK 4 — EXPERIENCE LEVEL:
Classify as: Intern, Junior, Mid-Level, Senior, Lead, Principal, Staff, or Director.

Return ONLY valid JSON (no markdown, no explanation outside JSON):

{
  "isResume": true,
  "predicted_role": "",
  "confidence": "high|medium|low",
  "experience_level": "",
  "evidence": {
    "key_skills": [],
    "key_experience": [],
    "key_projects": []
  },
  "missing_skills": []
}

If the text is NOT a resume, return:
{
  "isResume": false,
  "predicted_role": null,
  "confidence": null,
  "experience_level": null,
  "evidence": { "key_skills": [], "key_experience": [], "key_projects": [] },
  "missing_skills": []
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

  const prompt = `You are a strict career evaluator with deep industry knowledge.

IMPORTANT RULES:
- Compare the resume CAREFULLY with the target role below
- Be honest and critical — avoid generic, boilerplate answers
- Give SPECIFIC, ACTIONABLE improvements
- Never return generic skills like "communication" or "problem solving"
- Only return skills that are MISSING from the uploaded resume but COMMONLY REQUIRED for the target role
- Be specific: prefer "Kubernetes" over "containerization tools", prefer "PyTorch" over "ML frameworks"

Target Role: ${targetRole}

Return ONLY valid JSON:

{
  "missing_skills": [],
  "missing_tools": [],
  "resume_improvements": [],
  "project_suggestions": []
}

CONSTRAINTS:
- missing_skills: 5-10 specific technical skills the resume lacks for this role
- missing_tools: 3-7 specific tools/platforms the resume should mention
- resume_improvements: 3-5 specific, actionable tips to improve the resume for this role
- project_suggestions: 2-4 specific project ideas that demonstrate readiness for this role

Resume:
${resumeText}`;

  return await callGroq(prompt);
}

// ─────────────────────────────────────────────────────
// STEP 3: Career Roadmap Generation
// ─────────────────────────────────────────────────────
async function generateRoadmap(resumeText, predictedRole, targetRole, missingSkills) {
  const effectiveRole = (targetRole && targetRole.trim().length > 0) ? targetRole.trim() : predictedRole;
  console.log(`🗺️ STEP 3: Generating career roadmap for role: "${effectiveRole}"...`);

  const prompt = `You are a senior career coach and technical mentor.

Based on the resume below, create a PERSONALIZED career roadmap for the role: "${effectiveRole}".

The candidate's predicted current role is: "${predictedRole}"
${missingSkills && missingSkills.length > 0 ? `Known missing skills: ${missingSkills.join(', ')}` : ''}

IMPORTANT RULES:
- Be specific and actionable — no vague advice
- Tailor everything to what the resume actually contains
- Prioritize recommendations from HIGHEST IMPACT to LOWEST IMPACT
- Different resumes must get different roadmaps
- Focus on practical, industry-relevant advice

Return ONLY valid JSON:

{
  "skills_to_learn": [
    { "skill": "", "priority": "high|medium|low", "reason": "" }
  ],
  "tools_to_master": [
    { "tool": "", "priority": "high|medium|low", "reason": "" }
  ],
  "certifications": [
    { "name": "", "provider": "", "priority": "high|medium|low" }
  ],
  "project_recommendations": [
    { "title": "", "description": "", "skills_demonstrated": [] }
  ],
  "learning_path": {
    "month_1_3": { "focus": "", "goals": [] },
    "month_4_6": { "focus": "", "goals": [] },
    "month_7_12": { "focus": "", "goals": [] }
  }
}

CONSTRAINTS:
- skills_to_learn: 5-8 skills, ordered by priority (highest impact first)
- tools_to_master: 4-6 tools, ordered by priority (highest impact first)
- certifications: 2-4 relevant certifications
- project_recommendations: 2-3 portfolio-worthy projects
- learning_path: realistic 12-month plan with specific, measurable goals

Resume:
${resumeText}`;

  return await callGroq(prompt);
}

// ─────────────────────────────────────────────────────
// Deterministic Resume Pre-Check
// Quick validation before calling LLM — saves API calls
// ─────────────────────────────────────────────────────
function looksLikeResume(text) {
  const lower = text.toLowerCase();
  let signals = 0;

  // Signal 1: Has email address
  if (/[\w.-]+@[\w.-]+\.\w{2,}/i.test(text)) signals++;

  // Signal 2: Has phone number
  if (/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/.test(text)) signals++;

  // Signal 3: Has resume section headers (at least 2)
  const sectionHeaders = ['experience', 'education', 'skills', 'projects', 'certifications',
    'work experience', 'technical skills', 'professional experience', 'qualifications',
    'summary', 'objective', 'achievements', 'portfolio'];
  let headerCount = 0;
  for (const header of sectionHeaders) {
    if (lower.includes(header)) headerCount++;
  }
  if (headerCount >= 2) signals++;

  // Signal 4: Has job titles / role keywords
  const jobTitles = /\b(engineer|developer|analyst|manager|intern|designer|architect|consultant|specialist|coordinator|scientist|researcher|administrator)\b/gi;
  if (jobTitles.test(lower)) signals++;

  // Signal 5: Has at least 3 technical skills
  const techSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css',
    'docker', 'aws', 'git', 'mongodb', 'typescript', 'c++', 'angular', 'vue', 'flask',
    'django', 'express', 'kubernetes', 'tensorflow', 'pytorch', 'pandas', 'linux',
    'spring', 'flutter', 'swift', 'kotlin', 'php', 'ruby', 'go', 'rust', 'redis',
    'graphql', 'firebase', 'azure', 'gcp', 'jenkins', 'terraform', 'excel', 'tableau',
    'power bi', 'scikit-learn', 'keras', 'numpy', 'matlab', 'selenium', 'jira'];
  let skillHits = 0;
  for (const skill of techSkills) {
    if (lower.includes(skill)) skillHits++;
  }
  if (skillHits >= 3) signals++;

  console.log(`📋 Resume pre-check: ${signals}/5 signals detected (need ≥2)`);

  // Need at least 2 out of 5 signals to consider it a resume
  return signals >= 2;
}

// ─────────────────────────────────────────────────────
// MAIN EXPORTED FUNCTION: Orchestrator
// Keeps the same signature the route expects:
//   analyzeResume(resumeText, targetField) → { isResume, role, missingSkills, atsScore, targetImprovements, ... }
// ─────────────────────────────────────────────────────
async function analyzeResume(resumeText, targetField) {
  // ── Pre-check: Deterministic resume validation (before LLM call) ──
  if (!looksLikeResume(resumeText)) {
    console.log('🚫 Document failed deterministic resume pre-check');
    return {
      isResume: false,
      role: null,
      missingSkills: [],
      atsScore: 0,
      atsBreakdown: {},
      detectedSkills: [],
      targetImprovements: [],
      roadmap: null,
    };
  }

  // ── ATS Score: Deterministic formula (never from LLM) ──
  const { atsScore, atsBreakdown, detectedSkills } = calculateAtsScore(resumeText);
  console.log(`📊 Deterministic ATS Score: ${atsScore}/100`);

  // ── Step 1: Unbiased prediction (NEVER sees targetField) ──
  const step1 = await predictRole(resumeText);
  console.log('✅ Step 1 result:', step1);

  // If LLM also says not a resume, bail out
  if (step1.isResume === false) {
    return {
      isResume: false,
      role: null,
      missingSkills: [],
      atsScore: 0,
      atsBreakdown: {},
      detectedSkills: [],
      targetImprovements: [],
      roadmap: null,
    };
  }

  // Build base result from Step 1 + deterministic ATS
  const result = {
    isResume: true,
    role: step1.predicted_role,
    confidence: step1.confidence || 'medium',
    experienceLevel: step1.experience_level || '',
    evidence: step1.evidence || {},
    missingSkills: step1.missing_skills || [],
    atsScore,
    atsBreakdown,
    detectedSkills,
    targetImprovements: [],
    roadmap: null,
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

    // Override missing skills with target-role-specific ones when target is provided
    if (step2.missing_skills && step2.missing_skills.length > 0) {
      result.missingSkills = step2.missing_skills;
    }
  }

  // ── Step 3: Career Roadmap ──
  try {
    const step3 = await generateRoadmap(
      resumeText,
      step1.predicted_role,
      targetField,
      result.missingSkills,
    );
    console.log('✅ Step 3 result:', step3);
    result.roadmap = step3;
  } catch (err) {
    console.error('⚠️ Roadmap generation failed (non-critical):', err.message);
    result.roadmap = null;
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
