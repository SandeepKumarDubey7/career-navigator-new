# 🧭 AI Career Navigator

An AI-powered resume analysis platform that predicts your best-fit job role, scores your resume with a **deterministic ATS scoring engine**, identifies dynamic skill gaps, and generates **personalized career roadmaps** — powered by **Groq's LLaMA 3.3 70B** model.

**Live Demo:** [AI Career Navigator](https://career-navigator-new-lemon.vercel.app/)

**Built for [Digital Heroes](https://digitalheroesco.com)**

---

## ✨ Features

- **📄 Resume Upload** — Drag-and-drop or browse to upload resumes in PDF, DOC, or DOCX format (up to 5 MB).
- **🤖 AI Role Prediction** — Predicts the most suitable job role from 24+ canonical roles based purely on resume content, with confidence level and experience classification.
- **📊 Deterministic ATS Score** — Formula-based scoring (not LLM-generated) across 8 weighted dimensions with a transparent breakdown. Same resume always produces the same score.
- **⚡ Dynamic Missing Skills** — Identifies skills missing from your resume that are commonly required for the predicted or target role. Never returns generic skills.
- **🎯 Target Job Analysis** — Specify a desired career field for tailored skill-gap analysis with actionable improvements, tools to learn, and project ideas.
- **🗺️ Career Roadmap** — Personalized 12-month learning path with prioritized skills, tools, certifications, and project recommendations.
- **✅ Detected Skills** — Shows all technical skills found in your resume.
- **💾 Persistent Storage** — Every analysis is saved to MongoDB for future reference.
- **🔄 Smart Retry Logic** — Built-in retry mechanism with exponential backoff for API rate limits.

---

## 📊 ATS Scoring Formula

The ATS score is **100% deterministic** — calculated by parsing resume text, not by LLM. Same resume always produces the same score.

```
ATS Score = Σ (dimension_score × weight)
```

| Dimension | Weight | What It Measures |
|---|---|---|
| **Technical Skills** | 20% | Count of recognized skills from 200+ keyword dictionary |
| **Work Experience** | 20% | Years (from Experience section only), action verbs, quantifiable metrics |
| **Projects** | 15% | Project mentions, GitHub/portfolio links, tech diversity |
| **Education** | 10% | Degree level, GPA, relevant field, honors |
| **Certifications** | 5% | Industry certifications and course platforms detected |
| **Keyword Relevance** | 10% | Action verbs, quantifiable results, keyword density |
| **Resume Structure** | 10% | Sections, bullet points, word count, headers |
| **Completeness** | 10% | Contact info, LinkedIn, key sections present |

**Expected ranges:**
- Weak resume: 40–60
- Average resume: 60–80
- Strong resume: 80–95

---

## 🛠️ Tech Stack

| Layer        | Technology                                                 |
| ------------ | ---------------------------------------------------------- |
| **Frontend** | React 19, Vite 8, Axios, Vanilla CSS                       |
| **Backend**  | Node.js, Express.js                                        |
| **AI**       | Groq SDK — LLaMA 3.3 70B Versatile (via Groq Cloud API)   |
| **ATS Engine** | Custom deterministic scorer (atsScorer.js)              |
| **Database** | MongoDB Atlas (Mongoose ODM)                               |
| **Upload**   | Multer (in-memory storage), pdf-parse (PDF text extraction)|
| **Hosting**  | Vercel (Frontend), Render (Backend)                        |

---

## 📁 Folder Structure

```
career-navigator/
├── backend/
│   ├── ai/
│   │   ├── groq.js              # AI orchestrator (role prediction + skill gap + roadmap)
│   │   └── atsScorer.js         # Deterministic ATS scoring engine
│   ├── models/
│   │   └── Resume.js            # Mongoose schema for resume data
│   ├── routes/
│   │   └── resume.js            # API routes for resume upload & analysis
│   ├── server.js                # Express server entry point
│   ├── package.json
│   └── .env                     # Environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResumeUpload.jsx   # File upload with drag & drop + target field input
│   │   │   ├── ResultDisplay.jsx  # Analysis results (role, ATS breakdown, skills, roadmap)
│   │   │   └── LoadingSpinner.jsx # Loading state indicator
│   │   ├── App.jsx              # Main application component
│   │   ├── App.css              # Application styles
│   │   ├── main.jsx             # Vite entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
```

---

## 🏗️ Architecture

```
┌──────────────────────┐         ┌──────────────────────┐         ┌────────────────┐
│      React Frontend  │  POST   │   Express Backend    │  API    │   Groq Cloud   │
│                      │ ──────► │                      │ ──────► │  (LLaMA 3.3)   │
│  • Resume Upload     │         │  • PDF text extract  │         │                │
│  • Target Field      │         │  • ATS scoring       │ ◄────── │  JSON response │
│  • Results Display   │ ◄────── │  • AI orchestration  │         └────────────────┘
│  • Career Roadmap    │  JSON   │  • MongoDB storage   │
└──────────────────────┘         └──────────┬───────────┘
                                            │
                                            ▼
                                   ┌────────────────┐
                                   │  MongoDB Atlas  │
                                   │  (Resume Data)  │
                                   └────────────────┘
```

### AI Pipeline (Three-Step Analysis)

1. **ATS Score** — Deterministic formula-based scoring via `atsScorer.js`. Parses resume text, counts skills, experience, projects, education, certifications, keywords, structure, and completeness. No LLM involved.
2. **Step 1 — Role Prediction** — Sends resume text to the AI _without_ any user preference for unbiased role prediction, experience level, confidence, and evidence-backed missing skills.
3. **Step 2 — Skill Gap Analysis** _(optional)_ — If the user specifies a target field, a separate AI call compares the resume against that role for missing skills, tools, improvements, and project ideas.
4. **Step 3 — Career Roadmap** — Generates a personalized 12-month roadmap with prioritized skills, tools, certifications, project recommendations, and learning milestones.

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** cluster (free tier works fine)
- A **Groq API Key** — get one at [console.groq.com](https://console.groq.com)

### 1. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
MONGO_URI=your_mongodb_connection_string_here
PORT=5000
```

Start the backend server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 2. Setup the Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## 📡 API Reference

### `GET /`

Health check endpoint.

**Response:**
```json
{ "message": "Career Navigator API is running" }
```

---

### `POST /api/analyze-resume`

Uploads a resume file and returns AI-powered analysis.

**Request:**
- Content-Type: `multipart/form-data`
- Body:

| Field         | Type   | Required | Description                                   |
| ------------- | ------ | -------- | --------------------------------------------- |
| `resume`      | File   | ✅ Yes   | Resume file (PDF, DOC, or DOCX — max 5 MB)    |
| `targetField` | String | ❌ No    | Desired career field (e.g., "Data Scientist")  |

**Success Response** `200`:
```json
{
  "success": true,
  "data": {
    "role": "Full Stack Developer",
    "confidence": "high",
    "experienceLevel": "Junior",
    "missingSkills": ["TypeScript", "Docker", "AWS", "Redis"],
    "atsScore": 76,
    "atsBreakdown": {
      "technical_skills": { "score": 98, "weight": "20%", "details": "29 skills detected" },
      "work_experience": { "score": 45, "weight": "20%", "details": "1yr exp, 7 action verbs, 1 metrics" },
      "projects": { "score": 100, "weight": "15%", "details": "4 projects, 4 links" },
      "education": { "score": 70, "weight": "10%", "details": "Bachelors" },
      "certifications": { "score": 85, "weight": "5%", "details": "5 certifications detected" },
      "keyword_relevance": { "score": 58, "weight": "10%", "details": "7 action verbs, 1 metrics" },
      "resume_structure": { "score": 100, "weight": "10%", "details": "12 sections, 28 bullets" },
      "completeness": { "score": 85, "weight": "10%", "details": "Email ✓, Phone ✓, LinkedIn ✓" }
    },
    "detectedSkills": ["javascript", "python", "react", "mongodb", "node.js"],
    "targetField": "Data Scientist",
    "targetImprovements": [
      "Skills to learn: TensorFlow, PyTorch, Feature Engineering",
      "Tools to master: Jupyter, Scikit-learn, SageMaker",
      "Project idea: Build a sentiment analysis dashboard"
    ],
    "roadmap": {
      "skills_to_learn": [
        { "skill": "TensorFlow", "priority": "high", "reason": "Essential for ML roles" }
      ],
      "tools_to_master": [
        { "tool": "Jupyter Notebook", "priority": "high", "reason": "Standard for data science" }
      ],
      "certifications": [
        { "name": "AWS ML Specialty", "provider": "Amazon", "priority": "medium" }
      ],
      "project_recommendations": [
        { "title": "Sentiment Analyzer", "description": "NLP project", "skills_demonstrated": ["Python", "NLP"] }
      ],
      "learning_path": {
        "month_1_3": { "focus": "Foundations", "goals": ["Learn Python for DS", "Statistics basics"] },
        "month_4_6": { "focus": "Core ML", "goals": ["Build 2 ML projects"] },
        "month_7_12": { "focus": "Specialization", "goals": ["Deploy ML model to production"] }
      }
    }
  }
}
```

**Error Response** `400`:
```json
{ "error": "The uploaded document does not appear to be a valid resume." }
```

---

## 🗄️ Database Schema

**Collection:** `resumes`

| Field                | Type       | Description                              |
| -------------------- | ---------- | ---------------------------------------- |
| `resumeText`         | String     | Extracted text from the resume (max 10K)  |
| `role`               | String     | AI-predicted job role                     |
| `missingSkills`      | [String]   | Skills the resume is lacking             |
| `atsScore`           | Number     | ATS compatibility score (0–100)          |
| `atsBreakdown`       | Object     | Per-dimension score breakdown            |
| `detectedSkills`     | [String]   | Technical skills found in the resume     |
| `experienceLevel`    | String     | Intern / Junior / Mid / Senior / Lead    |
| `targetField`        | String     | User's desired career field (optional)   |
| `targetImprovements` | [String]   | Actionable career transition suggestions |
| `roadmap`            | Object     | Personalized career roadmap              |
| `createdAt`          | Date       | Timestamp of the analysis                |

---

## 👤 Author

**Sandeep Kumar Dubey**
- Email: sandeepdk180@gmail.com
- GitHub: [@SandeepKumarDubey7](https://github.com/SandeepKumarDubey7)

Built for [Digital Heroes](https://digitalheroesco.com)

---

## 🔮 Future Improvements

- [ ] User authentication and dashboard to view past analyses
- [ ] Support for more file formats (TXT, LinkedIn PDF exports)
- [ ] Resume comparison — track improvement over time
- [ ] Interview preparation module matching predicted roles
