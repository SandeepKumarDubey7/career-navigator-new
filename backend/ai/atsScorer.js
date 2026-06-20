// ─────────────────────────────────────────────────────
// Deterministic ATS Scoring Engine
// Parses resume text and computes a weighted score.
// Same resume always produces the same score.
// ─────────────────────────────────────────────────────

// ── Keyword dictionaries ──

const TECHNICAL_SKILLS = [
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'golang',
  'rust', 'swift', 'kotlin', 'php', 'scala', 'r', 'matlab', 'perl', 'dart', 'lua',
  'objective-c', 'shell', 'bash', 'powershell', 'sql', 'nosql', 'haskell', 'elixir',
  'clojure', 'groovy', 'visual basic', 'assembly', 'fortran', 'cobol',

  // Frontend
  'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js',
  'next.js', 'nextjs', 'nuxt', 'nuxtjs', 'svelte', 'gatsby', 'html', 'html5',
  'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap',
  'material-ui', 'mui', 'chakra', 'antd', 'styled-components', 'webpack', 'vite',
  'babel', 'jquery', 'redux', 'zustand', 'mobx', 'recoil', 'pinia',

  // Backend
  'node', 'nodejs', 'node.js', 'express', 'expressjs', 'express.js', 'fastify',
  'nest', 'nestjs', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
  'rails', 'ruby on rails', 'laravel', 'asp.net', '.net', 'dotnet',
  'gin', 'fiber', 'actix', 'rocket',

  // Databases
  'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite', 'redis', 'elasticsearch',
  'dynamodb', 'cassandra', 'firebase', 'firestore', 'supabase', 'neo4j', 'couchdb',
  'mariadb', 'oracle', 'mssql', 'sql server', 'influxdb', 'cockroachdb',
  'prisma', 'sequelize', 'typeorm', 'mongoose', 'knex', 'drizzle',

  // Cloud & DevOps
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel',
  'netlify', 'digitalocean', 'cloudflare', 'docker', 'kubernetes', 'k8s',
  'terraform', 'ansible', 'puppet', 'chef', 'jenkins', 'github actions',
  'gitlab ci', 'circleci', 'travis ci', 'bamboo', 'argocd',
  'nginx', 'apache', 'caddy', 'load balancing', 'auto scaling',
  'ci/cd', 'ci cd', 'continuous integration', 'continuous deployment',
  'microservices', 'serverless', 'lambda', 'ecs', 'eks', 'fargate',

  // AI/ML/Data Science
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas',
  'numpy', 'scipy', 'matplotlib', 'seaborn', 'plotly', 'opencv',
  'nltk', 'spacy', 'hugging face', 'huggingface', 'transformers',
  'langchain', 'llamaindex', 'openai', 'gpt', 'bert', 'llm',
  'machine learning', 'deep learning', 'neural network', 'nlp',
  'natural language processing', 'computer vision', 'reinforcement learning',
  'feature engineering', 'model deployment', 'mlops', 'mlflow',
  'data pipeline', 'etl', 'airflow', 'spark', 'hadoop', 'kafka',
  'tableau', 'power bi', 'looker', 'data visualization',
  'statistics', 'statistical analysis', 'regression', 'classification',
  'clustering', 'recommendation system', 'time series',
  'jupyter', 'colab', 'sagemaker', 'databricks',

  // Mobile
  'react native', 'flutter', 'android', 'ios', 'swiftui', 'jetpack compose',
  'xamarin', 'ionic', 'cordova', 'expo',

  // Testing
  'jest', 'mocha', 'chai', 'cypress', 'playwright', 'selenium',
  'puppeteer', 'vitest', 'testing library', 'enzyme', 'junit',
  'pytest', 'unittest', 'rspec', 'tdd', 'bdd', 'unit testing',
  'integration testing', 'e2e testing', 'end-to-end testing',

  // Tools & Others
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
  'slack', 'trello', 'asana', 'notion', 'figma', 'sketch',
  'postman', 'swagger', 'graphql', 'rest', 'restful', 'grpc',
  'websocket', 'socket.io', 'oauth', 'jwt', 'oauth2',
  'linux', 'unix', 'macos', 'windows server',
  'agile', 'scrum', 'kanban', 'devops', 'sre',
  'system design', 'design patterns', 'solid principles',
  'data structures', 'algorithms', 'oop', 'functional programming',
  'api design', 'api development', 'web scraping', 'automation',
  'blockchain', 'web3', 'solidity', 'smart contracts',
  'cybersecurity', 'penetration testing', 'security', 'encryption',
];

