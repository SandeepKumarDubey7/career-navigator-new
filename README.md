# 🧭 AI Career Navigator

An AI-powered resume analysis platform that predicts your best-fit job role, scores your resume against ATS standards, identifies skill gaps, and provides personalized career transition roadmaps — all powered by **Groq's LLaMA 3.3 70B** model.

**Live Demo:** [AI Career Navigator](https://career-navigator-new-lemon.vercel.app/)

---

## ✨ Features

- **📄 Resume Upload** — Drag-and-drop or browse to upload resumes in PDF, DOC, or DOCX format (up to 5 MB).
- **🤖 AI Role Prediction** — Automatically predicts the most suitable job role based purely on resume content using LLaMA 3.3.
- **📊 ATS Score** — Rates your resume from 0–100 on ATS (Applicant Tracking System) compatibility with a visual progress bar.
- **⚡ Missing Skills Detection** — Identifies key skills missing from your resume for your predicted role.
- **🎯 Target Job Analysis** — Optionally specify a desired career field to receive a tailored skill-gap analysis with actionable improvement suggestions, tools to learn, and project ideas.
- **💾 Persistent Storage** — Every analysis is saved to MongoDB for future reference and analytics.
- **🔄 Smart Retry Logic** — Built-in retry mechanism with exponential backoff to handle API rate limits gracefully.

---

## 🛠️ Tech Stack

| Layer        | Technology                                                 |
| ------------ | ---------------------------------------------------------- |
| **Frontend** | React 19, Vite 8, Axios, Vanilla CSS                       |
| **Backend**  | Node.js, Express.js                                        |
| **AI**       | Groq SDK — LLaMA 3.3 70B Versatile (via Groq Cloud API)   |
| **Database** | MongoDB Atlas (Mongoose ODM)                               |
| **Upload**   | Multer (in-memory storage), pdf-parse (PDF text extraction)|

---

## 📁 Folder Structure

```
career-navigator/
├── backend/
│   ├── ai/
│   │   └── groq.js              # AI analysis logic (role prediction + skill gap)
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
│   │   │   ├── ResultDisplay.jsx  # Analysis results (role, ATS score, skills, improvements)
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
│  • Target Field      │         │  • AI orchestration  │ ◄────── │  JSON response │
│  • Results Display   │ ◄────── │  • MongoDB storage   │         └────────────────┘
└──────────────────────┘  JSON   └──────────┬───────────┘
                                            │
                                            ▼
                                   ┌────────────────┐
                                   │  MongoDB Atlas  │
                                   │  (Resume Data)  │
                                   └────────────────┘
```

### AI Pipeline (Two-Step Analysis)

1. **Step 1 — Role Prediction**: Sends resume text to the AI _without_ any user preference to get an unbiased role prediction, ATS score, and detected/missing skills.
2. **Step 2 — Skill Gap Analysis** _(optional)_: If the user specifies a target field, a separate AI call compares the resume against that role to generate missing skills, tools to master, resume improvements, and project suggestions.

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

_(Optional)_ Create a `.env` file in the `frontend/` directory to override the API URL:

```env
VITE_API_URL=http://localhost:5000/api
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
    "role": "Frontend Developer",
    "missingSkills": ["TypeScript", "Testing"],
    "atsScore": 72,
    "targetField": "Data Scientist",
    "targetImprovements": [
      "Skills to learn: Python, TensorFlow, Pandas",
      "Tools to master: Jupyter, Scikit-learn",
      "Add a machine learning project to your portfolio",
      "Project idea: Build a sentiment analysis dashboard"
    ]
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
| `targetField`        | String     | User's desired career field (optional)   |
| `targetImprovements` | [String]   | Actionable career transition suggestions |
| `createdAt`          | Date       | Timestamp of the analysis                |

---

## 🔮 Future Improvements

- [ ] User authentication and dashboard to view past analyses
- [ ] Support for more file formats (TXT, LinkedIn PDF exports)
- [ ] Resume comparison — track improvement over time
- [ ] Interview preparation module matching predicted roles