const CERTIFICATION_KEYWORDS = [
  'certified', 'certification', 'certificate', 'certifications',
  'aws certified', 'azure certified', 'google certified',
  'pmp', 'scrum master', 'csm', 'cissp', 'ceh', 'comptia', 'itil', 'togaf',
  'oracle certified', 'cisco certified', 'ccna', 'ccnp',
  'rhce', 'ckad', 'cka', 'terraform associate',
  'solutions architect', 'developer associate', 'sysops',
  'machine learning specialty', 'professional cloud', 'associate cloud',
  'meta certified', 'hubspot certified',
  'google analytics', 'aws cloud practitioner',
  'microsoft certified', 'mcsa', 'mcse',
  'salesforce certified', 'istqb',
  'coursera', 'udemy', 'edx', 'udacity nanodegree',
  'cognitiveclass', 'cognitive class', 'great learning',
  'nptel', 'spoken tutorial', 'databricks', 'accredited',
  'simplilearn', 'linkedin learning', 'pluralsight',
  'freecodecamp', 'hackerrank certified',
];

const EDUCATION_KEYWORDS = [
  'bachelor', 'bachelors', "bachelor's", 'b.tech', 'btech', 'b.e.',
  'b.sc', 'bsc', 'b.s.', 'bs', 'b.a.', 'ba',
  'master', 'masters', "master's", 'm.tech', 'mtech', 'm.e.',
  'm.sc', 'msc', 'm.s.', 'ms', 'm.a.', 'ma', 'mba',
  'phd', 'ph.d', 'doctorate', 'doctoral',
  'diploma', 'associate degree', 'postgraduate', 'post-graduate',
  'computer science', 'computer engineering', 'software engineering',
  'information technology', 'data science', 'artificial intelligence',
  'electrical engineering', 'electronics', 'mathematics',
  'statistics', 'physics', 'mechanical engineering',
  'university', 'institute', 'college', 'school of',
  'gpa', 'cgpa', 'grade', 'honors', 'honours', 'cum laude',
  'dean\'s list', 'first class', 'distinction',
];

const SECTION_KEYWORDS = [
  'experience', 'work experience', 'professional experience', 'employment',
  'education', 'academic', 'qualification',
  'skills', 'technical skills', 'core competencies', 'proficiencies',
  'projects', 'personal projects', 'academic projects', 'portfolio',
  'certifications', 'certificates', 'licenses',
  'summary', 'objective', 'profile', 'about me', 'professional summary',
  'achievements', 'awards', 'accomplishments',
  'publications', 'research',
  'volunteer', 'extracurricular', 'activities',
  'references', 'languages', 'interests', 'hobbies',
  'contact', 'phone', 'email', 'linkedin', 'github', 'portfolio',
];

const ACTION_VERBS = [
  'developed', 'built', 'designed', 'implemented', 'created', 'managed',
  'led', 'architected', 'deployed', 'optimized', 'improved', 'maintained',
  'automated', 'analyzed', 'delivered', 'integrated', 'launched', 'reduced',
  'increased', 'achieved', 'collaborated', 'mentored', 'coached',
  'streamlined', 'refactored', 'migrated', 'scaled', 'configured',
  'monitored', 'resolved', 'troubleshot', 'debugged', 'tested',
  'documented', 'presented', 'coordinated', 'spearheaded', 'pioneered',
  'orchestrated', 'engineered', 'established', 'initiated', 'transformed',
];

const QUANTIFIABLE_PATTERNS = [
  /\d+\s*%/g,                         // percentages
  /\d+x\b/gi,                         // multipliers (2x, 10x)
  /\$[\d,]+/g,                        // dollar amounts
  /\d+\s*users/gi,                    // user counts
  /\d+\s*clients/gi,                  // client counts
  /\d+\s*team/gi,                     // team size
  /\d+\s*(?:projects?|apps?)/gi,      // project counts
  /\d+\s*(?:years?|months?)/gi,       // time durations
  /\d+k\b/gi,                         // shorthand thousands
  /\d+m\b/gi,                         // shorthand millions
  /reduced\s.*?\d/gi,                 // "reduced X by Y"
  /increased\s.*?\d/gi,              // "increased X by Y"
  /improved\s.*?\d/gi,               // "improved X by Y"
];

// ── Scoring Functions ──

function countMatches(text, keywords) {
  const lower = text.toLowerCase();
  let count = 0;
  const found = [];
  for (const kw of keywords) {
    // Use word boundary for short keywords, substring for multi-word
    const pattern = kw.includes(' ')
      ? kw.toLowerCase()
      : new RegExp(`\\b${escapeRegex(kw.toLowerCase())}\\b`);

    const matches = typeof pattern === 'string'
      ? lower.includes(pattern)
      : pattern.test(lower);

    if (matches) {
      count++;
      found.push(kw);
    }
  }
  return { count, found };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countRegexMatches(text, patterns) {
  let total = 0;
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) total += matches.length;
  }
  return total;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ── Individual Dimension Scorers (0–100) ──

function scoreSkills(text) {
  const { count, found } = countMatches(text, TECHNICAL_SKILLS);
  // 0 skills → 0, 5 → 50, 10 → 75, 15+ → 90-100
  let score;
  if (count === 0) score = 0;
  else if (count <= 3) score = 15 + count * 8;       // 23–39
  else if (count <= 6) score = 40 + (count - 3) * 7; // 47–61
  else if (count <= 10) score = 62 + (count - 6) * 5; // 67–82
  else if (count <= 15) score = 83 + (count - 10) * 2; // 85–93
  else score = Math.min(98, 93 + (count - 15));        // 94–98

  return { score: clamp(score, 0, 100), count, found };
}

function scoreExperience(text) {
  let experienceYears = 0;
  let jobTitleCount = 0;
  let actionVerbCount = 0;

  // ── Extract only the Experience section (exclude Education, Projects, etc.) ──
  const experienceText = extractSection(text, 'experience');

  // Detect explicit "X years of experience" anywhere (this is always intentional)
  const explicitYearPattern = /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi;
  const explicitMatches = text.matchAll(explicitYearPattern);
  for (const match of explicitMatches) {
    experienceYears = Math.max(experienceYears, parseInt(match[1]));
  }

  // Parse date ranges ONLY from the experience section
  if (experienceText) {
    const dateRangePattern = /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/gi;
    const dateMatches = [...experienceText.matchAll(dateRangePattern)];
    let totalMonths = 0;

    for (const match of dateMatches) {
      const start = parseInt(match[1]);
      const endStr = match[2].toLowerCase();
      const end = (endStr === 'present' || endStr === 'current')
        ? new Date().getFullYear() : parseInt(match[2]);

      if (start >= 1990 && start <= new Date().getFullYear() && end >= start) {
        const duration = end - start;
        // Cap individual job at 15 years to avoid outliers
        totalMonths += Math.min(duration, 15);
      }
    }

    // Use the larger of explicit mention or summed date ranges
    experienceYears = Math.max(experienceYears, totalMonths);
  }

  // Count job titles (common patterns)
  const titlePatterns = /\b(engineer|developer|analyst|manager|lead|director|architect|consultant|intern|associate|specialist|coordinator|designer|administrator|scientist|researcher)\b/gi;
  const titleMatches = text.match(titlePatterns);
  if (titleMatches) jobTitleCount = new Set(titleMatches.map(t => t.toLowerCase())).size;

  // Count action verbs
  const { count: verbCount } = countMatches(text, ACTION_VERBS);
  actionVerbCount = verbCount;

  // Quantifiable results
  const quantCount = countRegexMatches(text, QUANTIFIABLE_PATTERNS);

  // Score calculation
  let score = 0;
  score += Math.min(30, experienceYears * 6);              // Up to 30 for years
  score += Math.min(20, jobTitleCount * 7);                 // Up to 20 for roles
  score += Math.min(25, actionVerbCount * 2.5);             // Up to 25 for action verbs
  score += Math.min(25, quantCount * 5);                    // Up to 25 for metrics

  return {
    score: clamp(Math.round(score), 0, 100),
    experienceYears,
    jobTitleCount,
    actionVerbCount,
    quantifiableResults: quantCount,
  };
}

/**
 * Extract a specific section from resume text.
 * Looks for a section header (e.g. "Experience") and captures text
 * until the next recognized section header.
 */
function extractSection(text, sectionName) {
  const sectionHeaders = [
    'experience', 'work experience', 'professional experience', 'employment',
    'education', 'academic', 'qualification',
    'skills', 'technical skills', 'core competencies',
    'projects', 'personal projects', 'portfolio',
    'certifications', 'certificates', 'achievements',
    'summary', 'objective', 'profile',
    'publications', 'research', 'volunteer', 'references',
    'awards', 'accomplishments', 'interests', 'hobbies',
  ];

  const lower = text.toLowerCase();
  const lines = text.split('\n');

  // Find the start of the target section
  let startIdx = -1;
  const sectionLower = sectionName.toLowerCase();
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase().trim();
    if (lineLower.includes(sectionLower) && lineLower.length < 60) {
      // Check it's likely a header (short line containing the section name)
      startIdx = i + 1;
      break;
    }
  }

  if (startIdx === -1) return null;

  // Find the end (next section header)
  let endIdx = lines.length;
  for (let i = startIdx; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase().trim();
    if (lineLower.length > 0 && lineLower.length < 60) {
      for (const header of sectionHeaders) {
        if (header === sectionLower) continue; // skip the current section name
        if (lineLower.includes(header) && !lineLower.includes('experience with')) {
          endIdx = i;
          break;
        }
      }
      if (endIdx !== lines.length) break;
    }
  }

  return lines.slice(startIdx, endIdx).join('\n');
}

function scoreProjects(text) {
  const lower = text.toLowerCase();

  // Count project mentions
  const projectHeaders = lower.match(/\b(project[s]?|portfolio|personal project|side project|academic project|capstone|thesis)\b/g);
  const projectCount = projectHeaders ? projectHeaders.length : 0;

  // Count GitHub/portfolio links
  const linkPatterns = /(?:github\.com|gitlab\.com|bitbucket\.org|portfolio|live demo|deployed|hosted|heroku|vercel|netlify)/gi;
  const linkMatches = text.match(linkPatterns);
  const linkCount = linkMatches ? linkMatches.length : 0;

  // Count tech stack mentions in project context
  const { count: techInProjects } = countMatches(text, TECHNICAL_SKILLS);

  let score = 0;
  if (projectCount === 0 && linkCount === 0) score = 0;
  else {
    score += Math.min(40, projectCount * 15);               // Up to 40 for project count
    score += Math.min(30, linkCount * 10);                   // Up to 30 for links
    score += Math.min(30, Math.floor(techInProjects / 3) * 10); // Up to 30 for tech diversity
  }

  return {
    score: clamp(Math.round(score), 0, 100),
    projectCount,
    linkCount,
  };
}

function scoreEducation(text) {
  const { count, found } = countMatches(text, EDUCATION_KEYWORDS);

  // Check for degree level
  const lower = text.toLowerCase();
  const hasPhD = /\b(ph\.?d|doctorate|doctoral)\b/i.test(lower);
  const hasMasters = /\b(master|m\.?tech|m\.?s\.?|m\.?a\.?|mba|m\.?sc|mca)\b/i.test(lower);
  const hasBachelors = /\b(bachelor|b\.?tech|b\.?e\.?|b\.?s\.?|b\.?a\.?|b\.?sc|bca)\b/i.test(lower);
  const hasDiploma = /\b(diploma|associate)\b/i.test(lower);

  // Check for GPA
  const hasGPA = /\b(gpa|cgpa|grade|percentage)\s*[:=]?\s*[\d.]+/i.test(lower);

  let score = 0;
  if (hasPhD) score += 40;
  else if (hasMasters) score += 35;
  else if (hasBachelors) score += 30;
  else if (hasDiploma) score += 20;

  if (hasGPA) score += 15;

  // Relevant field bonus
  const relevantFields = ['computer science', 'software engineering', 'information technology',
    'data science', 'artificial intelligence', 'computer engineering'];
  for (const field of relevantFields) {
    if (lower.includes(field)) { score += 15; break; }
  }

  // University/institution mentioned
  if (/\b(university|institute|college|school of)\b/i.test(lower)) score += 10;

  // Honors
  if (/\b(honors|honours|cum laude|distinction|first class|dean.?s list)\b/i.test(lower)) score += 10;

  return { score: clamp(score, 0, 100), hasPhD, hasMasters, hasBachelors, hasDiploma, hasGPA };
}

function scoreCertifications(text) {
  const { count, found } = countMatches(text, CERTIFICATION_KEYWORDS);

  let score = 0;
  if (count === 0) score = 0;
  else if (count === 1) score = 40;
  else if (count === 2) score = 60;
  else if (count <= 4) score = 75;
  else if (count <= 6) score = 85;
  else score = Math.min(100, 85 + (count - 6) * 3);

  return { score: clamp(score, 0, 100), count, found };
}

function scoreKeywordRelevance(text) {
  // Count action verbs
  const { count: verbCount } = countMatches(text, ACTION_VERBS);

  // Count quantifiable achievements
  const quantCount = countRegexMatches(text, QUANTIFIABLE_PATTERNS);

  // Industry buzzwords density
  const words = text.split(/\s+/).length;
  const { count: skillCount } = countMatches(text, TECHNICAL_SKILLS);
  const keywordDensity = words > 0 ? (skillCount / words) * 100 : 0;

  let score = 0;
  score += Math.min(35, verbCount * 3);          // Action verbs
  score += Math.min(35, quantCount * 7);          // Quantifiable results
  score += Math.min(30, keywordDensity * 15);     // Keyword density (sweet spot ~2-5%)

  return { score: clamp(Math.round(score), 0, 100), verbCount, quantCount, keywordDensity: Math.round(keywordDensity * 100) / 100 };
}

function scoreStructure(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const lower = text.toLowerCase();

  // Check for clear sections
  const { count: sectionCount } = countMatches(text, SECTION_KEYWORDS);

  // Check line count (too short or too long is bad)
  const lineCount = lines.length;

  // Check for bullet points
  const bulletLines = lines.filter(l => /^\s*[•\-\*▪▸➤►◦‣⁃]\s/.test(l)).length;

  // Check for consistent formatting
  const hasHeaders = /\b(experience|education|skills|projects|summary)\s*[:|\n]/gi.test(lower);

  // Check text length (optimal 400-1200 words for 1-2 pages)
  const wordCount = text.split(/\s+/).length;

  let score = 0;

  // Sections (up to 30)
  score += Math.min(30, sectionCount * 5);

  // Bullet points usage (up to 25)
  score += Math.min(25, bulletLines * 2);

  // Document length (up to 25)
  if (wordCount >= 200 && wordCount <= 1500) score += 25;
  else if (wordCount >= 100 && wordCount <= 2000) score += 15;
  else if (wordCount >= 50) score += 8;

  // Headers (up to 20)
  if (hasHeaders) score += 20;

  return { score: clamp(score, 0, 100), sectionCount, bulletLines, wordCount };
}

function scoreCompleteness(text) {
  const lower = text.toLowerCase();

  // Contact info
  const hasEmail = /[\w.-]+@[\w.-]+\.\w{2,}/i.test(text);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/g.test(text);
  const hasLinkedIn = /linkedin/i.test(lower);
  const hasGitHub = /github/i.test(lower);
  const hasPortfolio = /portfolio|website|personal site/i.test(lower);

  // Key sections present
  const hasSummary = /\b(summary|objective|profile|about)\b/i.test(lower);
  const hasExperience = /\b(experience|employment|work history)\b/i.test(lower);
  const hasEducation = /\b(education|academic|qualification)\b/i.test(lower);
  const hasSkills = /\b(skills|competencies|proficiencies|technologies)\b/i.test(lower);
  const hasProjects = /\b(projects?|portfolio)\b/i.test(lower);

  let score = 0;

  // Contact info (up to 25)
  if (hasEmail) score += 10;
  if (hasPhone) score += 5;
  if (hasLinkedIn) score += 5;
  if (hasGitHub || hasPortfolio) score += 5;

  // Key sections (up to 75)
  if (hasSummary) score += 15;
  if (hasExperience) score += 20;
  if (hasEducation) score += 15;
  if (hasSkills) score += 15;
  if (hasProjects) score += 10;

  return {
    score: clamp(score, 0, 100),
    hasEmail, hasPhone, hasLinkedIn, hasGitHub, hasPortfolio,
    hasSummary, hasExperience, hasEducation, hasSkills, hasProjects,
  };
}

// ── Main ATS Scorer ──

const WEIGHTS = {
  skills:         0.20,
  experience:     0.20,
  projects:       0.15,
  education:      0.10,
  certifications: 0.05,
  keywords:       0.10,
  structure:      0.10,
  completeness:   0.10,
};

function calculateAtsScore(resumeText) {
  const skills = scoreSkills(resumeText);
  const experience = scoreExperience(resumeText);
  const projects = scoreProjects(resumeText);
  const education = scoreEducation(resumeText);
  const certifications = scoreCertifications(resumeText);
  const keywords = scoreKeywordRelevance(resumeText);
  const structure = scoreStructure(resumeText);
  const completeness = scoreCompleteness(resumeText);

  const weightedScore = Math.round(
    skills.score         * WEIGHTS.skills +
    experience.score     * WEIGHTS.experience +
    projects.score       * WEIGHTS.projects +
    education.score      * WEIGHTS.education +
    certifications.score * WEIGHTS.certifications +
    keywords.score       * WEIGHTS.keywords +
    structure.score      * WEIGHTS.structure +
    completeness.score   * WEIGHTS.completeness
  );

  const atsScore = clamp(weightedScore, 0, 100);

  return {
    atsScore,
    atsBreakdown: {
      technical_skills:   { score: skills.score,         weight: '20%', details: `${skills.count} skills detected` },
      work_experience:    { score: experience.score,     weight: '20%', details: `${experience.experienceYears}yr exp, ${experience.actionVerbCount} action verbs, ${experience.quantifiableResults} metrics` },
      projects:           { score: projects.score,       weight: '15%', details: `${projects.projectCount} projects, ${projects.linkCount} links` },
      education:          { score: education.score,      weight: '10%', details: education.hasPhD ? 'PhD' : education.hasMasters ? 'Masters' : education.hasBachelors ? 'Bachelors' : education.hasDiploma ? 'Diploma' : 'Not detected' },
      certifications:     { score: certifications.score, weight: '5%',  details: `${certifications.count} certifications detected` },
      keyword_relevance:  { score: keywords.score,       weight: '10%', details: `${keywords.verbCount} action verbs, ${keywords.quantCount} metrics, ${keywords.keywordDensity}% density` },
      resume_structure:   { score: structure.score,      weight: '10%', details: `${structure.sectionCount} sections, ${structure.bulletLines} bullets, ${structure.wordCount} words` },
      completeness:       { score: completeness.score,   weight: '10%', details: [
        completeness.hasEmail ? 'Email ✓' : 'Email ✗',
        completeness.hasPhone ? 'Phone ✓' : 'Phone ✗',
        completeness.hasLinkedIn ? 'LinkedIn ✓' : 'LinkedIn ✗',
        completeness.hasSummary ? 'Summary ✓' : 'Summary ✗',
        completeness.hasExperience ? 'Experience ✓' : 'Experience ✗',
        completeness.hasSkills ? 'Skills ✓' : 'Skills ✗',
      ].join(', ') },
    },
    detectedSkills: skills.found,
  };
}

module.exports = { calculateAtsScore };
